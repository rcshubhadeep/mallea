import assert from 'node:assert/strict';
import { createCollaborationServer } from '../services/workspace/collaboration.mjs';
import { validateSurface } from '../packages/sdk/surface.mjs';
import { scratchContract } from '../apps/definitions/studio.mjs';
const production=process.argv.includes('--production');
if(process.argv.slice(2).some(a=>a!=='--production'))throw new Error('Usage: node scripts/verify-surface.mjs [--production]');
const server=await createCollaborationServer({studio:true,author:{production}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;const usage=[];
try{
 const token=(await(await fetch(base+'/api/bootstrap')).json()).token;let session='';
 async function call(path,body){const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token,'X-Mallea-Session':session},...(body===undefined?{}:{body:JSON.stringify(body)})});const v=await r.json();if(!r.ok)throw new Error(v.error);return v;}
 session=(await call('register',{kind:'scratchpad'})).session;
 const before=(await call('studio/state')).data;
 for(const [i,prompt]of [
  'Put a clearly labelled annotation color picker beside my canvas. Retain annotation editing and revision note. Use a split workspace.',
  'Keep the working color control and all current editable fields, but place the controls together above the canvas in a vertical stack. Add the heading Creative controls.'
 ].entries()){
  const started=Date.now();let job=await call('author',{request:prompt});
  while(!['ready','failed','unsupported','cancelled'].includes(job.phase)){await new Promise(r=>setTimeout(r,350));job=await call(`jobs/${job.id}`);}
  usage.push(...job.usage);if(job.phase!=='ready')throw new Error(job.error??job.unsupported?.reason??job.phase);
  const artifact=await call(`studio/draft?id=${job.id}`);validateSurface(artifact,scratchContract);
  const nodes=[];function visit(n){nodes.push(n);for(const c of n.children??[])visit(c);}visit(artifact.ui);
  assert(nodes.some(n=>n.type==='color'&&n.action==='annotation.color'));
  await call('studio/install',{draftId:job.id,grants:artifact.manifest.permissions});assert.deepEqual((await call('studio/state')).data,before);
  console.log(JSON.stringify({step:i===0?'initial':'refinement',phase:job.phase,attempt:job.attempt,elapsedMs:Date.now()-started,version:artifact.manifest.version,usage:job.usage}));
 }
 console.log(JSON.stringify({mode:production?'direct Meta milestone':'configured development',tokens:usage.reduce((s,u)=>s+(u.total_tokens??0),0),reportedCost:usage.some(u=>typeof u.cost==='number')?usage.reduce((s,u)=>s+(u.cost??0),0):null,scope:'Service authoring and persistence; not a native UI recording.'}));
}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
