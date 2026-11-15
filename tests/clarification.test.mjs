import test from 'node:test';
import assert from 'node:assert/strict';
import {setImmediate as immediate} from 'node:timers/promises';
import {createLiveAuthor} from '../services/workspace/live-author.mjs';
import {clarificationRequest,clarificationAnswers,clarificationSurface} from '../packages/sdk/clarification.mjs';
import {authoringPolicy} from '../packages/sdk/authoring-policy.mjs';
import {createCollaborationServer} from '../services/workspace/collaboration.mjs';

const config={endpoint:new URL('https://example.invalid/v1/chat/completions'),model:'synthetic/tool-model',key:'PRIVATE_KEY',mode:'tools'};
const contract={fields:{},actions:{},components:[],permissions:[]};
const app=()=>({manifest:{id:'study',title:'Study',version:'0.4.0',sdkVersion:'0.4',permissions:[]},revision:0,layout:'grid',surfaces:[{id:'existing',title:'Existing',version:1,slot:'main',width:'wide',lifetime:'persistent',hidden:false,ui:{id:'existing-input',type:'input',bind:'models.existing.text'}}],models:{existing:{fields:{text:{type:'text',initial:''}},values:{text:'PRIVATE_DATA'}}}});
const questions=[{id:'layout',label:'Which presentation?',kind:'choice',options:[{label:'List',value:'list'},{label:'Cards',value:'cards'}]},{id:'heading',label:'What heading?',kind:'text'}];
const call=(...entries)=>({choice:{finish_reason:'tool_calls',message:{tool_calls:entries.map(([name,args],i)=>({id:'call-'+i,type:'function',function:{name,arguments:JSON.stringify(args)}}))}},usage:{total_tokens:5}});
const ask=()=>call(['ask_user',{questions}]);
const changes=[{op:'createModel',id:'fresh',fields:{text:{type:'text',initial:''}}},{op:'addSurface',surface:{id:'fresh',title:'Fresh',slot:'main',width:'wide',lifetime:'persistent',ui:{id:'fresh-input',type:'input',bind:'models.fresh.text'}}}];
function harness(infer,policy=authoringPolicy(null),profile=config){
 let current=app(),saved;
 const author=createLiveAuthor({definition:{},active:()=>structuredClone(current),state:()=>({active:current.revision}),saveDraft:(...args)=>{saved=args;}},{config:profile,infer,contract,policy});
 return{author,get current(){return current;},set current(v){current=v;},get saved(){return saved;}};
}
async function phase(author,id,expected){for(let i=0;i<100;i++){const j=author.get(id);if(expected.includes(j.phase))return j;await immediate();}throw new Error('Unexpected phase: '+JSON.stringify(author.get(id)));}
const submission=(batch)=>({batchId:batch.batchId,answers:[{id:'layout',value:'cards'},{id:'heading',value:'  My organizer  '}]});

test('clarification validates bounded questions/answers and builds only fixed ordinary system elements',()=>{
 const parsed=clarificationRequest.parse({questions}),batch={...parsed,batchId:'954500dd-5e91-4662-80bd-e3fdc9a25842'};
 assert.equal(clarificationAnswers(submission(batch),batch)[1].value,'My organizer');
 for(const q of [[...questions,...questions],[],[{...questions[0],options:[{label:'A',value:'same'},{label:'B',value:'same'}]}],[questions[0],questions[0]],[{...questions[1],id:'__proto__'}],[{...questions[1],label:'x'.repeat(241)}],[{...questions[1],action:'approve'}]])assert.throws(()=>clarificationRequest.parse({questions:q}));
 for(const input of [{...submission(batch),batchId:'5f8f0c92-1e65-4bbc-b176-09f8c907a222'},{...submission(batch),answers:[{id:'layout',value:'bad'},{id:'heading',value:'Title'}]},{...submission(batch),answers:[{id:'layout',value:'cards'}]},{...submission(batch),answers:[{id:'layout',value:'cards'},{id:'layout',value:'cards'}]},{...submission(batch),answers:[{id:'layout',value:'cards'},{id:'heading',value:' '}]},{...submission(batch),answers:[{id:'layout',value:'cards'},{id:'heading',value:'x'.repeat(1001)}]},{...submission(batch),approved:true}])assert.throws(()=>clarificationAnswers(input,batch));
 const surface=clarificationSurface(batch);assert.equal(surface.ownership,'system');assert(!JSON.stringify(surface).includes('component'));
 assert.equal(surface.ui.children.filter(n=>n.bind?.startsWith('clarification.answer')).length,2);
});

