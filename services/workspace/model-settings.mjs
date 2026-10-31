import {inferenceConfig} from '../../scripts/lib/inference.mjs';

// These are registered Meta identities, not arbitrary labels supplied by an app.
const identities=new Map([
 ['meta/muse-spark-open','Muse Spark Open'],['muse-spark-open','Muse Spark Open'],
 ['muse-spark-1.3','Muse Spark 1.3'],['muse-spark-1.3-contributor','Muse Spark 1.3 Contributor'],
 ['muse-wonder','Muse Wonder'],['muse-spark-1.2','Muse Spark 1.2'],
 ['muse-spark-1.2-contributor','Muse Spark 1.2 Contributor']
]);
export class ModelSettings {
 constructor({production=false,config}={}){this.profiles=new Map();this.selected=production?'production':'development';this.revision=0;
  for(const id of ['development','production']){try{const c=config&&id===this.selected?config:inferenceConfig(id==='production',{allowMissingKey:true});if(identities.has(c.model))this.profiles.set(id,{...c,endpoint:new URL(c.endpoint)});}catch{/* Unconfigured profiles stay unavailable. */}}
 }
 public(){return{revision:this.revision,selected:this.selected,ready:!!this.profiles.get(this.selected)?.key?.trim(),storage:'Session only; environment configuration is restored when Core restarts.',profiles:[...this.profiles].map(([id,c])=>({id,name:(id==='development'?'Development':'Demo')+' · '+identities.get(c.model),model:c.model})),model:identities.get(this.profiles.get(this.selected)?.model)??'Not configured'};}
 config(){const c=this.profiles.get(this.selected);if(!c?.key?.trim())throw new Error('Configure an explicit registered Meta model profile and session key in Core.');return{...c,endpoint:new URL(c.endpoint)};}
 configure(input){if(!input||Object.keys(input).some(k=>!['profile','key'].includes(k))||!this.profiles.has(input.profile))throw new Error('Choose a configured Meta profile.');if(input.key!==undefined&&(typeof input.key!=='string'||!input.key.trim()||input.key.length>4096))throw new Error('Enter a valid session key.');const c=this.profiles.get(input.profile);if(input.key)this.profiles.set(input.profile,{...c,key:input.key});this.selected=input.profile;this.revision++;return this.public();}
}
