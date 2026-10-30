import{mkdir,writeFile,readFile}from'node:fs/promises';import{resolve,join}from'node:path';import{randomUUID}from'node:crypto';
import{createCollaborationServer}from'../services/workspace/collaboration.mjs';import{builtinManifests}from'../services/workspace/engine-apps.mjs';
const home=resolve(process.env.MALLEA_HOME??'.mallea'),controlToken=randomUUID();await mkdir(join(home,'hosts'),{recursive:true});
const server=await createCollaborationServer({studio:true,engine:true,controlToken,database:process.env.MALLEA_DB??join(home,'workspace.sqlite'),author:{production:process.argv.includes('--production')}});
if(process.argv.slice(2).some(a=>a!=='--production'))throw new Error('Usage: node scripts/engine.mjs [--production]');
for(const manifest of builtinManifests){const result=server.engineApps.register(manifest),path=join(home,'hosts',manifest.id+'.json');let credential=result.credential;
 if(!credential){try{const old=JSON.parse(await readFile(path,'utf8'));server.engineApps.authenticate(manifest.id,old.credential);credential=old.credential;}catch{credential=server.engineApps.issueCredential(manifest.id);}}
 await writeFile(path,JSON.stringify({version:1,appId:manifest.id,engineUrl:'http://127.0.0.1:4318',credential},null,2)+'\n',{mode:0o600});
}
server.on('error',()=>{console.error('Core could not bind port 4318. Stop the existing project companion first.');process.exitCode=1;});
server.listen(4318,'127.0.0.1',async()=>{await writeFile(join(home,'core.json'),JSON.stringify({version:1,url:'http://127.0.0.1:4318',controlToken},null,2)+'\n',{mode:0o600});console.log('Mallea Core: http://127.0.0.1:4318');console.log('Native hosts: .mallea/hosts/scratchpad-main.json and .mallea/hosts/review-main.json (private configuration).');});
let stopping=false;function stop(){if(stopping)return;stopping=true;server.workspaceRegistry.close();server.closeAllConnections();server.close(()=>process.exit(0));}process.on('SIGINT',stop);process.on('SIGTERM',stop);
