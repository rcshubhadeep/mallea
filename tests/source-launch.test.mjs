import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm,symlink,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {createServer} from 'node:net';
import {parseSourceArgs,buildSource,buildSteps,startSource,requireFreePort,cleanSource} from '../scripts/mallea.mjs';

async function temporary(t){const path=await mkdtemp(join(tmpdir(),'mallea-source-launch-'));assert.equal(dirname(path),resolve(tmpdir()));t.after(()=>rm(path,{recursive:true,force:true}));return path;}

test('source CLI accepts explicit modes and rejects ambiguous or unsupported arguments',()=>{
 assert.deepEqual(parseSourceArgs([]),{command:'start',devMode:false});
 assert.deepEqual(parseSourceArgs(['run','--dev']),{command:'run',devMode:true});
 assert.equal(parseSourceArgs(['build']).command,'build');assert.equal(parseSourceArgs(['--help']).command,'help');
 assert.equal(parseSourceArgs(['clean']).command,'clean');assert.throws(()=>parseSourceArgs(['clean','--dev']));
 for(const args of [['install'],['run','--dev','--dev'],['build','--production'],['run','build'],['--unknown']])assert.throws(()=>parseSourceArgs(args));
});

test('clean invokes cargo only for the checked native target and refuses redirected cleanup',async t=>{
 const base=await temporary(t),parent=join(base,'apps/desktop/src-tauri'),target=join(parent,'target');
 await mkdir(parent,{recursive:true});await writeFile(join(parent,'Cargo.toml'),'[package]\nname="clean-test"\nversion="0.1.0"\n');
 let calls=0;
 await cleanSource({base,runStep:async step=>{calls++;assert.equal(step.command,'cargo');assert.deepEqual(step.args,['clean','--manifest-path',join(parent,'Cargo.toml'),'--target-dir',target]);}});
 assert.equal(calls,1);
 const elsewhere=join(base,'retained-data');await mkdir(elsewhere);await writeFile(join(elsewhere,'keep.txt'),'retained');
 await symlink(elsewhere,target,process.platform==='win32'?'junction':'dir');
 await assert.rejects(()=>cleanSource({base,runStep:async()=>{calls++;}}),/redirected/);
 assert.equal(await readFile(join(elsewhere,'keep.txt'),'utf8'),'retained');assert.equal(calls,1);
 assert.equal(await realpath(target),await realpath(elsewhere));
});

test('build fails before running tools when dependencies are absent and stops on the first failed step',async t=>{
 const base=await temporary(t);let steps=0;
 await assert.rejects(()=>buildSource({base,runStep:async()=>{steps++;}}),/Dependencies are missing/);assert.equal(steps,0);
 for(const step of buildSteps(base)){await mkdir(dirname(step.args[0]),{recursive:true});await writeFile(step.args[0],'Synthetic test file, never executed.');}
 await assert.rejects(()=>buildSource({base,runStep:async()=>{if(++steps===2)throw new Error('synthetic compiler failure');}}),/synthetic compiler failure/);assert.equal(steps,2);
});

test('source startup opens an authenticated dashboard and stops its owned Core on launch failure or explicit stop',async t=>{
 const home=await temporary(t),binary=join(home,'host-placeholder');await writeFile(binary,'Never executed; launch is injected.');
 for(const fail of [true,false]){
  let server,launches=0;
  const launch=async(actual,host)=>{
   launches++;assert.equal(actual,binary);const config=JSON.parse(await readFile(host,'utf8'));assert.equal(config.appId,'mallea-core');
   const response=await fetch(config.engineUrl+'/api/health');assert.equal(response.status,200);
   const auth=await fetch(config.engineUrl+'/api/native/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appId:config.appId,credential:config.credential})});assert.equal(auth.status,200);
   if(fail)throw new Error('synthetic launch failure');
  };
  if(fail){await assert.rejects(()=>startSource({home,binary,port:0,launch}),/Core started by this command has been stopped/);}
  else{const session=await startSource({home,binary,port:0,launch});server=session.server;assert.equal(server.listening,true);await session.stop();await session.stop();assert.equal(server.listening,false);}
  assert.equal(launches,1);
  const record=JSON.parse(await readFile(join(home,'core.json'),'utf8'));await assert.rejects(()=>fetch(record.url+'/api/health'));
 }
});

test('an occupied port refuses launch without altering the running Core or its identity files',async t=>{
 const home=await temporary(t),binary=join(home,'host-placeholder');await writeFile(binary,'Never executed.');
 const owned=await startSource({home,binary,port:0,launch:async()=>{}});
 try{
  const port=owned.server.address().port,before=await readFile(join(home,'core.json'));let launches=0;
  await assert.rejects(()=>requireFreePort(port),/in use/);
  await assert.rejects(()=>startSource({home,binary,port,launch:async()=>{launches++;}}),{code:'EADDRINUSE'});
  assert.equal(launches,0);assert.deepEqual(await readFile(join(home,'core.json')),before);assert.equal(owned.server.listening,true);
 }finally{await owned.stop();}
 const probe=createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));await requireFreePort(port);
});