test('questions suspend one pinned draft; only explicit valid answers resume the same config/scope without installing',async()=>{
 let turn=0,seen,selected=config;const policy=authoringPolicy('existing');
 const h=harness(async(settings,messages)=>{assert.equal(settings.model,config.model);assert(!JSON.stringify(messages).includes(config.key));assert(!JSON.stringify(messages).includes('PRIVATE_DATA'));if(turn++===0)return ask();seen=structuredClone(messages);return turn===2?call(['apply_draft',{changes:[{op:'editSurface',id:'existing',changes:[{op:'set',id:'existing-input',props:{label:'Chosen heading'}}]}]}]):call(['finish_draft',{}]);},policy,()=>selected);
 try{
  const before=h.current,job=h.author.start('Ask then rename'),waiting=await phase(h.author,job.id,['awaiting_answers']);
  await immediate();assert.equal(turn,1);assert.equal(h.saved,undefined);assert.equal(h.author.busy(),true);assert.throws(()=>h.author.start('Another'),/already running/);assert.equal(h.author.pendingSurfaces()[0].id,'system-shape-questions');
  assert.throws(()=>h.author.answer(job.id,{...submission(waiting.clarification),answers:[] }));assert.equal(turn,1);
  selected={...config,model:'different/model',key:'DIFFERENT_KEY'};
  h.author.answer(job.id,submission(waiting.clarification));assert.throws(()=>h.author.answer(job.id,submission(waiting.clarification)),/no longer pending/);
  const done=await phase(h.author,job.id,['ready','failed']);assert.equal(done.phase,'ready',JSON.stringify(done));assert.equal(done.clarification,undefined);assert.equal(h.author.pendingSurfaces().length,0);assert.deepEqual(h.current,before);assert.equal(h.saved[4].policy.scope,'existing');
  assert(seen.some(m=>m.role==='tool'&&m.content.includes('My organizer')));assert(!JSON.stringify(done).includes('My organizer'));
 }finally{h.author.close();}
});

test('clarification cannot widen scope and a third batch does not reset error or turn budgets',async()=>{
 let turn=0;const h=harness(async()=>{turn++;return turn===2?call(['apply_draft',{changes:[{op:'setApp',layout:'rows'}]}]):ask();});
 try{
  const job=h.author.start('Ask repeatedly');
  for(let i=0;i<2;i++){const waiting=await phase(h.author,job.id,['awaiting_answers']);h.author.answer(job.id,submission(waiting.clarification));await immediate();}
  const done=await phase(h.author,job.id,['failed']);assert.equal(done.phase,'failed');assert.equal(h.saved,undefined);assert.equal(turn,7);assert.equal(done.diagnostics.length,4);assert.equal(done.clarification,undefined);
 }finally{h.author.close();}
});

test('cancellation, stale definitions and close prevent pending answers or late completion; restart loses questions',async()=>{
 for(const operation of ['cancel','stale','close']){
  let count=0;const h=harness(async()=>{count++;return ask();});
  try{
   const job=h.author.start('Wait'),waiting=await phase(h.author,job.id,['awaiting_answers']);
   if(operation==='cancel')h.author.cancel(job.id);else if(operation==='stale')h.current={...h.current,revision:1};else h.author.close();
   assert.throws(()=>h.author.answer(job.id,submission(waiting.clarification)),operation==='stale'?/stale/:/no longer pending/);
   const done=await phase(h.author,job.id,['failed','cancelled']);assert.equal(done.clarification,undefined);assert.equal(h.saved,undefined);assert.equal(count,1);assert.equal(h.author.pendingSurfaces().length,0);
   const restarted=harness(async()=>ask());assert.throws(()=>restarted.author.answer(job.id,submission(waiting.clarification)));restarted.author.close();
  }finally{h.author.close();}
 }
});

test('waiting pauses inference time and separately expires after thirty minutes',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date']});
 let turn=0;const h=harness(async()=>turn++===0?ask():turn===2?call(['apply_draft',{changes}]):call(['finish_draft',{}]));
 try{
  const job=h.author.start('Wait before continuing'),waiting=await phase(h.author,job.id,['awaiting_answers']);
  t.mock.timers.tick(180_001);await immediate();assert.equal(h.author.get(job.id).phase,'awaiting_answers');
  h.author.answer(job.id,submission(waiting.clarification));assert.equal((await phase(h.author,job.id,['ready','failed'])).phase,'ready');
 }finally{h.author.close();}
 const expired=harness(async()=>ask());
 try{const job=expired.author.start('Expire');const waiting=await phase(expired.author,job.id,['awaiting_answers']);t.mock.timers.tick(30*60_000);await immediate();const done=await phase(expired.author,job.id,['failed']);assert.match(done.error,/expired/);assert.throws(()=>expired.author.answer(job.id,submission(waiting.clarification)));assert.equal(expired.saved,undefined);}finally{expired.author.close();}
});

