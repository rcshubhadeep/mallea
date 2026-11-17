import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import WebSocket from 'ws';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {actionInvocation,assertInvocation,invocationSchema} from '../packages/sdk/action-invocation.mjs';
import {applyLiveChanges,validateLive} from '../packages/sdk/live-model.mjs';
import {authoringPolicy} from '../packages/sdk/authoring-policy.mjs';
import {createCollaborationServer} from '../services/workspace/collaboration.mjs';

const userOnly={callers:['user'],requiresUserGesture:true},automationOnly={callers:['automation'],requiresUserGesture:false};
const ref=(appId,elementId='clear')=>({appId,surfaceId:'main',elementId,binding:'$trigger:'+elementId});
const manifest=id=>({version:1,id,name:id,author:'Test',purpose:'Action caller policy checks',adapter:'surface'});
const changes=[{op:'createModel',id:'notes',fields:{text:{type:'text',initial:'New note'},items:{type:'collection',fields:{text:{type:'text',initial:''}},initial:[]}}},{op:'addSurface',surface:{id:'main',title:'Notes',lifetime:'persistent',slot:'main',width:'wide',ui:{id:'root',type:'stack',children:[{id:'input',type:'input',bind:'models.notes.text'},{id:'clear',type:'button',label:'Clear',action:'collection.clear',args:{binding:'models.notes.items'}},{id:'add',type:'button',label:'Add',action:'collection.append',args:{binding:'models.notes.items',text:{bind:'models.notes.text'}}},{id:'remove',type:'button',label:'Remove first',action:'collection.remove',args:{binding:'models.notes.items',index:0}}]}}}];
async function fixture(options={}){
 const s=await createCollaborationServer({engine:true,studio:true,...options}),sessions={},sockets=[];let hook;
 for(const id of ['requester','owner']){s.engineApps.register(manifest(id));const base=s.liveApps.read(id);if(!base.models.notes)s.liveApps.save(id,applyLiveChanges(base,{changes},s.liveApps.contract(id)).artifact,0);}
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 for(const id of ['requester','owner']){const session=s.workspaceRegistry.register(id);sessions[id]=session;const socket=new WebSocket('ws://127.0.0.1:'+s.address().port+'/api/events');sockets.push(socket);await new Promise(r=>socket.once('open',r));const ready=new Promise(r=>socket.on('message',raw=>{if(JSON.parse(raw).type==='connected')r();}));socket.on('message',raw=>{const message=JSON.parse(raw);if(message.type==='invoke'){if(hook){hook(session,message,socket);return;}try{socket.send(JSON.stringify({type:'result',id:message.id,value:s.automations.owner(session,message.arguments)}));}catch{socket.send(JSON.stringify({type:'result',id:message.id,error:true}));}}});socket.send(JSON.stringify({type:'hello',ticket:s.workspaceRegistry.ticket(session)}));await ready;}
 const data=id=>s.liveApps.read(id).models.notes.values.items;
 const setData=(id,items)=>{const app=s.liveApps.read(id);app.models.notes.values.items=items;s.liveApps.save(id,app,s.liveApps.info(sessions[id]).dataRevision+1);};
 const setPolicy=(id,elementId,invocation)=>{const app=s.liveApps.read(id),node=app.surfaces[0].ui.children.find(n=>n.id===elementId);if(invocation===undefined)delete node.invocation;else node.invocation=invocation;app.revision++;validateLive(app,s.liveApps.contract(id));s.liveApps.save(id,app,s.liveApps.info(sessions[id]).dataRevision);s.automations.reconcile();};
 const grant=target=>{s.automations.share(sessions.owner,{surfaceId:'main',shared:true});const g=s.automations.request(sessions.requester,{requesterSurfaceId:'main',resource:target,operation:'action'});s.automations.decide(sessions.owner,{id:g.id,allowed:true});return g.id;};
 return{s,sessions,sockets,data,setData,setPolicy,grant,setHook:fn=>{hook=fn;},close:async()=>{s.workspaceRegistry.close();s.closeAllConnections();await new Promise(r=>s.close(r));}};
}

