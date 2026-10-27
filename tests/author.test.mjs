import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkspaceStore } from '../services/workspace/store.mjs';
import { createAuthor } from '../services/workspace/author.mjs';
import { packageFixture } from './helpers.mjs';
const response = p=>({choice:{finish_reason:'stop',message:{content:JSON.stringify(p)}},usage:{total_tokens:1}});
async function wait(author,id) { for(let n=0;n<200;n++){ const j=author.get(id); if(['ready','failed','cancelled','unsupported'].includes(j.phase))return j; await new Promise(r=>setTimeout(r,20)); } throw new Error('Job timeout'); }

test('unsupported requests end without repair or a draft and preserve installed state',async()=>{
 const store=new WorkspaceStore(':memory:');let calls=0;
 const author=createAuthor(store,{config:{},infer:async()=>{calls++;return response({unsupported:{reason:'Threshold rules are unavailable.',alternative:'Block every stale critical task.'}});}});
 try{
   store.saveDraft('seed',packageFixture(),null,'seed');await store.install('seed');
   store.updateTask('task-42','acknowledge',{revision:1});
   const before=store.state();const j=await wait(author,author.start('Block only after three unseen revisions').id);
   assert.equal(j.phase,'unsupported');assert.equal(calls,1);assert.equal(j.diagnostics.length,0);
   assert.match(j.unsupported.reason,/Threshold/);assert.throws(()=>store.draft(j.id));
   assert.deepEqual(store.state(),before);assert.equal(author.cancel(j.id).phase,'unsupported');
 }finally{author.close();store.close();}
});

test('malformed or mixed unsupported responses cannot bypass validation',async()=>{
 const store=new WorkspaceStore(':memory:');let calls=0;
 const author=createAuthor(store,{config:{},infer:async()=>{calls++;return response({...packageFixture(),unsupported:{reason:'',alternative:'a'}});}});
 try{const j=await wait(author,author.start('Create panel').id);assert.equal(j.phase,'failed');assert.equal(calls,3);assert.throws(()=>store.draft(j.id));}finally{author.close();store.close();}
});
test('author repairs using actual diagnostics and does not activate draft', async ()=>{
 const store=new WorkspaceStore(':memory:');let calls=0;
 const author=createAuthor(store,{config:{},infer:async(_c,messages)=>{calls++; if(calls===1)return response({});assert.match(messages.at(-1).content,/Validation failed/);return response(packageFixture());}});
 try{const j=await wait(author,author.start('Create evidence panel').id);assert.equal(j.phase,'ready');assert.equal(calls,2);assert.equal(j.diagnostics.length,1);assert.equal(store.active(),null);}finally{author.close();store.close();}
});
test('invalid outputs stop after three calls', async()=>{
 const store=new WorkspaceStore(':memory:');let calls=0;const author=createAuthor(store,{config:{},infer:async()=>{calls++;return response({});}});
 try{const j=await wait(author,author.start('Create panel').id);assert.equal(j.phase,'failed');assert.equal(calls,3);assert.equal(store.active(),null);}finally{author.close();store.close();}
});
test('cancelled generation cannot save a late result',async()=>{
 const store=new WorkspaceStore(':memory:');let release;const author=createAuthor(store,{config:{},infer:()=>new Promise(r=>{release=r;})});
 try{const j=author.start('Create panel');await new Promise(r=>setImmediate(r));author.cancel(j.id);release(response(packageFixture()));assert.equal((await wait(author,j.id)).phase,'cancelled');assert.throws(()=>store.draft(j.id));}finally{author.close();store.close();}
});
