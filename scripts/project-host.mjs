// Copied into generated projects. Uses only standard Node APIs; no framework checkout imports.
import{readFile,writeFile,mkdir,access}from'node:fs/promises';import{resolve,join}from'node:path';import{spawn}from'node:child_process';
const action=process.argv[2],home=resolve('.mallea'),host=join(home,'host.json');
if(action==='register'){
 const manifest=JSON.parse(await readFile('app.manifest.json','utf8')),core=JSON.parse(await readFile(join(process.env.MALLEA_HOME??'.mallea','core.json'),'utf8'));
 if(core.url!=='http://127.0.0.1:4318')throw new Error('Expected local Mallea Core.');
 async function call(route,input){const r=await fetch(core.url+'/api/engine/'+route,{method:'POST',headers:{'Content-Type':'application/json','X-Mallea-Control':core.controlToken},body:JSON.stringify(input)});if(!r.ok)throw new Error('Core rejected registration. Check the manifest and running Core.');return r.json();}
 const result=await call('apps',manifest);let credential=result.credential;
 if(!credential){try{const old=JSON.parse(await readFile(host,'utf8'));const r=await fetch(core.url+'/api/native/context',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appId:manifest.id,credential:old.credential})});if(r.ok)credential=old.credential;}catch{}}
 if(!credential)credential=(await call('host',{appId:manifest.id})).credential;
 await mkdir(home,{recursive:true});await writeFile(host,JSON.stringify({version:1,appId:manifest.id,engineUrl:core.url,credential},null,2)+'\n',{mode:0o600});console.log('Registered '+manifest.name+'. Private host configuration stored locally.');
}else if(action==='start'){
 await access(host);const binary=resolve('src-tauri/target/release',process.platform==='win32'?'mallea-project.exe':'mallea-project');await access(binary);
 const child=spawn(binary,['--host-config',host],{stdio:'inherit',windowsHide:true});child.on('error',()=>{console.error('Native launch failed.');process.exitCode=1;});child.on('exit',code=>{process.exitCode=code??1;});
}else throw new Error('Usage: node project-host.mjs register|start');