test('invocation schema denies unknown callers/forged gestures and cannot widen registered action ceilings',()=>{
 for(const invalid of [{callers:['unknown'],requiresUserGesture:false},{callers:['user','user'],requiresUserGesture:false},{callers:['agent'],requiresUserGesture:true},{...userOnly,caller:'user'},null])assert.equal(invocationSchema.safeParse(invalid).success,false);
 assert.deepEqual(actionInvocation('collection.clear'),{callers:['user','agent','automation'],requiresUserGesture:false});assert.deepEqual(actionInvocation('collection.remove'),{callers:['user'],requiresUserGesture:false});
 assert.throws(()=>actionInvocation('adapter.save',{callers:['agent'],requiresUserGesture:false}),/cannot widen/);
 assert.throws(()=>actionInvocation('adapter.save',{callers:['user'],requiresUserGesture:false},userOnly),/cannot widen/);
 assert.throws(()=>assertInvocation(userOnly,{caller:'user',userGesture:false}),/direct user/);
 for(const caller of ['agent','automation','unknown'])assert.throws(()=>assertInvocation(userOnly,{caller,userGesture:false}));
 assert.throws(()=>assertInvocation(actionInvocation('data.set'),{caller:'agent',userGesture:true}));assert.throws(()=>assertInvocation(actionInvocation('data.set'),{caller:'user',userGesture:true,role:'admin'}));
 assert.doesNotThrow(()=>assertInvocation(userOnly,{caller:'user',userGesture:true}));assert.throws(()=>assertInvocation({callers:[],requiresUserGesture:false},{caller:'user',userGesture:true}));
});

test('Core denies protected action calls before data effects or trigger scheduling; trusted user events still work',async()=>{
 const f=await fixture();try{
  f.setData('owner',[{text:'Keep'}]);f.setPolicy('owner','clear',userOnly);const a=f.s.automations,target=ref('owner');f.grant(target);
  let triggers=0;const original=a.event;a.event=()=>{triggers++;};
  for(const caller of ['agent','automation','unknown'])await assert.rejects(()=>a.invoke('requester','main',target,caller));
  assert.deepEqual(f.data('owner'),[{text:'Keep'}]);assert.equal(triggers,0);
  const input={surfaceId:'main',elementId:'clear',event:'click',expectedDataRevision:f.s.liveApps.info(f.sessions.owner).dataRevision};
  assert.throws(()=>f.s.liveApps.event(f.sessions.owner,input,{caller:'user',userGesture:false}),/direct user/);
  f.s.liveApps.event(f.sessions.owner,input);assert.deepEqual(f.data('owner'),[]);assert.equal(triggers,1);a.event=original;
  assert.deepEqual(f.s.liveApps.inventory('owner').find(s=>s.id==='main').elements.find(n=>n.id==='clear').invocation,userOnly);assert.match(f.s.dashboard.data('owner').inventory.find(s=>s.title==='Notes').details,/Clear — You · direct interaction required/);
 }finally{await f.close();}
});