test('active inference time and model turn budgets remain cumulative across clarification',async t=>{
 t.mock.timers.enable({apis:['setTimeout','Date']});let elapsed=0;
 t.mock.method(performance,'now',()=>elapsed);
 let release,turn=0;const h=harness(async(_settings,_messages,_options,signal)=>{
  if(turn++===0)return new Promise(r=>{release=r;});
  return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));
 });
 try{
  const job=h.author.start('Spend some active time');elapsed=170_000;t.mock.timers.tick(170_000);release(ask());
  const waiting=await phase(h.author,job.id,['awaiting_answers']);elapsed+=200_000;t.mock.timers.tick(200_000);
  h.author.answer(job.id,submission(waiting.clarification));await immediate();
  elapsed+=10_001;t.mock.timers.tick(10_001);assert.equal((await phase(h.author,job.id,['cancelled'])).phase,'cancelled');assert.equal(h.saved,undefined);
 }finally{h.author.close();}
 let calls=0;const bounded=harness(async()=>++calls===11?ask():call(['list_surfaces',{}]));
 try{const job=bounded.author.start('Use turns then ask'),waiting=await phase(bounded.author,job.id,['awaiting_answers']);bounded.author.answer(job.id,submission(waiting.clarification));const done=await phase(bounded.author,job.id,['failed']);assert.match(done.error,/12-model-turn/);assert.equal(calls,12);}finally{bounded.author.close();}
});

test('the last owner disconnect ends its temporary questions after reconnect grace',async t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 const s=await createCollaborationServer({engine:true,studio:true,author:{config,infer:async()=>ask()}});
 s.engineApps.register({version:1,id:'gone',name:'Gone',author:'Test',purpose:'test',adapter:'surface'});
 try{
  const author=s.liveApps.author({appId:'gone'}),job=author.start('Ask');await phase(author,job.id,['awaiting_answers']);
  s.liveApps.presence('gone');t.mock.timers.tick(3001);await immediate();
  assert.equal(author.get(job.id).phase,'cancelled');assert.equal(author.pendingJob(),null);assert.equal(s.liveApps.read('gone').surfaces.length,0);
 }finally{s.workspaceRegistry.close();s.liveApps.close();s.dashboard.close();s.workspaceStore.close();}
});

test('HTTP questions are app-scoped, POST-only, ephemeral and require normal approval after continuation',async()=>{
 let turn=0;const s=await createCollaborationServer({engine:true,studio:true,author:{config,infer:async()=>turn++===0?ask():turn===2?call(['apply_draft',{changes}]):call(['finish_draft',{}])}});
 for(const id of ['owner','other'])s.engineApps.register({version:1,id,name:id,author:'Test',purpose:'test',adapter:'surface'});
 const owner=s.workspaceRegistry.register('owner'),other=s.workspaceRegistry.register('other');await new Promise(r=>s.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+s.address().port;
 const post=(session,path,body)=>fetch(base+'/api/live/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':session.id},body:JSON.stringify(body)});
 try{
  const job=await(await post(owner,'author',{request:'Ask first',intent:'add'})).json();
  const waiting=await phase({get:id=>s.liveApps.job(owner,id)},job.id,['awaiting_answers']);
  assert.equal(s.liveApps.info(owner).clarificationJob.id,job.id);assert.equal(s.liveApps.info(other).clarificationJob,null);
  assert(s.liveApps.inventory('owner').some(v=>v.id==='system-shape-questions'&&v.ownership==='system'&&v.lifetime==='session'));assert(!s.liveApps.inventory('other').some(v=>v.id==='system-shape-questions'));
  assert.equal((await post(other,'jobs/'+job.id+'/answers',submission(waiting.clarification))).status,400);
  const foreign=await fetch(base+'/api/live/jobs/'+job.id,{headers:{'X-Mallea-Session':other.id}});assert.equal(foreign.status,400);assert(!(await foreign.text()).includes('Which presentation'));
  assert.equal((await fetch(base+'/api/live/jobs/'+job.id+'/answers',{headers:{'X-Mallea-Session':owner.id}})).status,405);
  assert.throws(()=>s.liveApps.author(owner,null,null,'app').start('Concurrent'),/already running/);
  assert.equal((await post(owner,'jobs/'+job.id+'/answers',submission(waiting.clarification))).status,200);
  assert.equal((await post(owner,'jobs/'+job.id+'/answers',submission(waiting.clarification))).status,400);
  assert.equal((await phase({get:id=>s.liveApps.job(owner,id)},job.id,['ready','failed'])).phase,'ready');
  assert.equal(s.liveApps.read('owner').surfaces.length,0);assert.equal((await post(owner,'install',{draftId:job.id,approved:false})).status,400);
  assert.equal((await post(owner,'install',{draftId:job.id,approved:true})).status,200);
  const db=s.workspaceStore.db;assert(!JSON.stringify(db.prepare('SELECT * FROM live_system_surfaces').all()).includes('Which presentation'));assert(!JSON.stringify(db.prepare('SELECT * FROM live_drafts').all()).includes('My organizer'));
 }finally{s.workspaceRegistry.close();s.closeAllConnections();await new Promise(r=>s.close(r));}
});
