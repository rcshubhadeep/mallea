import test from 'node:test';
import assert from 'node:assert/strict';
import {createLiveAuthor} from '../services/workspace/live-author.mjs';
import {ModelSettings} from '../services/workspace/model-settings.mjs';
import {applyLiveChanges} from '../packages/sdk/live-model.mjs';
import {authoringPolicy} from '../packages/sdk/authoring-policy.mjs';
import {createCollaborationServer} from '../services/workspace/collaboration.mjs';
import {InferenceError} from '../scripts/lib/inference.mjs';

const contract={fields:{},actions:{},components:[],permissions:[]};
const config={endpoint:new URL('https://example.invalid/v1/chat/completions'),model:'provider/arbitrary-model',key:'TEST_SESSION_SECRET',mode:'tools'};
const app=()=>({manifest:{id:'study',title:'Study',version:'0.4.0',sdkVersion:'0.4',permissions:[]},revision:0,layout:'grid',surfaces:[{id:'existing',title:'Existing',version:1,slot:'main',width:'wide',lifetime:'persistent',hidden:false,ui:{id:'existing-input',type:'input',bind:'models.existing.text'}}],models:{existing:{fields:{text:{type:'text',initial:''}},values:{text:'PRIVATE_LIVE_VALUE'}}}});
const create={op:'createModel',id:'fresh',fields:{text:{type:'text',initial:''}}};
const surface={op:'addSurface',surface:{id:'fresh',title:'Fresh',slot:'main',width:'wide',lifetime:'persistent',ui:{id:'fresh-input',type:'input',bind:'models.fresh.text'}}};
const calls=(...entries)=>({choice:{finish_reason:'tool_calls',message:{role:'assistant',content:null,tool_calls:entries.map(([name,args],i)=>({id:'call-'+i,type:'function',function:{name,arguments:JSON.stringify(args)}}))}},usage:{total_tokens:20}});
const terminal=new Set(['ready','failed','cancelled','unsupported']);
async function wait(author,id){for(let i=0;i<200;i++){const job=author.get(id);if(terminal.has(job.phase))return job;await new Promise(r=>setTimeout(r,2));}throw new Error('Job did not finish');}
function harness(infer,{policy=authoringPolicy(null),initial=app()}={}){let current=initial,saved=null;const store={definition:{},active:()=>structuredClone(current),state:()=>({active:current.revision}),saveDraft:(...args)=>{saved=args;}};const author=createLiveAuthor(store,{config,infer,contract,policy});return{author,get saved(){return saved;},get current(){return current;},set current(v){current=v;}};}

test('independent additions preserve definitions/state/order and reject shared-state or adapter coupling',()=>{
 const before=app(),policy=authoringPolicy(null),apply=changes=>applyLiveChanges(before,{changes},contract,{policy});
 const result=apply([create,surface]).artifact;assert.deepEqual(result.surfaces[0],before.surfaces[0]);assert.deepEqual(result.models.existing,before.models.existing);assert.equal(result.surfaces[1].placement,'independent');assert.equal(before.revision,0);
 for(const changes of [[create,surface,{op:'setApp',layout:'rows'}],[{op:'editSurface',id:'existing',changes:[{op:'set',id:'existing-input',props:{label:'Changed'}}]}],[{op:'extendModel',id:'existing',fields:{extra:{type:'text',initial:''}}}],[{op:'removeSurface',id:'existing'}],[{...surface,surface:{...surface.surface,ui:{id:'shared',type:'input',bind:'models.existing.text'}}}]])assert.throws(()=>apply(changes));
 assert.throws(()=>apply([{...surface,surface:{...surface.surface,ui:{id:'native',type:'component',component:'anything'}}}]));
 assert.doesNotThrow(()=>applyLiveChanges(before,{changes:[{op:'setApp',layout:'rows'}]},contract,{policy:authoringPolicy(null,'app')}));
 assert.throws(()=>authoringPolicy(null,'unrestricted'));
});

test('scoped authoring preserves siblings and cannot extend existing shared schemas',()=>{
 const before=app(),policy=authoringPolicy('existing'),apply=changes=>applyLiveChanges(before,{changes},contract,{scope:'existing',policy});
 assert.throws(()=>apply([{op:'extendModel',id:'existing',fields:{extra:{type:'text',initial:''}}}]),/existing models/);
 assert.throws(()=>apply([surface]),/scope/);
 const next=apply([{op:'editSurface',id:'existing',changes:[{op:'set',id:'existing-input',props:{label:'Renamed'}}]}]).artifact;
 assert.equal(next.surfaces[0].ui.label,'Renamed');assert.deepEqual(next.models,before.models);
});

