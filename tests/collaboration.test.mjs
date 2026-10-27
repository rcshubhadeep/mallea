import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WebSocket } from 'ws';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { WorkspaceStore } from '../services/workspace/store.mjs';
import { CollaborationStore } from '../services/workspace/collaboration-store.mjs';
import { createCollaborationServer } from '../services/workspace/collaboration.mjs';
import { packageFixture } from './helpers.mjs';

test('migration backs up legacy data and preserves board packages without installing in notebook',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'mallea-migration-')),path=join(dir,'workspace.sqlite');let legacy,store;
  try{
    legacy=new WorkspaceStore(path);legacy.saveDraft('old',packageFixture(),null,'old');await legacy.install('old');legacy.updateTask('task-42','acknowledge',{revision:1});legacy.close();legacy=null;
    store=new CollaborationStore(path);assert.ok(existsSync(store.backup));assert.equal(store.packages('board-main').active().manifest.version,'1.0.0');
    assert.equal(store.app('board-main').tasks[0].reviewedRevision,1);assert.equal(store.packages('notebook-main').active(),null);assert.ok(!Object.hasOwn(store.app('board-main').tasks[0],'observation'));
    const edit={id:'obs-task-42',text:'Revised landing',expectedRevision:1,operationId:'operation-1234'};
    assert.throws(()=>store.saveObservation('board-main',edit),/Only the owning/);
    const event=store.saveObservation('notebook-main',edit);assert.equal(event.revision,2);assert.equal(store.saveObservation('notebook-main',edit).duplicate,true);
    assert.throws(()=>store.saveObservation('notebook-main',{...edit,text:'different'}),/already used/);
    assert.throws(()=>store.saveObservation('notebook-main',{...edit,operationId:'operation-5678'}),/changed/);
    store.close();store=new CollaborationStore(path);assert.equal(store.backup,null);assert.equal(store.observation('notebook-main','obs-task-42').revision,2);assert.equal(store.app('board-main').tasks[0].reviewedRevision,1);
  }finally{legacy?.close();store?.close();await rm(dir,{recursive:true,force:true});}
});

