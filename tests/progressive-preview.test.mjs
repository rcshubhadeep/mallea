import test from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate as immediate} from 'node:timers/promises';
import {createLiveAuthor} from '../services/workspace/live-author.mjs';
import {authoringPolicy} from '../packages/sdk/authoring-policy.mjs';
import {createCollaborationServer} from '../services/workspace/collaboration.mjs';
import {acceptsShapeJobUpdate,systemSurfaces} from '../packages/sdk/framework-live.mjs';

const config={endpoint:new URL('https://example.invalid/v1/chat/completions'),model:'synthetic/model',key:'PRIVATE_KEY',mode:'tools'};
const contract={fields:{},actions:{},components:[],permissions:[]};
const app=()=>({manifest:{id:'study',title:'Study',version:'0.4.0',sdkVersion:'0.4',permissions:[]},revision:0,layout:'rows',surfaces:[{id:'existing',title:'Existing',version:1,slot:'main',width:'wide',lifetime:'persistent',hidden:false,ui:{id:'input',type:'input',bind:'models.note.text'}}],models:{note:{fields:{text:{type:'text',initial:''}},values:{text:'PRIVATE_LIVE_VALUE'}}}});
const first={op:'setSurface',id:'existing',props:{title:'First validated title'}},second={op:'editSurface',id:'existing',changes:[{op:'set',id:'input',props:{label:'Second validated edit'}}]};
const call=(name,args)=>({choice:{finish_reason:'tool_calls',message:{tool_calls:[{id:name,type:'function',function:{name,arguments:JSON.stringify(args)}}]}},usage:{total_tokens:1}});
async function until(read,predicate){for(let i=0;i<150;i++){const value=read();if(predicate(value))return value;await immediate();}throw Error('Expected state did not arrive: '+JSON.stringify(read()));}
function harness(initial=app()){
 let current=initial,saved;const replies=[];
 const author=createLiveAuthor({definition:{},active:()=>structuredClone(current),state:()=>({active:current.revision}),saveDraft:(...args)=>{saved=args;}},{config,contract,policy:authoringPolicy(null,'app'),infer:()=>new Promise((resolve,reject)=>replies.push({resolve,reject}))});
 return{author,replies,get current(){return current;},set current(v){current=v;},get saved(){return saved;},async reply(response){await until(()=>replies.length,n=>n>0);replies.shift().resolve(response);await immediate();}};
}

test('renderer rejects old job/base/sequence responses and cannot revive a cancelled preview',()=>{
 // Preserve the original approval guard for generated hosts predating progressive previews.
 assert.equal(systemSurfaces.builder.ui.children.find(n=>n.id==='approve').disabledBind,'system.noPreview');
 assert.match(systemSurfaces.builder.ui.children.find(n=>n.id==='preview-heading').text,/separate copy/);
 const current={id:'active',base:4,phase:'repairing',previewSequence:2};
 assert.equal(acceptsShapeJobUpdate(current,{...current,previewSequence:3}),true);
 assert.equal(acceptsShapeJobUpdate(current,{...current,phase:'ready'}),true);
 for(const next of [{...current,id:'old'},{...current,base:3},{...current,previewSequence:1},{id:'active',base:4,phase:'generating'}])assert.equal(acceptsShapeJobUpdate(current,next),false);
 assert.equal(acceptsShapeJobUpdate({...current,phase:'cancelled'},{...current,phase:'ready'}),false);
 assert.equal(acceptsShapeJobUpdate({...current,phase:'ready'},current),false);
 assert.equal(acceptsShapeJobUpdate({...current,phase:'ready'},{...current,phase:'failed'}),true);
});

test('only complete validated tool edits publish monotonic isolated snapshots; finish creates the normal final draft',async()=>{
 const h=harness();try{
  const job=h.author.start('Refine this app');await h.reply(call('apply_draft',{changes:[first]}));
  const one=await until(()=>h.author.get(job.id),j=>j.preview?.sequence===1);assert.equal(one.preview.base,0);assert.equal(one.preview.model.surfaces[0].title,first.props.title);assert(!JSON.stringify(one).includes('PRIVATE_'));assert.equal(h.saved,undefined);assert.equal(h.current.surfaces[0].title,'Existing');
  one.preview.model.surfaces[0].title='Client mutation';assert.equal(h.author.get(job.id).preview.model.surfaces[0].title,first.props.title);
  await h.reply(call('apply_draft',{changes:[{op:'setSurface',id:'unknown',props:{title:'Invalid'}}]}));assert.equal(h.author.get(job.id).preview.sequence,1);assert.equal(h.author.get(job.id).diagnostics.length,1);
  await h.reply(call('apply_draft',{changes:[second]}));const two=await until(()=>h.author.get(job.id),j=>j.preview?.sequence===2);assert.equal(two.preview.model.surfaces[0].title,first.props.title);assert.equal(two.preview.model.surfaces[0].ui.label,'Second validated edit');assert(Buffer.byteLength(JSON.stringify(two.preview))<=256*1024);
  await h.reply(call('finish_draft',{}));const final=await until(()=>h.author.get(job.id),j=>j.phase==='ready');assert.equal(final.preview,undefined);assert.equal(h.saved[1].surfaces[0].ui.label,'Second validated edit');assert.equal(h.current.revision,0);
 }finally{h.author.close();}
});

