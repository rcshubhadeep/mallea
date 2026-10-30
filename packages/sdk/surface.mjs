import { z } from 'zod';

export const localPermission='surface.local.write';
const fieldName=z.string().regex(/^[a-z][a-zA-Z0-9_]{0,39}$/).refine(k=>!['constructor','prototype','__proto__'].includes(k));
const localField=z.object({type:z.enum(['text','color']),initial:z.string().max(2000)}).strict().refine(f=>f.type!=='color'||/^#[\da-f]{6}$/i.test(f.initial));
const localSchema=z.record(fieldName,localField).refine(v=>Object.keys(v).length<=16,'At most 16 local fields.');
export function withSurfaceState(contract){return {...contract,permissions:[...new Set([...contract.permissions,localPermission])],localState:{types:['text','color'],maxFields:16,maxTextLength:2000,binding:'local.fieldName',editing:'Declare state fields on the artifact; input binds local.fieldName without an action or argument. Framework stores them separately from app resources.'}};}
export function localKey(bind){return typeof bind==='string'&&/^local\.[a-z][a-zA-Z0-9_]{0,39}$/.test(bind)?bind.slice(6):null;}
export function localDefaults(artifact,values={}){return Object.fromEntries(Object.entries(artifact.state??{}).map(([key,field])=>[key,typeof values[key]==='string'?values[key]:field.initial]));}
export function validateLocalValues(artifact,values){
 if(!artifact.manifest.permissions.includes(localPermission))throw new Error('Surface local-state access is not installed.');
 const shape=Object.fromEntries(Object.entries(artifact.state??{}).map(([key,field])=>[key,field.type==='color'?z.string().regex(/^#[\da-f]{6}$/i):z.string().max(2000)]));
 return z.object(shape).strict().parse(values);
}

const style = z.object({background:z.string().regex(/^#[\da-f]{6}$/i).optional(),color:z.string().regex(/^#[\da-f]{6}$/i).optional(),gap:z.number().int().min(0).max(40).optional(),padding:z.number().int().min(0).max(40).optional(),fontWeight:z.union([z.enum(['normal','bold']),z.number().int().min(100).max(900)]).optional(),fontSize:z.number().int().min(10).max(48).optional(),fontStyle:z.enum(['normal','italic']).optional(),textAlign:z.enum(['left','center','right']).optional(),textDecoration:z.enum(['none','underline','line-through']).optional(),lineHeight:z.number().min(1).max(2.5).optional(),borderRadius:z.number().int().min(0).max(32).optional(),borderWidth:z.number().int().min(0).max(4).optional(),borderColor:z.string().regex(/^#[\da-f]{6}$/i).optional()}).strict();
const node = z.lazy(()=>z.object({id:z.string().regex(/^[a-z][\w-]{0,50}$/),type:z.enum(['stack','split','grid','row','details','text','image','button','input','textarea','color','choice','component','repeat']),label:z.string().max(100).optional(),text:z.string().max(400).optional(),bind:z.string().max(100).optional(),action:z.string().max(80).optional(),argument:z.string().max(50).optional(),value:z.string().max(2000).optional(),disabledBind:z.string().max(100).optional(),appearance:z.enum(['workspace','sidebar','card','toolbar','title','muted','eyebrow','badge','primary']).optional(),options:z.array(z.object({label:z.string().min(1).max(50),value:z.string().max(2000)}).strict()).min(1).max(12).optional(),component:z.string().max(60).optional(),style:style.optional(),children:z.array(node).max(20).optional()}).strict());
const schema=z.object({manifest:z.object({id:z.string().regex(/^[a-z][a-z0-9-]{2,40}$/),title:z.string().min(1).max(80),version:z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/),sdkVersion:z.literal('0.3'),permissions:z.array(z.string()).max(20)}).strict(),state:localSchema.optional(),ui:node}).strict();

export function validateSurface(value,contract){
  const artifact=schema.parse(value);let count=0;const ids=new Set(),components=[];
  const permissions=artifact.manifest.permissions;
  if(new Set(permissions).size!==permissions.length||permissions.some(p=>p!==localPermission&&!contract.permissions.includes(p)))throw new Error('Unknown or duplicate permission.');
  if(Object.keys(artifact.state??{}).length&&!permissions.includes(localPermission))throw new Error('Declare surface.local.write for local fields.');
  function walk(n,depth=0){
    if(++count>80||depth>8||ids.has(n.id))throw new Error('Surface exceeds limits or duplicates a node ID.');ids.add(n.id);
    const key=localKey(n.bind),local=key&&Object.hasOwn(artifact.state??{},key)?artifact.state[key]:null;
    const bindingType=local?.type??contract.fields[n.bind];
    if(n.bind&&!local&&!Object.hasOwn(contract.fields,n.bind))throw new Error(`Unknown binding: ${n.bind}`);
    if(n.bind&&!local&&!permissions.includes(contract.readPermission))throw new Error('Declare resource read permission.');
    if(n.type==='component'){
      if(!contract.components.includes(n.component))throw new Error('Unknown trusted component.');
      if(!permissions.includes(contract.readPermission))throw new Error('Trusted component needs declared resource read permission.');components.push(n.component);
    }else if(n.component)throw new Error('Component reference requires component type.');
    if(n.disabledBind&&(contract.fields[n.disabledBind]!=='boolean'||!permissions.includes(contract.readPermission)))throw new Error('Disabled state requires permitted boolean binding.');
    const input=['input','textarea','color','choice'].includes(n.type);
    if(input&&local&&(n.action||n.argument))throw new Error('Local input uses framework state binding; omit action and argument.');
    if(input&&!local&&(!n.bind||!n.action||!n.argument))throw new Error('Editable app fields require binding, action and argument.');
    if(n.type==='image'&&contract.fields[n.bind]!=='image')throw new Error('Image requires registered image binding.');
    if(n.type==='repeat'&&contract.fields[n.bind]!=='list')throw new Error('Repeat requires registered list binding.');
    if(input&&(n.type==='choice'?!['text','color'].includes(bindingType):bindingType!== (n.type==='color'?'color':'text')))throw new Error('Input binding has incompatible type.');
    if(n.type==='choice'){
      if(!n.options?.length||new Set(n.options.map(o=>o.value)).size!==n.options.length)throw new Error('Choice requires unique options.');
      if(bindingType==='color'&&n.options.some(o=>!/^#[\da-f]{6}$/i.test(o.value)))throw new Error('Color choice requires hex values.');
      const allowed=contract.actions[n.action]?.values;if(allowed&&n.options.some(o=>!allowed.includes(o.value)))throw new Error('Choice value is not allowed by the action.');
    }else if(n.options)throw new Error('Options require choice control.');
    if(n.action){const action=contract.actions[n.action];if(!action||!permissions.includes(n.action))throw new Error('Action is unknown or undeclared.');
      if(!['button','input','textarea','color','choice'].includes(n.type))throw new Error('Only controls can invoke actions.');
      if(input&&action.argument!==n.argument)throw new Error('Action argument mismatch.');
      if(input&&action.binding&&action.binding!==n.bind)throw new Error('Action does not update this binding.');
      if(n.type==='button'&&action.argument&&(n.argument!==action.argument||n.value===undefined))throw new Error('Button requires declared literal action argument.');
      if(n.type==='button'&&!action.argument&&(n.argument||n.value!==undefined))throw new Error('This action takes no arguments.');
      if(n.type==='button')dispatchSurfaceAction(contract,permissions,n.action,action.argument?{[action.argument]:n.value}:{},()=>{});
    }else if(n.argument)throw new Error('Argument needs an action.');
    if(n.type==='button'&&!n.action)throw new Error('Button needs registered action.');
    if(n.type!=='button'&&n.value!==undefined)throw new Error('Literal value requires button.');
    if(n.children&& !['stack','split','grid','row','details'].includes(n.type))throw new Error('Only layouts have children.');
    if(['stack','split','grid','row','details'].includes(n.type)&&!n.children?.length&&!(depth===0&&n.type==='stack'))throw new Error('Layout needs children.');
    for(const c of n.children??[])walk(c,depth+1);
  }walk(artifact.ui);
  for(const required of contract.requiredComponents??[])if(components.filter(c=>c===required).length!==1)throw new Error(`Keep exactly one ${required} in the workspace.`);
  if(new Set(components).size!==components.length)throw new Error('A trusted component can appear only once.');
  return artifact;
}

export function readBinding(snapshot,path){return path?.split('.').reduce((value,key)=>value&&Object.hasOwn(value,key)?value[key]:undefined,snapshot);}

export function dispatchSurfaceAction(contract,permissions,name,args,invoke){
  const action=Object.hasOwn(contract.actions,name)?contract.actions[name]:null;
  if(!action||!permissions.includes(name))throw new Error('Action access is not declared.');
  const expected=action.argument?[action.argument]:[];
  if(!args||Object.keys(args).length!==expected.length||expected.some(k=>!Object.hasOwn(args,k)||typeof args[k]!=='string'||args[k].length>2000))throw new Error('Invalid action arguments.');
  if(action.binding&&contract.fields[action.binding]==='color'&&!/^#[\da-f]{6}$/i.test(args[action.argument]))throw new Error('Invalid color value.');
  if(action.values&&!action.values.includes(args[action.argument]))throw new Error('Action value is not allowed.');
  return invoke(name,args);
}

export const surfacePrompt=`Return JSON only. Use the supplied running app contract/model. Surface node grammar follows; when editing, use the targeted change-proposal instructions. A full artifact has {manifest:{id,title,version,sdkVersion:"0.3",permissions:string[]},state?:{fieldName:{type:"text"|"color",initial:string}},ui:Node}. Use supplied id/version. Node={id,type,label?,text?,bind?,action?,argument?,component?,style?,children?}. Every node ID unique. Types stack/split/grid have nonempty children; text uses literal text or registered bind; image binds registered image; repeat binds registered list and renders its text items; component names a registered trusted component. Keep each required component exactly once. For existing APP fields, input/textarea/color require bind, action, argument exactly as contract. For NEW LOCAL fields, declare state on the artifact (up to 16 keys, /^[a-z][a-zA-Z0-9_]{0,39}$/, excluding constructor/prototype; initial text <=2000, initial color #rrggbb). Bind local.fieldName and OMIT action/argument: the framework automatically edits and persists it. Declare surface.local.write permission. This is available in BOTH desktop and web, even when app resources are read-only. New local notes/text boxes do NOT require an app-specific writable resource or action. State is private to this app/Surface, never another app. Preserve existing state key/type through refinement and retain existing working content unless asked otherwise. Preview local edits never persist; installation starts from defaults/existing saved values, not preview text. Buttons require a registered action; argument-free actions take no value. A button for a single-argument action declares argument plus literal value, validated against the action. Declare permissions from contract plus framework surface.local.write when declaring local fields. App bindings require readPermission; local bindings use surface.local.write. Action names are permissions for app actions. Fields are data bindings, not JavaScript. No HTML, scripts, URLs, imports, hidden expressions or unknown properties. Up to 80 nodes/depth 8, 20 children per layout; text <=400,label <=100. Style fields: background/color/borderColor hex; gap/padding integers 0..40; fontWeight normal/bold or 100..900; fontSize 10..48; fontStyle normal/italic; textAlign left/center/right; textDecoration none/underline/line-through; lineHeight 1..2.5; borderRadius 0..32; borderWidth 0..4. App shell stays outside; recompose meaningful workspace and retain working canvas/data. Model can combine, reorder, group controls and adjust appearance; do not substitute a fixed template. If request cannot fit available capabilities, return only {unsupported:{reason,alternative}} with nonempty strings <=500 chars. Never silently claim unsupported behavior. Also supported: row (wrapping horizontal layout), details (collapsible layout with label), and choice (input with bind/action/argument or local binding and options:[{label,value}], 1-12 unique choices). Choices for a color binding use hex values; action.values, when supplied, restricts choices/literal values. Layouts row/details need children. Appearance is an optional token: workspace/sidebar/card/toolbar/title/muted/eyebrow/badge/primary. workspace is responsive three-column presentation; no arbitrary classes/CSS. Optional disabledBind references a registered boolean field with read permission. App operational buttons (save, refresh, access) use registered actions; they do not execute in preview. Built-in app sections are ordinary Surface nodes: preserve their stable IDs and working bindings unless asked to alter them. Preview/install and permissions enforced by host.`;
