import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorkspaceServer } from '../services/workspace/server.mjs';
import { packageFixture } from './helpers.mjs';

test('HTTP authoring previews are separate and installation requires access approval',async()=>{
  const server=await createWorkspaceServer(null,{author:{config:{},infer:async()=>({choice:{finish_reason:'stop',message:{content:JSON.stringify(packageFixture())}},usage:{}})}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/api/`;
  try{
    assert.equal((await fetch(base+'bootstrap',{headers:{Origin:'https://evil.example'}})).status,403);
    const {token,extension}=await(await fetch(base+'bootstrap')).json();assert.equal(extension,null);
    const call=(path,body)=>fetch(base+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Mallea-Token':token},...(body?{body:JSON.stringify(body)}:{})});
    const job=await(await call('author',{request:'Block all stale evidence'})).json();
    let status;for(let i=0;i<100;i++){status=await(await call('jobs/'+job.id)).json();if(status.phase==='ready'||status.phase==='failed')break;await new Promise(r=>setTimeout(r,25));}
    assert.equal(status.phase,'ready');
    assert.equal((await(await call(`panel?task=task-42&draft=${job.id}`)).json()).snapshot.review.status,'blocked');
    assert.equal((await call('preview/acknowledge',{draftId:job.id,taskId:'task-42',revision:1})).status,200);
    assert.equal((await(await call('workspace')).json()).tasks[0].reviewedRevision,0);
    assert.equal((await call('install',{draftId:job.id,grants:[]})).status,400);
    assert.equal((await call('install',{draftId:job.id,grants:['observations.read','reviews.write']})).status,200);
    assert.equal((await(await call('panel?task=task-42')).json()).snapshot.review.status,'blocked');
    assert.equal((await call('task',{taskId:'task-42',action:'acknowledge',revision:0})).status,400);
    assert.equal((await call('task',{taskId:'task-42',action:'acknowledge',revision:1})).status,200);
  }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