test('cancel, stale definitions and close clear previews immediately and late tool responses cannot restore them',async()=>{
 for(const reason of ['cancel','stale','close']){const h=harness();try{
  const job=h.author.start('Build');await h.reply(call('apply_draft',{changes:[first]}));assert(h.author.get(job.id).preview);
  if(reason==='cancel')h.author.cancel(job.id);if(reason==='stale')h.current={...h.current,revision:1};if(reason==='close')h.author.close();
  const ended=h.author.get(job.id);assert.equal(ended.preview,undefined);assert.equal(ended.phase,reason==='stale'?'failed':'cancelled');
  await h.reply(call('apply_draft',{changes:[second]}));assert.equal(h.author.get(job.id).preview,undefined);assert.equal(h.author.get(job.id).previewSequence,1);assert.equal(h.saved,undefined);
 }finally{h.author.close();}}
});

test('failure, unsupported and clarification expiry discard snapshots without a saved draft',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date']});
 for(const reason of ['failure','unsupported','expiry']){const h=harness();try{
  const job=h.author.start('Build');await h.reply(call('apply_draft',{changes:[first]}));assert(h.author.get(job.id).preview);
  if(reason==='failure'){h.replies.shift().reject(Error('Synthetic transport failure'));}
  if(reason==='unsupported')await h.reply(call('unsupported',{reason:'Cannot complete',alternative:'Try another request'}));
  if(reason==='expiry'){await h.reply(call('ask_user',{questions:[{id:'title',label:'Which title?',kind:'text'}]}));assert(h.author.get(job.id).preview);t.mock.timers.tick(30*60_000+1);}
  const ended=await until(()=>h.author.get(job.id),j=>['failed','unsupported'].includes(j.phase));assert.equal(ended.preview,undefined);assert.equal(h.saved,undefined);
 }finally{h.author.close();}}
});

test('oversized snapshots are omitted with a bounded notice while normal completion stays available',async()=>{
 const initial=app(),image='data:image/png;base64,'+'A'.repeat(160_000);initial.models.asset={fields:{image:{type:'image',initial:image}},values:{image}};
 const h=harness(initial);try{
  const job=h.author.start('Update a title');await h.reply(call('apply_draft',{changes:[first]}));const partial=h.author.get(job.id);assert.equal(partial.preview.model,undefined);assert.match(partial.preview.unavailable,/too large/);assert(Buffer.byteLength(JSON.stringify(partial.preview))<1024);
  await h.reply(call('finish_draft',{}));assert.equal((await until(()=>h.author.get(job.id),j=>j.phase==='ready')).preview,undefined);assert.equal(h.saved[1].surfaces[0].title,first.props.title);
 }finally{h.author.close();}
});

test('HTTP snapshots stay app-scoped and cannot be installed; owner loss and restart discard them',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});let turn=0,release;
 let s=await createCollaborationServer({engine:true,studio:true,author:{config,infer:async()=>turn++===0?call('apply_draft',{changes:[{op:'createModel',id:'fresh',fields:{text:{type:'text',initial:''}}}]}):new Promise(r=>{release=r;})}});
 const register=id=>{s.engineApps.register({version:1,id,name:id,author:'Test',purpose:'Preview checks',adapter:'surface'});return s.workspaceRegistry.register(id);};
 try{
  const owner=register('owner'),other=register('other');await new Promise(r=>s.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+s.address().port;
  const request=(session,path,body)=>fetch(base+'/api/live/'+path,{headers:{'X-Mallea-Session':session.id,...(body?{'Content-Type':'application/json'}:{})},...(body?{method:'POST',body:JSON.stringify(body)}:{})});
  const response=await request(owner,'author',{request:'Add a model',intent:'add'}),job=await response.json();await until(()=>s.liveApps.job(owner,job.id),j=>!!j.preview);
  assert.equal((await request(owner,'jobs/'+job.id)).status,200);assert.equal((await request(other,'jobs/'+job.id)).status,400);assert.equal((await request(other,'draft?id='+job.id)).status,400);assert.equal((await request(owner,'install',{draftId:job.id,approved:true})).status,400);assert.equal(s.workspaceStore.db.prepare('SELECT COUNT(*) AS n FROM live_drafts').get().n,0);
  s.liveApps.presence(owner.appId);t.mock.timers.tick(3001);assert.equal(s.liveApps.job(owner,job.id).preview,undefined);assert.equal(s.liveApps.job(owner,job.id).phase,'cancelled');release(call('finish_draft',{}));await immediate();assert.equal(s.workspaceStore.db.prepare('SELECT COUNT(*) AS n FROM live_drafts').get().n,0);
  s.workspaceRegistry.close();s.closeAllConnections();await new Promise(r=>s.close(r));s=await createCollaborationServer({engine:true,studio:true,author:{config}});register('owner');assert.throws(()=>s.liveApps.job({appId:'owner'},job.id),/not found/);
 }finally{release?.(call('finish_draft',{}));if(s.listening){s.workspaceRegistry.close();s.closeAllConnections();await new Promise(r=>s.close(r));}else{s.liveApps.close();s.dashboard.close();s.workspaceRegistry.close();s.workspaceStore.close();}}
});
