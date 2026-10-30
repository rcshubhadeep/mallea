import test from 'node:test';import assert from 'node:assert/strict';import WebSocket from 'ws';import {randomUUID}from'node:crypto';
import{initialWorkspace,reviewWorkspace,scratchContract,reviewContract}from'../apps/definitions/studio.mjs';
import{validateSurface,dispatchSurfaceAction}from'../packages/sdk/surface.mjs';
import{createCollaborationServer}from'../services/workspace/collaboration.mjs';

test('normal app definitions use the same Surface contract and choice/literal authority checks',()=>{
 for(const [model,contract]of[[initialWorkspace,scratchContract],[reviewWorkspace,reviewContract]])assert.deepEqual(validateSurface(model,contract),model);
 const palette=structuredClone(initialWorkspace);palette.ui.children[2].children.push({id:'palette',type:'choice',label:'Five colors',bind:'draft.color',action:'annotation.color',argument:'color',options:['#00C000','#FFEB00','#0066FF','#FF0000','#000000'].map(value=>({label:value,value}))});assert.doesNotThrow(()=>validateSurface(palette,scratchContract));
 palette.ui.children[2].children.push({id:'blue',type:'button',label:'Blue',action:'annotation.color',argument:'color',value:'#0066FF'});assert.doesNotThrow(()=>validateSurface(palette,scratchContract));
 palette.ui.children[2].children.at(-1).value='javascript:bad';assert.throws(()=>validateSurface(palette,scratchContract),/color/);
 const invalid=structuredClone(reviewWorkspace);invalid.ui.children[2].children[2].options.push({label:'Unapproved',value:'Anything'});assert.throws(()=>validateSurface(invalid,reviewContract),/allowed/);
 assert.throws(()=>dispatchSurfaceAction(reviewContract,reviewContract.permissions,'review.status',{status:'Anything'},()=>{}),/allowed/);
});

test('review writes and reverse MCP feedback require correct app/grant and retain published asset',async()=>{
 const server=await createCollaborationServer({studio:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,sockets=[];
 try{
  const token=(await(await fetch(base+'/api/bootstrap')).json()).token;
  async function call(session,path,body){const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token,'X-Mallea-Session':session??''},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,value:await r.json()};}
  const native=(await call(null,'register',{kind:'scratchpad'})).value.session,web=(await call(null,'register',{kind:'review-board'})).value.session;
  const before=(await call(web,'studio/state')).value;assert.equal(before.installed,false);assert.equal(before.workspace.ui.appearance,'workspace');
  const input={type:'comment',text:'Please keep the title brighter.',expectedRevision:0,operationId:randomUUID()};
  assert.equal((await call(native,'studio/review',input)).status,400);assert.equal((await call(web,'studio/review',input)).status,200);assert.equal((await call(web,'studio/review',input)).status,200);
  assert.equal((await call(web,'studio/review',{...input,operationId:randomUUID()})).status,400);
  assert.equal((await call(web,'studio/review',{type:'status',text:'Changes requested',expectedRevision:1,operationId:randomUUID()})).status,200);
  assert.equal((await call(native,'studio/feedback/refresh',{})).status,400);await call(native,'studio/feedback/access',{allowed:true});assert.match((await call(native,'studio/feedback/refresh',{})).value.error,/offline/);
  const ticket=(await call(web,'connection',{})).value.ticket,ws=new WebSocket(base.replace('http:','ws:')+'/api/events');sockets.push(ws);await new Promise(r=>ws.once('open',r));
  const ready=new Promise(r=>ws.on('message',raw=>{if(JSON.parse(raw).type==='connected')r();}));
  ws.on('message',async raw=>{const m=JSON.parse(raw);if(m.type==='invoke'){const result=await call(web,'studio/owner',{capability:m.capability,arguments:m.arguments});ws.send(JSON.stringify({type:'result',id:m.id,value:result.value}));}});ws.send(JSON.stringify({type:'hello',ticket}));await ready;
  assert.equal((await call(native,'studio/feedback/refresh',{})).status,200);const after=(await call(native,'studio/state')).value;assert.deepEqual(after.data.feedback.items,['Please keep the title brighter.']);assert.equal(after.data.feedback.status,'Changes requested');
  assert.deepEqual((await call(web,'studio/state')).value.data.asset,before.data.asset);
  await call(native,'studio/feedback/access',{allowed:false});assert.equal((await call(native,'studio/feedback/refresh',{})).status,400);assert.deepEqual((await call(native,'studio/state')).value.data.feedback.items,after.data.feedback.items);
 }finally{for(const ws of sockets)ws.terminate();server.closeAllConnections();await new Promise(r=>server.close(r));}
});
