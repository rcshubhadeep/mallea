import{readFile,access}from'node:fs/promises';import{resolve,join,isAbsolute}from'node:path';import{fileURLToPath}from'node:url';import{launchNative}from'../../scripts/lib/native-launch.mjs';
const checkout=fileURLToPath(new URL('../../',import.meta.url));
export class AppLauncher{
 constructor({engine,registry,home,spawnProcess}){Object.assign(this,{engine,registry,home:resolve(home??'.mallea'),spawnProcess});this.pending=new Map();}
 async launch(input){
  if(!input||Object.keys(input).some(k=>k!=='appId')||typeof input.appId!=='string'||!/^[a-z][a-z0-9-]{2,39}$/.test(input.appId))throw new Error('Choose a registered app.');const {appId}=input;this.engine.manifest(appId);
  if(this.registry.online(appId))return{status:'already-running',message:'This app is already running. Switch to its window.'};
  if(this.pending.has(appId))return this.pending.get(appId);
  const opening=this.open(appId);this.pending.set(appId,opening);try{const result=await opening;const timer=setTimeout(()=>{if(this.pending.get(appId)===opening)this.pending.delete(appId);},10000);timer.unref();return result;}catch(error){this.pending.delete(appId);throw error;}
 }
 async open(appId){
  let project;try{const projects=JSON.parse(await readFile(join(this.home,'projects.json'),'utf8'));project=projects[appId];}catch(e){if(e.code!=='ENOENT')throw new Error('Local project locations could not be read.');}
  const binaryName=process.platform==='win32'?'mallea-project.exe':'mallea-project';let binary,host;
  if(project){if(typeof project.folder!=='string'||!isAbsolute(project.folder)||project.binary!==join(project.folder,'src-tauri/target/release',binaryName))throw new Error('This project needs valid local launch registration.');binary=project.binary;host=join(project.folder,'.mallea/host.json');
   let manifest;try{manifest=JSON.parse(await readFile(join(project.folder,'app.manifest.json'),'utf8'));}catch{throw new Error('The project folder is unavailable. Restore its location or open the project manually from its new folder.');}if(manifest.id!==appId)throw new Error('Project identity does not match its registration.');
  }else{binary=join(checkout,'apps/desktop/src-tauri/target/release',process.platform==='win32'?'mallea-desktop.exe':'mallea-desktop');host=join(this.home,'hosts',appId+'.json');}
  try{await access(binary);}catch{throw new Error('Native build missing. Build this app before opening it.');}
  let config;try{config=JSON.parse(await readFile(host,'utf8'));}catch{throw new Error('Local app registration is missing. Register the app before opening it.');}
  if(config.version!==1||config.appId!==appId||config.engineUrl!=='http://127.0.0.1:4318')throw new Error('Local app registration does not match this app.');this.engine.authenticate(appId,config.credential);
  await launchNative(binary,host,this.spawnProcess);return{status:'opening',message:'Opening '+this.engine.manifest(appId).name+'…'};
 }
}
