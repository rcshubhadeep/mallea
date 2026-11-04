import {inferenceConfig} from '../../scripts/lib/inference.mjs';

// These are registered Meta identities, not arbitrary labels supplied by an app.
const identities=new Map([
 ['meta/muse-spark-open','Muse Spark Open'],['muse-spark-open','Muse Spark Open'],
 ['muse-spark-1.3','Muse Spark 1.3'],['muse-spark-1.3-contributor','Muse Spark 1.3 Contributor'],
 ['muse-wonder','Muse Wonder'],['muse-spark-1.2','Muse Spark 1.2'],
 ['muse-spark-1.2-contributor','Muse Spark 1.2 Contributor']
]);
export class ModelSettings {
 constructor({production=false,config,installed=false}={}){this.profiles=new Map();this.installed=installed;this.selected=installed?'user':production?'production':'development';this.revision=0;
  if(installed)return;
  for(const id of ['development','production']){try{const c=config&&id===this.selected?config:inferenceConfig(id==='production',{allowMissingKey:true});if(identities.has(c.model))this.profiles.set(id,{...c,endpoint:new URL(c.endpoint)});}catch{/* Unconfigured profiles stay unavailable. */}}
 }
 public(){return{revision:this.revision,selected:this.selected,installed:this.installed,endpoint:this.installed?(this.profiles.get('user')?.endpoint?.href??''):'',modelId:this.profiles.get(this.selected)?.model??'',identities:[...identities].map(([id,name])=>({id,name})),ready:!!this.profiles.get(this.selected)?.key?.trim(),storage:this.installed?'Session only; re-enter model access after Core restarts.':'Session only; environment configuration is restored when Core restarts.',profiles:[...this.profiles].map(([id,c])=>({id,name:(id==='user'?'Your model':id==='development'?'Development':'Demo')+' · '+identities.get(c.model),model:c.model})),model:identities.get(this.profiles.get(this.selected)?.model)??'Not configured'};}
 config(){const c=this.profiles.get(this.selected);if(!c?.key?.trim())throw new Error('Configure an explicit registered Meta model profile and session key in Core.');return{...c,endpoint:new URL(c.endpoint)};}
 configure(input){
  if(this.installed){
   if(!input||Object.keys(input).some(k=>!['profile','key','endpoint','model'].includes(k))||input.profile!=='user'||!identities.has(input.model))throw new Error('Choose a registered Meta model.');
   if(typeof input.key!=='string'||!input.key.trim()||input.key.length>4096||/[\r\n]/.test(input.key))throw new Error('Enter your session API key.');
   let endpoint;try{if(typeof input.endpoint!=='string'||input.endpoint.length>2048)throw new Error();endpoint=new URL(input.endpoint);}catch{throw new Error('Enter a valid HTTPS API base URL.');}
   if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw new Error('Use an HTTPS API base URL without credentials, query or fragment.');
   endpoint.pathname=endpoint.pathname.replace(/\/+$/,'').replace(/\/(?:responses|chat\/completions)$/,'')+'/chat/completions';
   this.profiles.set('user',{endpoint,model:input.model,key:input.key.trim()});this.selected='user';this.revision++;return this.public();
  }
  if(!input||Object.keys(input).some(k=>!['profile','key'].includes(k))||!this.profiles.has(input.profile))throw new Error('Choose a configured Meta profile.');if(input.key!==undefined&&(typeof input.key!=='string'||!input.key.trim()||input.key.length>4096))throw new Error('Enter a valid session key.');const c=this.profiles.get(input.profile);if(input.key)this.profiles.set(input.profile,{...c,key:input.key});this.selected=input.profile;this.revision++;return this.public();
 }
}
