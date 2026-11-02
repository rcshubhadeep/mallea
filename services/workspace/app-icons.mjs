import{readFileSync,statSync}from'node:fs';import{mkdir,writeFile,rm}from'node:fs/promises';import{join,resolve}from'node:path';import{fileURLToPath}from'node:url';
import{imageConfig,generateImage,iconPrompt}from'../../scripts/lib/inference.mjs';import{defaultTheme}from'../../packages/sdk/live-model.mjs';
// Bundled icons for built-in apps and store listings; generated app icons live in Core's private home.
export const iconDirectory=fileURLToPath(new URL('../../apps/definitions/icons/',import.meta.url));
const extensions={'image/webp':'webp','image/png':'png','image/jpeg':'jpg'},colours={olive:'olive green',indigo:'indigo',teal:'teal',rose:'rose pink',amber:'warm amber',slate:'slate blue-grey'};
export function bundledIcon(name){try{return'data:image/png;base64,'+readFileSync(join(iconDirectory,name+'.png')).toString('base64');}catch{return null;}}
export class AppIcons{
 constructor({home='.mallea',config=imageConfig,generate=generateImage}={}){Object.assign(this,{dir:join(resolve(home),'icons'),config,generate});this.cache=new Map();}
 file(id){for(const[type,ext]of Object.entries(extensions)){const path=join(this.dir,id+'.'+ext);try{return{path,type,mtime:statSync(path).mtimeMs};}catch{}}const path=join(iconDirectory,id+'.png');try{return{path,type:'image/png',mtime:statSync(path).mtimeMs};}catch{return null;}}
 get(id){const f=this.file(id);if(!f)return null;const hit=this.cache.get(id);if(hit?.mtime===f.mtime)return hit.value;const value=`data:${f.type};base64,`+readFileSync(f.path).toString('base64');this.cache.set(id,{mtime:f.mtime,value});return value;}
 available(){return!!this.config();}
 async create({appId,name,purpose,adapter='surface'},signal){if(!/^[a-z][a-z0-9-]{2,40}$/.test(appId))throw new Error('Invalid app ID.');const config=this.config();if(!config)throw new Error('Icon generation is off. Set PROD_IMAGE_MODEL with the production profile to enable it.');
  const image=await this.generate(config,iconPrompt(name,purpose,colours[defaultTheme(adapter,appId).accent]),signal);await mkdir(this.dir,{recursive:true});
  for(const ext of Object.values(extensions))await rm(join(this.dir,appId+'.'+ext),{force:true});await writeFile(join(this.dir,appId+'.'+extensions[image.type]),image.bytes);this.cache.delete(appId);return{type:image.type,usage:image.usage};}
}