test('custom profiles normalize endpoints, accept exact arbitrary IDs and keep keys out of public state',()=>{
 const models=new ModelSettings({config});const input={profile:'custom',endpoint:'https://openrouter.ai/api/v1',model:'vendor/my-model',key:'CUSTOM_SECRET',mode:'tools'};
 models.configure(input);assert.equal(models.config().endpoint.href,'https://openrouter.ai/api/v1/chat/completions');assert.equal(models.config().model,input.model);assert(!JSON.stringify(models.public()).includes(input.key));
 const before=models.config();for(const endpoint of ['http://example.invalid','https://user:password@example.invalid','https://example.invalid/?key=secret','https://example.invalid/#secret'])assert.throws(()=>models.configure({...input,endpoint}));
 assert.throws(()=>models.configure({profile:'custom',endpoint:'https://other.invalid/v1'}),/session key/);assert.equal(models.config().endpoint.href,before.endpoint.href);
 assert.throws(()=>models.configure({...input,mode:'automatic-fallback'}));assert.throws(()=>models.configure({...input,key:'bad\nheader'}));assert.throws(()=>models.configure({...input,model:{}}));
 models.configure({profile:'custom',mode:'json'});assert.equal(models.config().mode,'json');
});

test('tool agent looks up authoritative APIs, inspects sanitized state, repairs a draft and finishes without installing',async()=>{
 let turn=0;const seen=[];const h=harness(async(_config,messages,options)=>{
  seen.push(structuredClone(messages));assert(options.tools.some(t=>t.function.name==='lookup_api'));assert(!JSON.stringify(messages).includes(config.key));assert(!JSON.stringify(messages).includes('PRIVATE_LIVE_VALUE'));
  return [calls(['lookup_api',{topic:'addSurface'}],['lookup_api',{topic:'node'}],['inspect_model',{id:'existing'}],['inspect_surface',{id:'existing'}]),calls(['apply_draft',{changes:[{op:'setApp',layout:'rows'}]}]),calls(['apply_draft',{changes:[create,surface]}]),calls(['validate_draft',{}]),calls(['finish_draft',{}])][turn++];
 });
 const initial=structuredClone(h.current),job=h.author.start('Add an independent input');const done=await wait(h.author,job.id);
 assert.equal(done.phase,'ready',JSON.stringify(done));assert.equal(turn,5);assert.equal(done.diagnostics.length,1);assert.equal(done.changes.length,2);assert.equal(h.saved[4].policy.intent,'add');assert.equal(h.saved[4].changes.length,2);assert.deepEqual(h.current,initial);assert.equal(h.saved[1].models.existing.values.text,'PRIVATE_LIVE_VALUE');assert(seen[1].some(m=>m.role==='tool'&&m.content.includes('"$schema"')));h.author.close();
});

test('tool agent rejects invalid envelopes, unknown tools, validation loops and unsupported basic responses within bounds',async()=>{
 for(const infer of [async()=>({choice:{finish_reason:'length',message:{content:'{}'}}}),async()=>({choice:{finish_reason:'stop',message:{content:'{"changes":[]}'}}}),async()=>calls(['execute_shell',{command:'touch'}]),async()=>calls(['finish_draft',{}])]){
  let count=0;const h=harness(async(...args)=>{count++;return infer(...args);}),job=h.author.start('Try a change'),done=await wait(h.author,job.id);assert.equal(done.phase,'failed');assert(count<=5);assert.equal(h.saved,null);h.author.close();
 }
});

test('tool agent bounds turns/calls, supports unsupported outcomes and never retries provider failures',async()=>{
 let count=0;const h=harness(async()=>{count++;return calls(['list_surfaces',{}]);});let j=h.author.start('Keep looking');assert.equal((await wait(h.author,j.id)).phase,'failed');assert.equal(count,12);assert.equal(h.saved,null);h.author.close();
 const many=harness(async()=>calls(...Array.from({length:8},()=>['list_surfaces',{}])));j=many.author.start('Many lookups');const bounded=await wait(many.author,j.id);assert.equal(bounded.phase,'failed');assert.match(bounded.error,/24-tool-call/);many.author.close();
 const unsupported=harness(async()=>calls(['unsupported',{reason:'No such API',alternative:'Use a supported action'}]));j=unsupported.author.start('Unsupported');assert.equal((await wait(unsupported.author,j.id)).phase,'unsupported');assert.equal(unsupported.saved,null);unsupported.author.close();
 count=0;const failure=harness(async()=>{count++;throw new InferenceError('authentication',401);});j=failure.author.start('Provider failure');const done=await wait(failure.author,j.id);assert.equal(count,1);assert.deepEqual(done.failure,{kind:'authentication',status:401});assert.equal(failure.saved,null);failure.author.close();
});

