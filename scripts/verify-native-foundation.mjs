import assert from'node:assert/strict';import{mkdtemp,mkdir,writeFile}from'node:fs/promises';import{tmpdir}from'node:os';import{join}from'node:path';
import{createCollaborationServer}from'../services/workspace/collaboration.mjs';
const flags=process.argv.slice(2);if(flags.some(f=>f!=='--production'))throw new Error('Usage: node scripts/verify-native-foundation.mjs [--production]');
const folder=await mkdtemp(join(tmpdir(),'mallea-foundation-')),database=join(folder,'workspace.sqlite');let server,base,session;
async function start(){server=await createCollaborationServer({studio:true,engine:true,database,author:{production:flags.includes('--production')}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;}
async function stop(){server.workspaceRegistry.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
async function call(path,body){const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Session':session??''},...(body===undefined?{}:{body:JSON.stringify(body)})});const v=await r.json();if(!r.ok)throw new Error(v.error);return v;}
try{
 await start();const record=server.engineApps.register({version:1,id:'notes-proof',name:'Notes proof',author:'Mallea validation',purpose:'Validate new-app authoring and persistence.',adapter:'surface'});
 session=(await call('native/register',{appId:record.manifest.id,credential:record.credential})).session;assert.equal((await call('studio/state')).workspace.ui.children.length,0);
 const started=Date.now();let job=await call('author',{request:'Add a multiline local notes field labelled Notes inside the workspace. Keep the existing root layout.'});
 while(!['ready','failed','unsupported','cancelled'].includes(job.phase)){if(Date.now()-started>210000)throw new Error('Bounded validation deadline exceeded.');await new Promise(r=>setTimeout(r,500));job=await call('jobs/'+job.id);}
 const report={environment:flags.includes('--production')?'production':'development',phase:job.phase,attempt:job.attempt,elapsedMs:Date.now()-started,usage:job.usage,diagnostics:job.diagnostics,changes:job.changes};console.log(JSON.stringify(report));assert.equal(job.phase,'ready',job.error??job.unsupported?.reason);
 const artifact=await call('studio/draft?id='+job.id);assert(Object.keys(artifact.state??{}).length,'Expected an editable local field');await call('studio/install',{draftId:job.id,grants:artifact.manifest.permissions});
 const info=await call('studio/state'),values=Object.fromEntries(Object.entries(artifact.state).map(([key,field])=>[key,field.type==='color'?'#123456':'Saved after a live model-authored install.']));await call('studio/local',{version:artifact.manifest.version,expectedRevision:info.localState.revision,values});
 await stop();await start();session=(await call('native/register',{appId:record.manifest.id,credential:record.credential})).session;const reopened=await call('studio/state');assert.deepEqual(reopened.workspace,artifact);assert.deepEqual(reopened.localState.values,values);
 const output='.mallea/foundation-checks/'+Date.now();await mkdir(output,{recursive:true});await writeFile(output+'/report.json',JSON.stringify(report,null,2));await writeFile(output+'/artifact.json',JSON.stringify(artifact,null,2));console.log('PASS: live new-app authoring, approved install, typed local edit and engine restart persistence. Service check; native build/visual verification is separate.');
}finally{if(server?.listening)await stop();}
