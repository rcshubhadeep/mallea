import{readFile,writeFile,mkdir}from'node:fs/promises';import{resolve,dirname,join}from'node:path';
import{validateAppManifest}from'../packages/sdk/app-manifest.mjs';
const [manifestPath,hostPath]=process.argv.slice(2);if(!manifestPath||!hostPath||process.argv.length!==4)throw new Error('Usage: node scripts/register-app.mjs <app.manifest.json> <private-host.json>');
const manifest=validateAppManifest(JSON.parse(await readFile(manifestPath,'utf8'))),core=JSON.parse(await readFile(join(process.env.MALLEA_HOME??'.mallea','core.json'),'utf8'));
if(core.url!=='http://127.0.0.1:4318')throw new Error('Expected local Mallea Core.');
async function call(path,body){const r=await fetch(core.url+'/api/engine/'+path,{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Control':core.controlToken},body:JSON.stringify(body)});const value=await r.json();if(!r.ok)throw new Error('Core rejected app registration. Check the manifest and app identity.');return value;}
const target=resolve(hostPath),result=await call('apps',manifest);let credential=result.credential;
if(!credential){try{const old=JSON.parse(await readFile(target,'utf8'));const r=await fetch(core.url+'/api/native/context',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appId:manifest.id,credential:old.credential})});if(r.ok)credential=old.credential;}catch{/* A lost local host file can be reissued by this trusted control command. */}}
if(!credential)credential=(await call('host',{appId:manifest.id})).credential;
await mkdir(dirname(target),{recursive:true});await writeFile(target,JSON.stringify({version:1,appId:manifest.id,engineUrl:core.url,credential},null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({registered:true,id:manifest.id,name:manifest.name,hostConfigurationWritten:true}));