test('cancelled and stale jobs cannot save late results',async()=>{
 for(const cancel of [true,false]){
  let release;const h=harness(()=>new Promise(r=>{release=r;})),job=h.author.start('Wait then change');assert.throws(()=>h.author.start('Concurrent'),/already running/);
  if(cancel)h.author.cancel(job.id);else h.current={...h.current,revision:1};release(calls(['apply_draft',{changes:[create,surface]}]));const done=await wait(h.author,job.id);assert.equal(done.phase,cancel?'cancelled':'failed');assert.equal(h.saved,null);h.author.close();
 }
});

test('Core replays trusted policy on install, retains intervening data and rejects tampered/stale drafts',async()=>{
 let changes=[create,surface];const s=await createCollaborationServer({engine:true,studio:true,author:{config:{...config,mode:'json'},infer:async()=>({choice:{finish_reason:'stop',message:{content:JSON.stringify({changes})}},usage:{}})}});
 try{
  s.engineApps.register({version:1,id:'core-study',name:'Study',author:'Test',purpose:'test',adapter:'surface'});const session={appId:'core-study'},author=s.liveApps.author(session),initial=s.liveApps.read(session.appId);let job=author.start('Add input');let done=await wait(author,job.id);assert.equal(done.phase,'ready',JSON.stringify(done));assert.throws(()=>s.liveApps.install(session,job.id,false),/Approve/);
  const row=s.liveApps.draft(session,job.id);row.artifact.layout=initial.layout==='rows'?'grid':'rows';s.workspaceStore.db.prepare('UPDATE live_drafts SET value=? WHERE id=?').run(JSON.stringify(row.artifact),job.id);assert.throws(()=>s.liveApps.install(session,job.id,true),/authorized operations/);assert.deepEqual(s.liveApps.read(session.appId),initial);
  s.workspaceStore.db.prepare('UPDATE live_drafts SET value=? WHERE id=?').run(row.value,job.id);s.liveApps.install(session,job.id,true);assert.equal(s.liveApps.read(session.appId).surfaces.at(-1).placement,'independent');assert.throws(()=>s.liveApps.install(session,job.id,true),/stale/);
  changes=[{...create,id:'second'},{...surface,surface:{...surface.surface,id:'second',ui:{id:'second-input',type:'input',bind:'models.second.text'}}}];job=author.start('Add another input');assert.equal((await wait(author,job.id)).phase,'ready');s.liveApps.event(session,{surfaceId:'fresh',elementId:'fresh-input',event:'change',value:'Typed while previewing',expectedDataRevision:s.liveApps.info({...session,workspaceId:'local-demo'}).dataRevision});s.liveApps.install(session,job.id,true);assert.equal(s.liveApps.read(session.appId).models.fresh.values.text,'Typed while previewing');assert(!JSON.stringify(s.liveApps.info({...session,workspaceId:'local-demo'})).includes(config.key));
 }finally{s.liveApps.close();s.dashboard.close();s.workspaceStore.close();}
});

test('live HTTP authoring uses tools, serializes app scopes and retains explicit approval',async()=>{
 let release,turn=0;const s=await createCollaborationServer({engine:true,studio:true,author:{config,infer:async()=>{if(turn++===0){await new Promise(r=>{release=r;});return calls(['apply_draft',{changes:[create,surface]}]);}return calls(['finish_draft',{}]);}}});
 s.engineApps.register({version:1,id:'http-study',name:'Study',author:'Test',purpose:'test',adapter:'surface'});const session=s.workspaceRegistry.register('http-study');await new Promise(r=>s.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+s.address().port;
 const post=(path,body)=>fetch(base+'/api/live/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':session.id},body:JSON.stringify(body)});
 try{
  const response=await post('author',{request:'Add input',intent:'add'});assert.equal(response.status,200);const job=await response.json();assert.equal(job.mode,'tools');assert.throws(()=>s.liveApps.author(session,null,null,'app').start('Change theme'),/already running/);
  release();const done=await wait({get:id=>s.liveApps.job(session,id)},job.id);assert.equal(done.phase,'ready');assert.equal(s.liveApps.read(session.appId).surfaces.length,0);assert.equal((await post('install',{draftId:job.id,approved:false})).status,400);assert.equal((await post('install',{draftId:job.id,approved:true})).status,200);assert.equal(s.liveApps.read(session.appId).surfaces.length,1);assert.equal(turn,2);
 }finally{release?.();s.workspaceRegistry.close();s.closeAllConnections();await new Promise(r=>s.close(r));}
});
