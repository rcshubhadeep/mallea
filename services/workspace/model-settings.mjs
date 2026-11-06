import {inferenceConfig,chatEndpoint} from '../../scripts/lib/inference.mjs';
function profile(c){
 if(typeof c.model!=='string'||!c.model.trim()||c.model.length>200||/[\r\n\x00]/.test(c.model))throw new Error('Enter an exact model identifier.');
 if(!['tools','json'].includes(c.mode??'tools'))throw new Error('Choose Tools or Basic JSON authoring.');
 if(typeof c.key!=='string'||c.key.length>4096||/[\r\n\x00]/.test(c.key))throw new Error('Enter a valid session key.');
 return{endpoint:chatEndpoint(c.endpoint),model:c.model.trim(),key:c.key,mode:c.mode??'tools'};
}
export class ModelSettings{
 constructor({production=false,config}={}){this.profiles=new Map();this.selected=production?'production':'development';this.revision=0;
  for(const id of ['development','production'])try{this.profiles.set(id,profile(config&&id===this.selected?config:inferenceConfig(id==='production',{allowMissingKey:true})));}catch{/* Unconfigured profiles stay unavailable. */}
 }
 public(){const selected=this.profiles.get(this.selected);return{revision:this.revision,selected:this.selected,ready:!!selected?.key?.trim(),storage:'Session only; environment configuration is restored when Core restarts.',profiles:[...this.profiles].map(([id,c])=>({id,name:(id==='custom'?'Custom':id==='development'?'Development':'Demo')+' · '+c.model,model:c.model,endpoint:c.endpoint.href,mode:c.mode})),model:selected?.model??'Not configured'};}
 config(){const c=this.profiles.get(this.selected);if(!c?.key?.trim())throw new Error('Configure an endpoint, model and session key in Core settings.');return{...c,endpoint:new URL(c.endpoint)};}
 configure(input){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['profile','key','endpoint','model','mode'].includes(k))||(!this.profiles.has(input.profile)&&input.profile!=='custom'))throw new Error('Choose a configured profile or Custom.');
  const old=this.profiles.get(input.profile);
  if(input.profile!=='custom'&&(input.endpoint!==undefined||input.model!==undefined))throw new Error('Choose Custom to change endpoint or model.');
  const destinationChanged=input.profile==='custom'&&(!old||chatEndpoint(input.endpoint??old.endpoint).href!==old.endpoint.href||(input.model??old.model)!==old.model);
  const next=profile({...old,...input,key:input.key??(destinationChanged?'':old?.key??'')});
  if(!next.key.trim())throw new Error('Enter a session key for this endpoint and model.');
  this.profiles.set(input.profile,next);this.selected=input.profile;this.revision++;return this.public();
 }
}
