const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));

// Core-owned policy. Request text and model tool arguments cannot widen it.
export function authoringPolicy(scope, intent='add') {
 if(!['add','app'].includes(intent))throw new Error('Choose independent addition or app-wide editing.');
 return {scope:scope??null,intent:scope?'surface':intent};
}
const strings=value=>typeof value==='string'?[value]:Array.isArray(value)?value.flatMap(strings):value&&typeof value==='object'?Object.values(value).flatMap(strings):[];
export function enforceAuthoringPolicy(before,after,policy){
 if(!policy||policy.intent==='app')return;
 const same=(a,b,message)=>{if(!equal(a,b))throw new Error(message);};
 same(before.layout,after.layout,'This mode cannot rearrange the app.');same(before.theme,after.theme,'This mode cannot change the app theme.');
 const oldIds=new Set(before.surfaces.map(s=>s.id));
 if(policy.intent==='add'){
  same(before.surfaces,after.surfaces.filter(s=>oldIds.has(s.id)),'Adding a Surface must preserve every existing Surface and its order.');
  for(const [id,m]of Object.entries(before.models))same(m,after.models[id],'Adding a Surface cannot modify existing models.');
  for(const surface of after.surfaces.filter(s=>!oldIds.has(s.id))){
   if(surface.placement!=='independent')throw new Error('An independent addition requires independent placement.');
   // Even a literal action destination is a model reference, not only a bind property.
   if(strings(surface.ui).some(s=>s.startsWith('models.')&&Object.hasOwn(before.models,s.split('.')[1])))throw new Error('Independent additions must use new models. Choose app-wide editing to share existing state.');
   const visit=n=>{if(n.type==='component'||(n.action&&!['data.set','collection.append','collection.remove','collection.clear','collection.select','collection.update'].includes(n.action)))throw new Error('Independent additions cannot invoke adapter behavior. Choose app-wide editing.');for(const c of n.children??[])visit(c);if(n.template)visit(n.template);};visit(surface.ui);
  }
 }else{
  same(before.surfaces.map(s=>s.id),after.surfaces.map(s=>s.id),'Scoped editing cannot add, remove or reorder Surfaces.');
  for(const s of before.surfaces)if(s.id!==policy.scope)same(s,after.surfaces.find(t=>t.id===s.id),'Scoped editing cannot change another Surface.');
  // Model extension is app-wide schema authoring. Existing values/types remain untouched.
  for(const [id,m]of Object.entries(before.models))same(m,after.models[id],'Scoped editing cannot change existing models. Create a new model or explicitly edit the whole app.');
 }
}
