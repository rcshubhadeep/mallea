import test from'node:test';import assert from'node:assert/strict';
import{applySurfaceChanges}from'../packages/sdk/surface-edits.mjs';
import{initialWorkspace,scratchContract}from'../apps/definitions/studio.mjs';
import{CollaborationStore}from'../services/workspace/collaboration-store.mjs';
import{StudioStore}from'../services/workspace/studio-store.mjs';
import{createAuthor}from'../services/workspace/author.mjs';
const meta={id:'scratch-workspace',version:'1.0.1'};
const bold={changes:[{op:'set',id:'versions',props:{style:{fontWeight:700}}}]};
function find(n,id){if(n.id===id)return n;for(const c of n.children??[]){const r=find(c,id);if(r)return r;}}
test('a typography edit preserves the rest of the model exactly and never mutates its base',()=>{
 const before=structuredClone(initialWorkspace),{artifact,summary}=applySurfaceChanges(initialWorkspace,bold,scratchContract,meta);
 assert.equal(find(artifact.ui,'versions').style.fontWeight,700);assert.deepEqual(initialWorkspace,before);
 const expected=structuredClone(before);expected.manifest.version=meta.version;find(expected.ui,'versions').style={fontWeight:700};assert.deepEqual(artifact,expected);assert.equal(summary.length,1);
 for(const style of[{fontWeight:2000},{fontFamily:'url(secret)'},{position:'fixed'},{fontSize:999}])assert.throws(()=>applySurfaceChanges(before,{changes:[{op:'set',id:'versions',props:{style}}]},scratchContract,meta));
});
test('independent insert/move/remove preserves working bindings and rejects cycles/authority escapes',()=>{
 const note={id:'personal-notes',type:'textarea',label:'Personal notes',bind:'local.personalNote'};
 const added=applySurfaceChanges(initialWorkspace,{state:{personalNote:{type:'text',initial:''}},permissions:['surface.local.write'],changes:[{op:'insert',parentId:'design-stage',index:1,node:note}]},scratchContract,meta).artifact;
 assert.equal(find(added.ui,'personal-notes').bind,'local.personalNote');assert.deepEqual(find(added.ui,'type-controls'),find(initialWorkspace.ui,'type-controls'));
 const moved=applySurfaceChanges(added,{changes:[{op:'move',id:'personal-notes',parentId:'project-sidebar',index:1}]},scratchContract,{...meta,version:'1.0.2'}).artifact;assert.equal(moved.ui.children[0].children[1].id,'personal-notes');
 const removed=applySurfaceChanges(moved,{changes:[{op:'remove',id:'personal-notes'}]},scratchContract,{...meta,version:'1.0.3'}).artifact;assert(!find(removed.ui,'personal-notes'));assert.deepEqual(removed.state,added.state);
 for(const changes of[[{op:'remove',id:'canvas'}],[{op:'move',id:'design-stage',parentId:'revision-card',index:0}],[{op:'set',id:'versions',props:{children:[]}}],[{op:'set',id:'unknown',props:{label:'bad'}}],[{op:'insert',parentId:'versions',index:0,node:note}],[{op:'set',id:'save-design',props:{action:'filesystem.delete'}}]])assert.throws(()=>applySurfaceChanges(initialWorkspace,{changes},scratchContract,meta));
});
test('targeted model authoring uses ordinary validation/install, retains state and rejects stale proposals',async()=>{
 const root=new CollaborationStore(':memory:'),studio=new StudioStore(root),store=root.packages('scratchpad-main');let author;
 try{
  const seed=applySurfaceChanges(initialWorkspace,{state:{personalNote:{type:'text',initial:''}},permissions:['surface.local.write'],changes:[{op:'insert',parentId:'project-sidebar',index:1,node:{id:'personal-note',type:'textarea',bind:'local.personalNote',label:'Note'}}]},scratchContract,{...meta,version:'1.0.0'}).artifact;
  store.saveDraft('seed',seed,null,'seed');await store.install('seed');const session={appId:'scratchpad-main'},state=studio.info(session);
  studio.localState.save(session,{version:'1.0.0',expectedRevision:state.localState.revision,values:{personalNote:'Keep this text'}});
  author=createAuthor(store,{config:{},context:async()=>({currentWorkspace:store.active()}),infer:async()=>({choice:{finish_reason:'stop',message:{content:JSON.stringify(bold)}},usage:{}})});
  const job=author.start('Make saved versions bold without changing layout');let result;
  for(let i=0;i<100;i++){result=author.get(job.id);if(['ready','failed'].includes(result.phase))break;await new Promise(r=>setTimeout(r,20));}
  assert.equal(result.phase,'ready');assert.equal(result.changes.length,1);const before=studio.state();await store.install(job.id);assert.deepEqual(studio.state(),before);assert.equal(studio.info(session).data.local.personalNote,'Keep this text');
  await assert.rejects(store.install(job.id),/stale/);
 }finally{author?.close();root.close();}
});

test('new authoring cannot silently replace targeted edits with a regenerated Surface',async()=>{
 const root=new CollaborationStore(':memory:');new StudioStore(root);const store=root.packages('scratchpad-main');let calls=0;
 const author=createAuthor(store,{config:{},context:async()=>({currentWorkspace:initialWorkspace}),infer:async()=>{calls++;return {choice:{finish_reason:'stop',message:{content:JSON.stringify(initialWorkspace)}},usage:{}};}});
 try{const job=author.start('Make list bold');let result;for(let i=0;i<100;i++){result=author.get(job.id);if(result.phase==='failed')break;await new Promise(r=>setTimeout(r,20));}assert.equal(result.phase,'failed');assert.equal(calls,3);assert.match(result.diagnostics[0].message,/targeted/);assert.equal(store.active(),null);assert.throws(()=>store.draft(job.id));}finally{author.close();root.close();}
});
