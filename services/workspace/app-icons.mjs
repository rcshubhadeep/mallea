import{readFileSync,statSync}from'node:fs';import{join,resolve}from'node:path';import{fileURLToPath}from'node:url';

// Bundled stock icons require no model. Previously saved custom icons remain usable.
export const iconDirectory=fileURLToPath(new URL('../../apps/definitions/icons/',import.meta.url));
const extensions={'image/webp':'webp','image/png':'png','image/jpeg':'jpg'};
const stock=['store-daylight','store-folio','store-lumen','store-relay','store-stillroom','store-threadboard'];
export function bundledIcon(name){try{return'data:image/png;base64,'+readFileSync(join(iconDirectory,name+'.png')).toString('base64');}catch{return null;}}
export class AppIcons{
 constructor({home='.mallea'}={}){this.dir=join(resolve(home),'icons');this.cache=new Map();}
 file(id){for(const[type,ext]of Object.entries(extensions)){const path=join(this.dir,id+'.'+ext);try{return{path,type,mtime:statSync(path).mtimeMs};}catch{}}const path=join(iconDirectory,id+'.png');try{return{path,type:'image/png',mtime:statSync(path).mtimeMs};}catch{return null;}}
 get(id){if(!/^[a-z][a-z0-9-]{2,60}$/.test(id))return null;const f=this.file(id);if(!f){const hash=[...id].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);return bundledIcon(stock[hash%stock.length]);}const hit=this.cache.get(id);if(hit?.mtime===f.mtime)return hit.value;const value=`data:${f.type};base64,`+readFileSync(f.path).toString('base64');this.cache.set(id,{mtime:f.mtime,value});return value;}
}
