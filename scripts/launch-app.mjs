import{spawn}from'node:child_process';import{resolve,join}from'node:path';import{access}from'node:fs/promises';
const [id]=process.argv.slice(2);if(!id||!/^[a-z][a-z0-9-]{2,39}$/.test(id)||process.argv.length!==3)throw new Error('Usage: node scripts/launch-app.mjs <app-id>');
const host=resolve(process.env.MALLEA_HOME??'.mallea','hosts',id+'.json'),exe=resolve('apps/desktop/src-tauri/target/release',process.platform==='win32'?'mallea-desktop.exe':'mallea-desktop');
await access(host);await access(exe);const child=spawn(exe,['--host-config',host],{detached:true,stdio:'ignore',windowsHide:true});child.on('error',()=>{console.error('Native launch failed. Build the host and start Core first.');process.exitCode=1;});child.unref();console.log('Opening registered app: '+id);
