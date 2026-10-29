import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { CollaborationStore } from '../services/workspace/collaboration-store.mjs';
import { StudioStore } from '../services/workspace/studio-store.mjs';
import { initialWorkspace,reviewWorkspace,reviewContract } from '../apps/definitions/studio.mjs';
import { localDefaults,validateSurface,validateLocalValues } from '../packages/sdk/surface.mjs';
import { createCollaborationServer } from '../services/workspace/collaboration.mjs';

function withLocal(base,version='1.0.0'){
 const artifact=structuredClone(base);artifact.manifest.version=version;artifact.manifest.permissions.push('surface.local.write');artifact.state={extraNote:{type:'text',initial:''}};
 artifact.ui={id:'with-addition',type:'stack',children:[{id:'extra-note-panel',type:'stack',label:'Extra notes',children:[{id:'extra-note',type:'textarea',label:'My extra note',bind:'local.extraNote'}]},artifact.ui]};return artifact;
}
test('new fields fit the shared vocabulary without allowing domain or other-local binding escapes',()=>{
 const a=withLocal(reviewWorkspace);assert.equal(validateSurface(a,reviewContract).state.extraNote.type,'text');const preview=localDefaults(a);preview.extraNote='Preview only';assert.equal(localDefaults(a).extraNote,'');
 for(const change of [a=>a.manifest.permissions.pop(),a=>a.ui.children[0].children[0].bind='local.unknown',a=>a.ui.children[0].children[0].bind='draft.note',a=>a.state.extraNote.type='database',a=>a.state.extraNote.initial='x'.repeat(2001),a=>a.ui.children[0].children[0].action='design.note']){const bad=withLocal(reviewWorkspace);change(bad);assert.throws(()=>validateSurface(bad,reviewContract));}
 assert.throws(()=>validateLocalValues(a,{extraNote:'ok',other:'undeclared'}));assert.throws(()=>validateLocalValues(a,{extraNote:'x'.repeat(2001)}));
});

test('local values persist independently in both hosts and survive compatible refinements/removal',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mallea-local-')),file=join(dir,'state.sqlite');let root;
 try{
  root=new CollaborationStore(file);let studio=new StudioStore(root);const before=studio.state();
  for(const [appId,base]of [['review-main',reviewWorkspace],['scratchpad-main',initialWorkspace]]){
   const packages=root.packages(appId),a=withLocal(base);packages.saveDraft(appId,a,null,'new panel');await packages.install(appId);
   const local=studio.info({appId}).localState;studio.localState.save({appId},{version:'1.0.0',expectedRevision:local.revision,values:{extraNote:appId+' private note'}});
   assert.throws(()=>studio.localState.save({appId},{version:'1.0.0',expectedRevision:local.revision,values:{extraNote:'stale'}}),/another window/);
   assert.throws(()=>studio.localState.save({appId},{version:'0.9.0',expectedRevision:local.revision+1,values:{extraNote:'stale schema'}}),/Surface changed/);
  }
  assert.deepEqual(studio.state(),before,'local values must not edit asset or desktop revision note');
  const packages=root.packages('review-main'),revised=withLocal(reviewWorkspace,'1.0.1');revised.state.extraNote.initial='A new default must not replace written data';packages.saveDraft('revised',revised,'1.0.0','move');await packages.install('revised');assert.equal(studio.info({appId:'review-main'}).data.local.extraNote,'review-main private note');
  const incompatible=withLocal(reviewWorkspace,'1.0.2');incompatible.state.extraNote={type:'color',initial:'#ffffff'};incompatible.ui.children[0].children[0].type='color';packages.saveDraft('bad-type',incompatible,'1.0.1','bad');await assert.rejects(packages.install('bad-type'),/different type/);assert.equal(packages.active().manifest.version,'1.0.1');
  const removed=structuredClone(reviewWorkspace);removed.manifest.version='1.0.2';packages.saveDraft('removed',removed,'1.0.1','remove panel');await packages.install('removed');assert.deepEqual(studio.info({appId:'review-main'}).data.local,{});
  packages.saveDraft('restored',withLocal(reviewWorkspace,'1.0.3'),'1.0.2','restore panel');await packages.install('restored');assert.equal(studio.info({appId:'review-main'}).data.local.extraNote,'review-main private note');
  root.close();root=new CollaborationStore(file);studio=new StudioStore(root);assert.equal(studio.info({appId:'review-main'}).data.local.extraNote,'review-main private note');assert.equal(studio.info({appId:'scratchpad-main'}).data.local.extraNote,'scratchpad-main private note');
 }finally{root?.close();assert(resolve(dir).startsWith(resolve(tmpdir())+String.raw`\mallea-local-`)||resolve(dir).startsWith(resolve(tmpdir())+'/mallea-local-'));await rm(dir,{recursive:true,force:true});}
});

test('HTTP local-state writes require installed version and scope to authenticated app',async()=>{
 const server=await createCollaborationServer({studio:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  const token=(await(await fetch(base+'/api/bootstrap')).json()).token;
  const call=async(session,path,body)=>{const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token,'X-Mallea-Session':session??''},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,value:await r.json()};};
  const review=(await call(null,'register',{kind:'review-board'})).value.session,native=(await call(null,'register',{kind:'scratchpad'})).value.session;
  const packages=server.workspaceStore.packages('review-main');packages.saveDraft('note',withLocal(reviewWorkspace),null,'note');await packages.install('note');const current=(await call(review,'studio/state')).value;
  const input={version:'1.0.0',expectedRevision:current.localState.revision,values:{extraNote:'Only Parcel'}};
  assert.equal((await call(native,'studio/local',input)).status,400);assert.equal((await call(review,'studio/local',{...input,appId:'scratchpad-main'})).status,400);
  assert.equal((await call(review,'studio/local',input)).status,200);assert.equal((await call(native,'studio/state')).value.data.local.extraNote,undefined);
  await call(review,'studio/enabled',{enabled:false});assert.equal((await call(review,'studio/local',{...input,expectedRevision:input.expectedRevision+1})).status,400);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
