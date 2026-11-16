import {inferenceConfig,chatEndpoint} from '../../scripts/lib/inference.mjs';
function validateConfig(c){
 if(typeof c.model!=='string'||!c.model.trim()||c.model.length>200||/[\r\n\x00]/.test(c.model))throw new Error('Enter an exact model identifier.');
 if(!['tools','json'].includes(c.mode??'tools'))throw new Error('Choose Tools or Basic JSON authoring.');
 if(typeof c.key!=='string'||c.key.length>4096||/[\r\n\x00]/.test(c.key))throw new Error('Enter a valid session key.');
 return{endpoint:chatEndpoint(c.endpoint),model:c.model.trim(),key:c.key,mode:c.mode??'tools'};
}
export class ModelSettings{
 constructor({config,installed=false}={}){this.installed=installed;this.revision=0;this.current=null;if(installed)return;
  if(config)this.current=validateConfig(config);
  else try{this.current=validateConfig(inferenceConfig({allowMissingKey:true}));}catch{/* Core settings can be supplied in the dashboard. */}
 }
 public(){const c=this.current;return{revision:this.revision,installed:this.installed,ready:!!c?.key?.trim(),storage:this.installed?'Session only; re-enter model access after Core restarts.':'Session only; environment configuration is restored when Core restarts.',endpoint:c?.endpoint.href??'',mode:c?.mode??'tools',model:c?.model??''};}
 config(){const c=this.current;if(!c?.key?.trim())throw new Error('Configure an endpoint, model and session key in Core settings.');return{...c,endpoint:new URL(c.endpoint)};}
 configure(input){
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['key','endpoint','model','mode'].includes(k)))throw new Error('Supply Core model settings only.');
  const old=this.current;
  const destinationChanged=!old||chatEndpoint(input.endpoint??old.endpoint).href!==old.endpoint.href||(input.model??old.model)!==old.model;
  const next=validateConfig({...old,...input,key:input.key??(destinationChanged?'':old?.key??'')});
  if(!next.key.trim())throw new Error('Enter a session key for this endpoint and model.');
  this.current=next;this.revision++;return this.public();
 }
}
