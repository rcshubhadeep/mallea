import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {applyLiveChanges} from '../packages/sdk/live-model.mjs';
import {authoringPolicy} from '../packages/sdk/authoring-policy.mjs';
import {createCollaborationServer} from '../services/workspace/collaboration.mjs';

const text={type:'text',initial:''},contract={fields:{},actions:{},permissions:[],primitives:{}};
const empty={manifest:{id:'notes-study',title:'Notes',version:'0.4.0',sdkVersion:'0.4',permissions:[]},revision:0,layout:'rows',surfaces:[],models:{}};
const initialChanges=[{op:'createModel',id:'notes',fields:{draft:text,items:{type:'collection',fields:{text},initial:[]}}},{op:'addSurface',surface:{id:'notes',title:'Notes',lifetime:'persistent',slot:'main',width:'wide',ui:{id:'root',type:'stack',children:[{id:'input',type:'input',label:'Note',bind:'models.notes.draft'},{id:'add',type:'button',label:'Add note',action:'collection.append',args:{binding:'models.notes.items',text:{bind:'models.notes.draft'}}},{id:'saved',type:'repeat',bind:'models.notes.items',template:{id:'row',type:'text',bind:'item.text'}}]}}}];
const extend={op:'extendCollection',id:'notes',field:'items',fields:{tags:text}};
const taggedChanges=[extend,{op:'extendModel',id:'notes',fields:{tagDraft:text}},{op:'editSurface',id:'notes',changes:[{op:'insert',parentId:'root',index:1,node:{id:'tags',type:'input',label:'Tags for first note',bind:'models.notes.tagDraft'}},{op:'insert',parentId:'root',index:2,node:{id:'save-tags',type:'button',label:'Save tags',action:'collection.update',args:{binding:'models.notes.items',index:0,tags:{bind:'models.notes.tagDraft'}}}}]}];
const notes=()=>applyLiveChanges(empty,{changes:initialChanges},contract).artifact;
const config={endpoint:new URL('https://example.com/v1/chat/completions'),model:'test-model',key:'synthetic-key',mode:'tools'};
const manifest={version:1,id:'notes-study',name:'Notes',author:'Test',purpose:'Collection evolution regression',adapter:'surface'};
const call=(name,args)=>({choice:{finish_reason:'tool_calls',message:{tool_calls:[{id:name,type:'function',function:{name,arguments:JSON.stringify(args)}}]}},usage:{}});
async function wait(s,session,id){for(let n=0;n<150;n++){const job=s.liveApps.job(session,id);if(['ready','failed','unsupported'].includes(job.phase))return job;await new Promise(r=>setTimeout(r,5));}throw Error('Job timed out');}
async function close(s){s.liveApps.close();s.dashboard.close();s.workspaceRegistry.close();s.closeAllConnections();if(s.listening)await new Promise(r=>s.close(r));else s.workspaceStore.close();}

test('app-wide collection extension fills defaults without changing saved rows or original schemas',()=>{
 const before=notes();before.models.notes.values.items=[{text:'Private saved note'}];before.models.notes.fields.items.initial=[{text:'Example default'}];
 const next=applyLiveChanges(before,{changes:[extend]},contract,{policy:authoringPolicy(null,'app')}).artifact;
 assert.deepEqual(next.models.notes.values.items,[{text:'Private saved note',tags:''}]);
 assert.deepEqual(next.models.notes.fields.items.initial,[{text:'Example default',tags:''}]);
 assert.deepEqual(before.models.notes.values.items,[{text:'Private saved note'}]);
 assert.deepEqual(next.models.notes.fields.items.fields.text,text);
 assert.deepEqual(next.surfaces,before.surfaces);
 for(const policy of [authoringPolicy(null,'add'),authoringPolicy('notes','app')])assert.throws(()=>applyLiveChanges(before,{changes:[extend]},contract,{scope:policy.scope,policy}));
 for(const invalid of [{...extend,field:'draft'},{...extend,id:'missing'},{...extend,fields:{text}},{...extend,fields:{}},{...extend,fields:{tags:{type:'number',initial:'bad'}}}])assert.throws(()=>applyLiveChanges(before,{changes:[invalid]},contract,{policy:authoringPolicy(null,'app')}));
});

