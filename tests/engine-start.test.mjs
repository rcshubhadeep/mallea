import test from'node:test';import assert from'node:assert/strict';import{mkdtemp,readFile,rm}from'node:fs/promises';import{tmpdir}from'node:os';import{join}from'node:path';import{startEngine}from'../scripts/engine.mjs';
test('text/JSON exports require explicit Core dev mode and revert on a normal restart',async()=>{
 const home=await mkdtemp(join(tmpdir(),'mallea-dev-export-'));let server;
 async function stop(){if(!server)return;server.workspaceRegistry.close();server.closeAllConnections();await new Promise(done=>server.close(done));server=null;}
 try{for(const devMode of [false,true,false]){
  server=await startEngine({home,port:0,devMode});
  for(const appId of ['scratchpad-main','review-main','mallea-core']){
   const session=server.workspaceRegistry.register(appId),info=server.liveApps.info(session),actions=info.systemSurfaces.context.ui.children.map(n=>n.action);
   assert.equal(actions.includes('context.text'),devMode);assert.equal(actions.includes('context.json'),devMode);assert(actions.includes('context.image'));
   const surfaceId=info.model.surfaces[0].id;
   for(const format of ['text','json']){const response=await fetch(`http://127.0.0.1:${server.address().port}/api/live/export`,{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':session.id},body:JSON.stringify({surfaceId,format})});const result=await response.json();assert.equal(response.status,devMode?200:400);if(devMode)assert.equal(result.format,format==='json'?'json':'txt');else assert.match(result.error,/--dev/);}
  }
  assert.throws(()=>server.liveApps.export({appId:'review-main'},'missing','image'),/app-owned Surface/,'Image export must still reach ordinary Surface checks');
  const persisted=JSON.parse(server.workspaceStore.db.prepare('SELECT value FROM live_system_surfaces WHERE id=?').get('context').value);assert.equal(persisted.ui.children.some(n=>n.action==='context.json'),devMode);
  await stop();
 }}finally{await stop();await rm(home,{recursive:true,force:true});}
});
test('a failed duplicate Core start preserves native connection files and the running dashboard capability',async()=>{
 const home=await mkdtemp(join(tmpdir(),'mallea-core-start-'));let server;
 try{
  server=await startEngine({home,port:0});const app=server.liveApps.read('scratchpad-main');app.surfaces.push({id:'session-test',title:'Temporary note',version:1,lifetime:'session',slot:'main',width:'wide',ui:{id:'temporary-text',type:'text',text:'Keep this running session'}});server.liveApps.save('scratchpad-main',app,0);
  const files=['core.json','hosts/mallea-core.json','hosts/scratchpad-main.json','hosts/review-main.json'],before=await Promise.all(files.map(f=>readFile(join(home,f))));
  await assert.rejects(()=>startEngine({home,port:server.address().port}),{code:'EADDRINUSE'});
  for(let i=0;i<files.length;i++)assert.deepEqual(await readFile(join(home,files[i])),before[i]);
  assert.deepEqual(server.liveApps.read('scratchpad-main'),app,'A failed start must not expire the running app session');
  const core=JSON.parse(before[0]),host=JSON.parse(before[1]);assert.equal(host.controlToken,core.controlToken);
  const response=await fetch(core.url+'/api/engine/dashboard',{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Control':host.controlToken},body:JSON.stringify({action:'state',args:{}})});assert.equal(response.status,200);const state=await response.json();assert.equal(state.data.apps.length,3);assert.equal(state.data.catalogue.length,6);
 }finally{if(server){server.workspaceRegistry.close();server.closeAllConnections();await new Promise(done=>server.close(done));}await rm(home,{recursive:true,force:true});}
});
