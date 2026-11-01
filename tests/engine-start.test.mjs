import test from'node:test';import assert from'node:assert/strict';import{mkdtemp,readFile,rm}from'node:fs/promises';import{tmpdir}from'node:os';import{join}from'node:path';import{startEngine}from'../scripts/engine.mjs';
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
