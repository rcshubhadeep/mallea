import assert from 'node:assert/strict';
import { WorkspaceStore } from '../services/workspace/store.mjs';
import { createAuthor } from '../services/workspace/author.mjs';
import { runReview } from '../packages/runner/index.mjs';
const production=process.argv.includes('--production');
if(process.argv.slice(2).some(a=>a!=='--production'))throw new Error('Only --production is supported.');
const store=new WorkspaceStore(':memory:');
const author=createAuthor(store,{production});
const usage=[];
try{
  const requests=['Create an evidence panel showing screenshot, observation, acknowledgement action. Block every unreviewed task.',
    'Only block release-critical tasks; warn for ordinary unreviewed tasks. Keep acknowledgement and screenshot. Change the heading to Release confidence.'];
  for(let i=0;i<requests.length;i++){
    const started=Date.now();const job=author.start(requests[i]);let current;
    do{await new Promise(r=>setTimeout(r,200));current=author.get(job.id);}while(!['ready','failed','cancelled','unsupported'].includes(current.phase));
    usage.push(...current.usage);
    console.log(JSON.stringify({step:i+1,phase:current.phase,attempts:current.attempt,diagnostics:current.diagnostics,usage:current.usage,elapsedMs:Date.now()-started}));
    assert.equal(current.phase,'ready',current.error);
    assert.equal(store.draft(job.id).artifact.policy,i===0?'block-all':'critical-only');
    await store.install(job.id);
    if(i===0)store.updateTask('task-42','acknowledge',{revision:1});
  }
  assert.equal(store.state().tasks[0].reviewedRevision,1);
  const ordinary=store.state().tasks[1];assert.equal((await runReview(store.active(),ordinary,ordinary.observation)).status,'warning');
  console.log('PASS: real authoring, follow-up revision, activation, and retained acknowledgement.');
}catch(error){console.error(error.message);process.exitCode=1;}finally{author.close();store.close();console.log(JSON.stringify({environment:production?'production':'development',responses:usage.length,totalTokens:usage.reduce((n,u)=>n+(u.total_tokens??0),0),reportedCost:usage.every(u=>typeof u.cost==='number')&&usage.length?usage.reduce((n,u)=>n+u.cost,0):null}));}
