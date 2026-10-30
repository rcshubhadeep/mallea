import {z}from'zod';
import{validateSurface,withSurfaceState,surfacePrompt}from'./surface.mjs';
export const appIdSchema=z.string().regex(/^[a-z][a-z0-9-]{2,39}$/);
export const appManifestSchema=z.object({version:z.literal(1),id:appIdSchema,name:z.string().min(1).max(80),author:z.string().min(1).max(100),purpose:z.string().min(1).max(500),adapter:z.enum(['fieldnote','parcel','surface']),initialSurface:z.unknown().optional()}).strict();
export const genericContract=withSurfaceState({readPermission:'app.read',permissions:['app.read'],fields:{},actions:{},components:[]});
export function blankSurface(id,name){return {manifest:{id,version:'1.0.0',sdkVersion:'0.3',title:name,permissions:[]},ui:{id:'workspace',type:'stack',children:[]}};}
export function validateAppManifest(value){const manifest=appManifestSchema.parse(value);if(manifest.adapter!=='surface'&&manifest.initialSurface)throw new Error('Built-in adapters supply their own initial Surface.');if(manifest.initialSurface)validateSurface(manifest.initialSurface,genericContract);return manifest;}
export function genericDefinition(manifest){const initialSurface=manifest.initialSurface??blankSurface(manifest.id,manifest.name);return {kind:'surface-app',title:manifest.name,purpose:manifest.purpose,provides:[],slots:['workspace'],resources:[],actions:[],contract:genericContract,contractPrompt:surfacePrompt,packageId:initialSurface.manifest.id,initialSurface,validate:a=>validateSurface(a,genericContract),verify:async a=>validateSurface(a,genericContract),initialRequest:'Add a new local notes panel with an editable multiline field. Keep other content unchanged.'};}
export const builtinManifests=[{version:1,id:'scratchpad-main',name:'Fieldnote',author:'Mallea demo project',purpose:'Annotate artwork, save versions and read permitted review feedback.',adapter:'fieldnote'},{version:1,id:'review-main',name:'Parcel',author:'Mallea demo project',purpose:'Review saved artwork and record feedback.',adapter:'parcel'}];

// Inventory is derived from declared API bindings and controls, never raw DOM listeners.
export function surfaceCatalogue(appId,model,contract){
 const elements=[];function walk(n){const events=[];
  if(['input','textarea'].includes(n.type))events.push({id:'value.changed',label:'When I type'},{id:'field.left',label:'When I leave this field'});
  if(['choice','color'].includes(n.type))events.push({id:'value.changed',label:'When I choose a value'});
  if(n.type==='button'&&n.action)events.push({id:'activated',label:'When I click'});
  elements.push({id:n.id,appId,surfaceId:model.manifest.id,type:n.type,label:n.label??n.id,...(n.bind?{binding:n.bind}:{}),...(n.action?{action:n.action}:{}),events});for(const child of n.children??[])walk(child);
 }walk(model.ui);
 const fields={...contract.fields,...Object.fromEntries(Object.entries(model.state??{}).map(([key,v])=>[`local.${key}`,v.type]))};
 const groups={};for(const [path,type]of Object.entries(fields)){const [id,...parts]=path.split('.');(groups[id]??=[]).push({path:parts.join('.'),type});}
 return {id:model.manifest.id,appId,title:model.manifest.title,version:model.manifest.version,lifetime:'persistent',elements,models:Object.entries(groups).map(([id,fields])=>({id,appId,surfaceId:model.manifest.id,fields}))};
}
