import assert from 'node:assert/strict';
import { mkdir,writeFile } from 'node:fs/promises';
import { createCollaborationServer } from '../services/workspace/collaboration.mjs';
import { localKey } from '../packages/sdk/surface.mjs';
const flags=process.argv.slice(2);if(flags.some(f=>!['--production','--desktop','--refine'].includes(f)))throw new Error('Options: --production --desktop --refine');
const production=flags.includes('--production'),kind=flags.includes('--desktop')?'scratchpad':'review-board';
const server=await createCollaborationServer({studio:true,author:{production}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;let session='';const records=[];
try{
 const token=(await(await fetch(base+'/api/bootstrap')).json()).token;
 async function call(path,body){const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token,'X-Mallea-Session':session},...(body===undefined?{}:{body:JSON.stringify(body)})});const value=await r.json();if(!r.ok)throw new Error(value.error);return value;}
 session=(await call('register',{kind})).session;const before=(await call('studio/state')).data;let key;
 const prompts=[kind==='review-board'?'Add an extra panel for me, local to my web. I want to add notes there. Stack it horizontally over the present panel':'Add an extra local notes panel above the canvas. Keep the existing canvas and editing controls.'];
 if(flags.includes('--refine'))prompts.push('Move the extra local notes panel to the other side of the existing content and label it Personal notes. Keep its existing local state key and type, and all other working content.');
 for(const [step,prompt]of prompts.entries()){
  const started=Date.now();let job=await call('author',{request:prompt});
  while(!['ready','failed','unsupported','cancelled'].includes(job.phase)){await new Promise(r=>setTimeout(r,300));job=await call(`jobs/${job.id}`);}
  const record={step,phase:job.phase,attempt:job.attempt,usage:job.usage,elapsedMs:Date.now()-started};records.push(record);console.log(JSON.stringify(record));
  if(job.phase!=='ready')throw new Error(job.error??job.unsupported?.reason??job.phase);
  const artifact=await call(`studio/draft?id=${job.id}`),nodes=[];function walk(n){nodes.push(n);for(const c of n.children??[])walk(c);}walk(artifact.ui);
  const note=nodes.find(n=>n.type==='textarea'&&localKey(n.bind));assert(note,'Missing new local textarea');if(step)assert.equal(localKey(note.bind),key);else key=localKey(note.bind);
  if(kind==='review-board')assert(nodes.some(n=>n.type==='image'&&n.bind==='asset.image'),'Existing asset view must remain');
  await call('studio/install',{draftId:job.id,grants:artifact.manifest.permissions});let state=await call('studio/state');
  if(step)assert.equal(state.data.local[key],'A new field owned by this app.');else{await call('studio/local',{version:artifact.manifest.version,expectedRevision:state.localState.revision,values:{...state.data.local,[key]:'A new field owned by this app.'}});state=await call('studio/state');}
  assert.equal(state.data.local[key],'A new field owned by this app.');assert.deepEqual(kind==='review-board'?state.data.asset:state.data.saved,kind==='review-board'?before.asset:before.saved);
  const folder=`.mallea/local-surface-checks/${Date.now()}-${kind}-${step}`;await mkdir(folder,{recursive:true});await writeFile(`${folder}/artifact.json`,JSON.stringify(artifact,null,2));await writeFile(`${folder}/report.json`,JSON.stringify(record,null,2));
 }
 console.log(JSON.stringify({result:'PASS',kind,scope:'Service authoring/local persistence and refinement, not a native UI rehearsal',tokens:records.flatMap(r=>r.usage).reduce((s,u)=>s+(u.total_tokens??0),0),reportedCost:records.flatMap(r=>r.usage).some(u=>typeof u.cost==='number')?records.flatMap(r=>r.usage).reduce((s,u)=>s+(u.cost??0),0):null}));
}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
