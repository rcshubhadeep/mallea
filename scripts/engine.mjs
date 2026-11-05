import{mkdir,writeFile,readFile}from'node:fs/promises';import{resolve,join}from'node:path';import{randomUUID}from'node:crypto';import{fileURLToPath}from'node:url';
import{createCollaborationServer}from'../services/workspace/collaboration.mjs';import{builtinManifests}from'../services/workspace/engine-apps.mjs';
import{dashboardManifest}from'../packages/sdk/dashboard.mjs';
import{createServer}from'node:http';
// Publish native connection capabilities only after this process owns its listener.
export async function startEngine({home=resolve(process.env.MALLEA_HOME??'.mallea'),database=process.env.MALLEA_DB??join(home,'workspace.sqlite'),production=false,devMode=false,port=4318,runtime=null}={}){
 const controlToken=randomUUID();await mkdir(home,{recursive:true});
 let server=createServer();
 try{
  await new Promise((done,fail)=>{server.once('error',fail);server.listen(port,'127.0.0.1',()=>{server.removeListener('error',fail);done();});});
  server=await createCollaborationServer({httpServer:server,studio:true,engine:true,home,controlToken,database,devMode,runtime,author:{production,installed:!!runtime}});
  const url='http://127.0.0.1:'+server.address().port;await mkdir(join(home,'hosts'),{recursive:true});
  for(const manifest of [...builtinManifests,dashboardManifest]){
   const result=server.engineApps.register(manifest),path=join(home,'hosts',manifest.id+'.json');let credential=result.credential;
   if(!credential){try{const old=JSON.parse(await readFile(path,'utf8'));server.engineApps.authenticate(manifest.id,old.credential);credential=old.credential;}catch{credential=server.engineApps.issueCredential(manifest.id);}}
   await writeFile(path,JSON.stringify({version:1,appId:manifest.id,engineUrl:url,credential,...(manifest.adapter==='core'?{controlToken}:{})},null,2)+'\n',{mode:0o600});
  }
  await writeFile(join(home,'core.json'),JSON.stringify({version:1,url,controlToken},null,2)+'\n',{mode:0o600});return server;
 }catch(error){server.workspaceRegistry?.close();server.closeAllConnections();await new Promise(done=>server.close(done));throw error;}
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const flags=process.argv.slice(2);if(flags.some(a=>!['--production','--dev'].includes(a)))throw new Error('Usage: node scripts/engine.mjs [--dev] [--production]');
 try{
  const server=await startEngine({production:flags.includes('--production'),devMode:flags.includes('--dev')});console.log('Mallea Core: http://127.0.0.1:4318'+(flags.includes('--dev')?' (dev mode)':''));console.log('Native hosts: .mallea/hosts/scratchpad-main.json and .mallea/hosts/review-main.json (private configuration).');
  let stopping=false;function stop(){if(stopping)return;stopping=true;server.workspaceRegistry.close();server.closeAllConnections();server.close(()=>process.exit(0));}process.on('SIGINT',stop);process.on('SIGTERM',stop);
 }catch(error){console.error(error.code==='EADDRINUSE'?'Port 4318 is already in use. If Core is running, reopen its dashboard instead. Existing native connection files were retained.':'Core could not start. Check its local configuration and data-folder access.');process.exitCode=1;}
}
