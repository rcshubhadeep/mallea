// Bounded service-level model check. Native interaction is tested separately.
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { createCollaborationServer } from '../services/workspace/collaboration.mjs';
const args=process.argv.slice(2);if(args.some(a=>a!=='--production')||args.length>1)throw new Error('Only --production is supported.');
const production=args.includes('--production'),server=await createCollaborationServer({author:{production}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,usage=[];let socket;
try{
  const {token}=await(await fetch(base+'/api/bootstrap')).json();
  const register=async kind=>{const response=await fetch(base+'/api/register',{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token},body:JSON.stringify({kind})});return response.json();};
  const board=await register('board'),notebook=await register('notebook');
  async function call(session,path,body){const response=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':session},...(body===undefined?{}:{body:JSON.stringify(body)})});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;}
  const {ticket}=await call(notebook.session,'connection',{});socket=new WebSocket(base.replace('http','ws')+'/api/events');
  socket.on('message',async raw=>{const message=JSON.parse(raw);if(message.type==='invoke'){
    try{socket.send(JSON.stringify({type:'result',id:message.id,value:await call(notebook.session,'observation?id='+encodeURIComponent(message.arguments.observationId))}));}
    catch{socket.send(JSON.stringify({type:'result',id:message.id,error:true}));}
  }});
  await new Promise((resolve,reject)=>{socket.on('error',reject);socket.on('open',()=>socket.send(JSON.stringify({type:'hello',ticket})));socket.on('message',raw=>{if(JSON.parse(raw).type==='connected')resolve();});});
  await call(board.session,'access',{targetAppId:'notebook-main',allowed:true});
  const requests=['Create a panel using the linked notebook evidence. Include screenshot, observation, and acknowledgement. Block all unreviewed tasks.',
    'Only block release-critical tasks when evidence changes; warn for ordinary tasks. Keep the evidence and acknowledgement. Change the heading to Release confidence.'];
  for(let i=0;i<requests.length;i++){
    const started=Date.now(),job=await call(board.session,'author',{request:requests[i]});let status;
    do{await new Promise(r=>setTimeout(r,200));status=await call(board.session,'jobs/'+job.id);}while(!['ready','failed','unsupported','cancelled'].includes(status.phase));
    usage.push(...status.usage);console.log(JSON.stringify({step:i+1,phase:status.phase,attempts:status.attempt,diagnostics:status.diagnostics,elapsedMs:Date.now()-started,usage:status.usage}));
    assert.equal(status.phase,'ready',status.error??status.unsupported?.reason);
    const preview=await call(board.session,'panel?task=task-42&draft='+job.id);assert.equal(preview.policy,i===0?'block-all':'critical-only');
    await call(board.session,'install',{draftId:job.id,grants:preview.manifest.permissions});
    if(i===0){
      await call(board.session,'task',{taskId:'task-42',action:'acknowledge',revision:1});
      await call(notebook.session,'observation',{id:'obs-task-42',text:'New service-level test observation',expectedRevision:1,operationId:'model-check-edit'});
      assert.equal((await call(board.session,'panel?task=task-42')).snapshot.review.status,'blocked');
      await call(board.session,'task',{taskId:'task-42',action:'acknowledge',revision:2});
    }
  }
  const state=await call(board.session,'workspace');assert.equal(state.tasks[0].reviewedRevision,2);assert.equal(state.extension.version,'1.0.1');
  assert.equal((await call(board.session,'panel?task=task-43')).snapshot.review.status,'warning');
  assert.equal((await call(notebook.session,'workspace')).extension,null);
  console.log('PASS: capability-aware authoring, authorized MCP evidence read, revision event, follow-up, app scope, and retained acknowledgement.');
}catch(error){console.error(error.message);process.exitCode=1;}
finally{
  socket?.terminate();server.workspaceRegistry.close();server.closeAllConnections();await new Promise(r=>server.close(r));
  console.log(JSON.stringify({environment:production?'production':'development',responses:usage.length,totalTokens:usage.reduce((n,u)=>n+(u.total_tokens??0),0),reportedCost:usage.length&&usage.every(u=>typeof u.cost==='number')?usage.reduce((n,u)=>n+u.cost,0):null}));
}