test('MCP action caller is agent, cannot forge user context, and still needs app/Surface grants',async()=>{
 const f=await fixture(),client=new Client({name:'policy-check',version:'1'});try{
  const a=f.s.automations,target=ref('owner','add'),{appId,...resource}=target;f.setPolicy('owner','add',automationOnly);
  await client.connect(new StreamableHTTPClientTransport(new URL('http://127.0.0.1:'+f.s.address().port+'/api/apps/owner/mcp'),{requestInit:{headers:{'X-Mallea-Session':f.sessions.requester.id}}}));
  const call=extra=>client.callTool({name:'invoke_surface_action',arguments:{requesterSurfaceId:'main',resource,...extra}});
  f.grant(target);assert.equal((await call({})).isError,true);assert.deepEqual(f.data('owner'),[]);
  await a.invoke('requester','main',target);assert.deepEqual(f.data('owner'),[{text:'New note'}]);
  const forged=await call({caller:'user',userGesture:true});assert.equal(forged.isError,true);assert.equal(f.data('owner').length,1);
  f.setPolicy('owner','add',{callers:['agent'],requiresUserGesture:false});assert.equal((await call({})).isError,true);f.grant(target);assert.equal((await call({})).isError,undefined);assert.equal(f.data('owner').length,2);
  await assert.rejects(()=>a.invoke('requester','main',target),/does not allow/);
  const discovered=await client.callTool({name:'list_surface_resources',arguments:{}});assert(JSON.parse(discovered.content[0].text).some(r=>r.elementId==='add'&&r.invocation.callers[0]==='agent'));
  const response=await fetch('http://127.0.0.1:'+f.s.address().port+'/api/live/event',{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':f.sessions.owner.id},body:JSON.stringify({surfaceId:'main',elementId:'add',event:'click',caller:'user',userGesture:true,expectedDataRevision:f.s.liveApps.info(f.sessions.owner).dataRevision})});assert.equal(response.status,400);assert.equal(f.data('owner').length,2);
 }finally{await client.close();await f.close();}
});

test('owner rechecks current policy before an in-flight action; forged owner payload cannot change caller',async()=>{
 const f=await fixture();try{
  const a=f.s.automations,target=ref('owner','add');f.grant(target);let observed;
  f.setHook((session,message,socket)=>{observed=message;f.setPolicy('owner','add',userOnly);assert.throws(()=>a.owner(session,{...message.arguments,caller:'user'}));assert.throws(()=>a.owner(session,message.arguments));socket.send(JSON.stringify({type:'result',id:message.id,error:true}));});
  await assert.rejects(()=>a.invoke('requester','main',target,'agent'));assert(observed);assert.deepEqual(f.data('owner'),[]);assert.equal(a.ownerRequests.size,0);
 }finally{await f.close();}
});

test('previously user-only generic actions need an explicit policy plus grants before non-user execution',async()=>{
 const f=await fixture();try{
  const target=ref('owner','remove');f.setData('owner',[{text:'First'},{text:'Second'}]);f.grant(target);
  await assert.rejects(()=>f.s.automations.invoke('requester','main',target,'agent'),/does not allow/);assert.equal(f.data('owner').length,2);
  f.setPolicy('owner','remove',{callers:['agent'],requiresUserGesture:false});await assert.rejects(()=>f.s.automations.invoke('requester','main',target,'agent'),/not approved/);
  f.grant(target);await f.s.automations.invoke('requester','main',target,'agent');assert.deepEqual(f.data('owner'),[{text:'Second'}]);
 }finally{await f.close();}
});

test('legacy grants and caller defaults survive restart; explicit policy changes require fresh approval without resetting data',async()=>{
 const home=await mkdtemp(join(tmpdir(),'mallea-action-policy-'));let f=await fixture({home,database:join(home,'workspace.sqlite')});
 try{
  const target=ref('owner','add'),gid=f.grant(target),resource=f.s.automations.resolve(target);f.setData('owner',[{text:'Saved note'}]);
  const legacyHash=createHash('sha256').update(JSON.stringify([resource.spec,resource.actionName,resource.actionArgs])).digest('hex');assert.equal(JSON.parse(f.s.workspaceStore.db.prepare('SELECT value FROM automation_grants WHERE id=?').get(gid).value).capabilityHash,legacyHash);
  f.setPolicy('owner','remove',userOnly);await f.close();f=await fixture({home,database:join(home,'workspace.sqlite')});
  assert.equal(f.s.automations.grants('requester').find(g=>g.id===gid).status,'allowed');assert.deepEqual(f.data('owner'),[{text:'Saved note'}]);await f.s.automations.invoke('requester','main',target);assert.equal(f.data('owner').length,2);
  await assert.rejects(()=>f.s.automations.invoke('owner','main',ref('owner','remove')),/does not allow/);
  f.setPolicy('owner','add',{callers:['user','agent'],requiresUserGesture:false});assert.equal(f.s.automations.grants('requester').find(g=>g.id===gid).status,'stale');await assert.rejects(()=>f.s.automations.invoke('requester','main',target,'agent'),/not approved/);assert.equal(f.data('owner').length,2);
  f.setPolicy('owner','add',undefined);assert.equal(f.s.automations.grants('requester').find(g=>g.id===gid).status,'stale');await assert.rejects(()=>f.s.automations.invoke('requester','main',target,'agent'),/not approved/);
 }finally{await f.close();await rm(home,{recursive:true,force:true});}
});

test('approved draft replay validates policy changes and rejects tampering without changing saved records',async()=>{
 const f=await fixture();try{
  const live=f.s.liveApps,session=f.sessions.owner,current=live.read('owner'),policy=authoringPolicy(null,'app'),edits=[{op:'editSurface',id:'main',changes:[{op:'set',id:'clear',props:{invocation:userOnly}}]}];
  const result=applyLiveChanges(current,{changes:edits},live.contract('owner'),{policy}),id='policy-draft';f.s.workspaceStore.db.prepare('INSERT INTO live_drafts VALUES(?,?,?,?,?,?)').run(id,'owner',current.revision,JSON.stringify(result.artifact),'Require user click',JSON.stringify({policy,changes:edits}));
  assert.throws(()=>live.install(session,id,false),/Approve/);const tampered=structuredClone(result.artifact);tampered.surfaces[0].ui.children.find(n=>n.id==='clear').invocation={callers:['agent'],requiresUserGesture:false};f.s.workspaceStore.db.prepare('UPDATE live_drafts SET value=? WHERE id=?').run(JSON.stringify(tampered),id);assert.throws(()=>live.install(session,id,true),/authorized operations/);
  f.s.workspaceStore.db.prepare('UPDATE live_drafts SET value=? WHERE id=?').run(JSON.stringify(result.artifact),id);f.setData('owner',[{text:'Edited during preview'}]);live.install(session,id,true);assert.deepEqual(f.data('owner'),[{text:'Edited during preview'}]);assert.deepEqual(live.inventory('owner').find(s=>s.id==='main').elements.find(n=>n.id==='clear').invocation,userOnly);
  const malformed=structuredClone(live.read('owner'));malformed.surfaces[0].ui.children[0].invocation=userOnly;assert.throws(()=>validateLive(malformed,live.contract('owner')),/declared action/);
 }finally{await f.close();}
});