test('real MCP, outbound routing, third-instance isolation, events, preview, and authoring context',async()=>{
  const store=new CollaborationStore(':memory:');store.createApp('notebook-third','notebook');store.createApp('notebook-other','notebook','other-workspace');
  const seed=store.state();const thirdApp=seed.apps.find(a=>a.id==='notebook-third');
  thirdApp.observations.push({...store.observation('notebook-main','obs-task-42'),id:'obs-third',text:'Evidence owned by a third instance'});
  seed.apps.find(a=>a.id==='board-main').tasks.push({id:'task-third',title:'Third-instance check',critical:false,reviewedRevision:0,evidence:{appId:'notebook-third',observationId:'obs-third'}});store.write(seed);
  const server=await createCollaborationServer({store,author:{config:{},infer:async(_config,messages)=>{
    const context=JSON.parse(messages[1].content).context;assert.equal(context.app.id,'board-main');assert.equal(context.capabilityCatalog.tools[0].name,'read_observation');
    return {choice:{finish_reason:'stop',message:{content:JSON.stringify(packageFixture())}},usage:{}};
  }}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;const sockets=[];
  try{
    const {token}=await(await fetch(base+'/api/bootstrap')).json();
    const register=async appId=>{const response=await fetch(base+'/api/register',{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token},body:JSON.stringify({appId})});return {status:response.status,...await response.json()};};
    const board=await register('board-main'),notebook=await register('notebook-main'),third=await register('notebook-third');assert.equal((await register('notebook-other')).status,400);
    const call=async(session,path,body)=>{const response=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':session},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:response.status,value:await response.json()};};
    const events=[];
    async function connect(client){
      const {value:{ticket}}=await call(client.session,'connection',{});const socket=new WebSocket(base.replace('http','ws')+'/api/events');sockets.push(socket);
      socket.on('message',async raw=>{const message=JSON.parse(raw);events.push({app:client.workspace.app.id,...message});if(message.type==='invoke'){
        const result=await call(client.session,'observation?id='+message.arguments.observationId);
        socket.send(JSON.stringify({type:'result',id:message.id,...(result.status===200?{value:result.value}:{error:true})}));
      }});
      await new Promise((resolve,reject)=>{socket.on('error',reject);socket.on('open',()=>socket.send(JSON.stringify({type:'hello',ticket})));socket.on('message',raw=>{if(JSON.parse(raw).type==='connected')resolve();});});return socket;
    }
    const sourceSocket=await connect(notebook);await connect(board);await connect(third);
    const client=new Client({name:'test',version:'1.0.0'});await client.connect(new StreamableHTTPClientTransport(new URL(base+'/mcp'),{requestInit:{headers:{'X-Mallea-Session':board.session}}}));
    try{
      assert.equal((await client.listTools()).tools[0].name,'read_observation');
      const args={targetAppId:'notebook-main',observationId:'obs-task-42'};
      assert.equal((await client.callTool({name:'read_observation',arguments:args})).isError,true);
      assert.equal((await call(board.session,'access',{targetAppId:'notebook-main',allowed:true})).status,200);
      const result=await client.callTool({name:'read_observation',arguments:args});assert.equal(JSON.parse(result.content[0].text).revision,1);
      assert.equal((await client.callTool({name:'read_observation',arguments:{...args,targetAppId:'notebook-third'}})).isError,true);
      await call(board.session,'access',{targetAppId:'notebook-third',allowed:true});
      assert.equal(JSON.parse((await client.callTool({name:'read_observation',arguments:{targetAppId:'notebook-third',observationId:'obs-third'}})).content[0].text).text,'Evidence owned by a third instance');
      assert.equal((await client.callTool({name:'read_observation',arguments:{...args,targetAppId:'notebook-third'}})).isError,true);
      assert.equal((await client.callTool({name:'read_observation',arguments:{...args,targetAppId:'notebook-other'}})).isError,true);
      assert.equal((await client.callTool({name:'unknown_tool',arguments:{}})).isError,true);
      assert.equal((await call(board.session,'observation',{id:'obs-task-42',text:'bad',expectedRevision:1,operationId:'bad-operation'})).status,400);
      const job=(await call(board.session,'author',{request:'Create review panel'})).value;let state;
      for(let i=0;i<100;i++){state=(await call(board.session,'jobs/'+job.id)).value;if(['ready','failed'].includes(state.phase))break;await new Promise(r=>setTimeout(r,30));}assert.equal(state.phase,'ready');
      assert.equal((await call(third.session,'install',{draftId:job.id,grants:['observations.read','reviews.write']})).status,400);
      assert.equal((await call(board.session,'panel?task=task-42&draft='+job.id)).value.snapshot.review.status,'blocked');
      await call(board.session,'preview/acknowledge',{draftId:job.id,taskId:'task-42',revision:1});
      assert.equal((await call(board.session,'workspace')).value.tasks[0].reviewedRevision,0);
      await call(board.session,'install',{draftId:job.id,grants:['observations.read','reviews.write']});
      assert.equal((await call(notebook.session,'workspace')).value.extension,null);
      await call(board.session,'task',{taskId:'task-42',action:'acknowledge',revision:1});
      const edit={id:'obs-task-42',text:'Landing edge now has a clear cue',expectedRevision:1,operationId:'edit-event-001'};
      assert.equal((await call(notebook.session,'observation',edit)).status,200);assert.equal((await call(notebook.session,'observation',edit)).value.event.duplicate,true);
      assert.equal((await call(board.session,'task',{taskId:'task-42',action:'acknowledge',revision:1})).status,400);
      const workspace=(await call(board.session,'workspace')).value;assert.equal(workspace.tasks[0].observation.revision,2);assert.equal(workspace.tasks[1].observation.revision,1);
      assert.equal(workspace.tasks[0].review.status,'blocked'); // Computed without requesting a panel.
      assert.equal((await call(board.session,'panel?task=task-42')).value.snapshot.review.status,'blocked');
      await new Promise(r=>setTimeout(r,25));assert.equal(events.filter(e=>e.app==='board-main'&&e.type==='changed').length,1);assert.equal(events.filter(e=>e.app==='notebook-third'&&e.type==='changed').length,0);
      await new Promise(r=>{sourceSocket.once('close',r);sourceSocket.close();});
      assert.equal((await client.callTool({name:'read_observation',arguments:args})).isError,true);
      await connect(notebook);assert.equal(JSON.parse((await client.callTool({name:'read_observation',arguments:args})).content[0].text).revision,2);
      await call(board.session,'access',{targetAppId:'notebook-main',allowed:false});assert.equal((await call(board.session,'panel?task=task-42')).status,400);
    }finally{await client.close();}
  }finally{for(const socket of sockets)socket.terminate();server.workspaceRegistry.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
});
