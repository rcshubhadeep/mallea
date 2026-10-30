import assert from'node:assert/strict';import{mkdir,writeFile}from'node:fs/promises';
import{createCollaborationServer}from'../services/workspace/collaboration.mjs';
const flags=process.argv.slice(2);if(flags.some(f=>f!=='--production'))throw new Error('Usage: node scripts/verify-malleability.mjs [--production]');
const server=await createCollaborationServer({studio:true,author:{production:flags.includes('--production')}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;let session='';
try{
 const token=(await(await fetch(base+'/api/bootstrap')).json()).token;
 async function call(path,body){const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token,'X-Mallea-Session':session},...(body===undefined?{}:{body:JSON.stringify(body)})});const v=await r.json();if(!r.ok)throw new Error(v.error);return v;}
 session=(await call('register',{kind:'scratchpad'})).session;const before=await call('studio/state'),start=Date.now();
 let job=await call('author',{request:'Can you make the fonts bold for the saved revision list while keeping the layout the same'});
 while(!['ready','failed','unsupported','cancelled'].includes(job.phase)){await new Promise(r=>setTimeout(r,300));job=await call(`jobs/${job.id}`);}
 const report={phase:job.phase,attempt:job.attempt,elapsedMs:Date.now()-start,changes:job.changes,usage:job.usage};console.log(JSON.stringify(report));assert.equal(job.phase,'ready',job.error??job.unsupported?.reason);assert(job.changes?.length,'Expected targeted changes, not a regenerated app');
 const after=await call(`studio/draft?id=${job.id}`);function find(n,id){if(n.id===id)return n;for(const c of n.children??[]){const v=find(c,id);if(v)return v;}}
 const list=find(after.ui,'versions');assert(list.style.fontWeight==='bold'||list.style.fontWeight>=700,'Expected bold actual repeated text');const expected=structuredClone(before.workspace);expected.manifest.version=after.manifest.version;find(expected.ui,'versions').style={...find(expected.ui,'versions').style,fontWeight:list.style.fontWeight};assert.deepEqual(after,expected,'Unrequested model/permissions/layout/content/bindings changed');
 await call('studio/install',{draftId:job.id,grants:after.manifest.permissions});assert.deepEqual((await call('studio/state')).data,before.data);
 const folder=`.mallea/malleability-checks/${Date.now()}`;await mkdir(folder,{recursive:true});await writeFile(`${folder}/report.json`,JSON.stringify(report,null,2));await writeFile(`${folder}/artifact.json`,JSON.stringify(after,null,2));console.log('PASS: bold targeted change, other nodes/layout/bindings unchanged, data retained. Service verification; not a native UI check.');
}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