for(const mode of ['tools','json'])test(mode+': whole-app tags draft preserves late notes, approval/replay guards, persistence and old Add controls',async()=>{
 const home=await mkdtemp(join(tmpdir(),'mallea-collection-evolution-')),database=join(home,'workspace.sqlite');let turn=0;
 let s=await createCollaborationServer({engine:true,studio:true,home,database,author:{config:{...config,mode},infer:async(_c,messages)=>{
  const instructions=messages[0].content;assert.match(instructions,/whole.app.*extendCollection/i);assert(!JSON.stringify(messages).includes('Private original note'));
  if(mode==='json'){assert.equal(JSON.parse(messages[1].content).context.scope.intent,'app');return{choice:{finish_reason:'stop',message:{content:JSON.stringify({changes:taggedChanges})}},usage:{}};}
  if(turn++===0){assert.equal(JSON.parse(messages[1].content).policy.intent,'app');return call('lookup_api',{topic:'extendCollection'});}
  if(turn===2)return call('apply_draft',{changes:taggedChanges});
  return call('finish_draft',{});
 }}});
 try{
  s.engineApps.register(manifest);const session=s.workspaceRegistry.register(manifest.id),base=s.liveApps.read(manifest.id);
  const initial=applyLiveChanges(base,{changes:initialChanges},s.liveApps.contract(manifest.id)).artifact;initial.models.notes.values.items=[{text:'Private original note'}];s.liveApps.save(manifest.id,initial,1);
  await new Promise(r=>s.listen(0,'127.0.0.1',r));
  const post=(path,body)=>fetch('http://127.0.0.1:'+s.address().port+'/api/live/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':session.id},body:JSON.stringify(body)});
  const response=await post('author',{request:'Add a tags field for each saved note',intent:'app'});assert.equal(response.status,200);const job=await response.json(),done=await wait(s,session,job.id);assert.equal(done.phase,'ready',JSON.stringify(done));
  assert(!s.liveApps.read(manifest.id).models.notes.fields.items.fields.tags);assert.equal((await post('install',{draftId:job.id,approved:false})).status,400);
  const draft=s.liveApps.draft(session,job.id),tampered=structuredClone(draft.artifact);tampered.models.notes.fields.items.fields.tags.initial='injected';s.workspaceStore.db.prepare('UPDATE live_drafts SET value=? WHERE id=?').run(JSON.stringify(tampered),job.id);
  assert.equal((await post('install',{draftId:job.id,approved:true})).status,400);s.workspaceStore.db.prepare('UPDATE live_drafts SET value=? WHERE id=?').run(JSON.stringify(draft.artifact),job.id);
  const late=s.liveApps.read(manifest.id);late.models.notes.values.items=[{text:'Edited while previewing'},{text:'New while previewing'}];s.liveApps.save(manifest.id,late,2);
  assert.equal((await post('install',{draftId:job.id,approved:true})).status,200);
  assert.deepEqual(s.liveApps.read(manifest.id).models.notes.values.items,[{text:'Edited while previewing',tags:''},{text:'New while previewing',tags:''}]);
  const event=(elementId,event,value)=>s.liveApps.event(session,{surfaceId:'notes',elementId,event,...(value===undefined?{}:{value}),expectedDataRevision:s.liveApps.info(session).dataRevision});
  event('tags','change','work, ideas');event('save-tags','click');event('input','change','Appended with old button');event('add','click');
  assert.deepEqual(s.liveApps.read(manifest.id).models.notes.values.items,[{text:'Edited while previewing',tags:'work, ideas'},{text:'New while previewing',tags:''},{text:'Appended with old button',tags:''}]);
  event('input','change','');assert.throws(()=>event('add','click'),/Write an item/);
  const saved=structuredClone(s.liveApps.read(manifest.id).models);await close(s);s=await createCollaborationServer({engine:true,studio:true,home,database,author:{config}});s.engineApps.register(manifest);
  assert.deepEqual(s.liveApps.read(manifest.id).models,saved);s.liveApps.undo({appId:manifest.id});assert.deepEqual(s.liveApps.read(manifest.id).models,saved);
 }finally{await close(s);await rm(home,{recursive:true,force:true});}
});
