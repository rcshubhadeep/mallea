import{resolve,join}from'node:path';import{access}from'node:fs/promises';import{launchNative}from'./lib/native-launch.mjs';
const [id]=process.argv.slice(2);if(!id||!/^[a-z][a-z0-9-]{2,39}$/.test(id)||process.argv.length!==3)throw new Error('Usage: node scripts/launch-app.mjs <app-id>');
const host=resolve(process.env.MALLEA_HOME??'.mallea','hosts',id+'.json'),exe=resolve('apps/desktop/src-tauri/target/release',process.platform==='win32'?'mallea-desktop.exe':'mallea-desktop');
await access(host);await access(exe);await launchNative(exe,host);console.log('Opening registered app: '+id);
