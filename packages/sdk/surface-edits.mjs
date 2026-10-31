import {z}from'zod';
import{validateSurface}from'./surface.mjs';
const id=z.string().regex(/^[a-z][\w-]{0,50}$/),index=z.number().int().min(0).max(20);
const operation=z.discriminatedUnion('op',[
 z.object({op:z.literal('set'),id,props:z.record(z.string(),z.unknown()).refine(v=>Object.keys(v).length>0)}).strict(),
 z.object({op:z.literal('insert'),parentId:id,index,node:z.unknown()}).strict(),
 z.object({op:z.literal('move'),id,parentId:id,index}).strict(),
 z.object({op:z.literal('remove'),id}).strict(),
]);
const proposal=z.object({changes:z.array(operation).min(1).max(20),title:z.string().min(1).max(80).optional(),state:z.record(z.string(),z.unknown()).optional(),permissions:z.array(z.string()).max(20).optional()}).strict();
const layouts=['stack','split','grid','row','details'];
function locate(root,id,parent=null){if(root.id===id)return {node:root,parent};for(const child of root.children??[]){const found=locate(child,id,root);if(found)return found;}return null;}
function requireNode(root,id){const found=locate(root,id);if(!found)throw new Error(`Unknown target node: ${id}`);return found;}
function insert(parent,index,node){if(!layouts.includes(parent.type)||!Array.isArray(parent.children))throw new Error('Insert/move target must be a layout.');if(index>parent.children.length)throw new Error('Position is outside the target layout.');parent.children.splice(index,0,node);}

// A bounded app-model edit vocabulary, not arbitrary property-path execution.
// Work on a copy; only a fully validated final model leaves this function.
export function applySurfaceChanges(current,input,contract,{id:packageId,version,validate=validateSurface}){
 const change=proposal.parse(input),next=structuredClone(current),summary=[];
 next.manifest={...next.manifest,id:packageId,version,...(change.title?{title:change.title}:{})};
 if(change.state){for(const [key,value]of Object.entries(change.state)){if(next.state?.[key]&&next.state[key].type!==value?.type)throw new Error('Keep existing local field types; use a new key for a different type.');}next.state={...next.state,...change.state};}
 if(change.permissions)next.manifest.permissions=[...new Set([...next.manifest.permissions,...change.permissions])];
 for(const op of change.changes){
  if(op.op==='set'){
   if(Object.keys(op.props).some(k=>['id','children','__proto__','constructor','prototype'].includes(k)))throw new Error('Use structural operations for IDs/children.');
   const {node}=requireNode(next.ui,op.id);for(const [key,value]of Object.entries(op.props))node[key]=key==='style'?{...node.style,...value}:value;
   summary.push(`Update ${op.id}: ${Object.keys(op.props).join(', ')}`);
  }else if(op.op==='insert'){
   insert(requireNode(next.ui,op.parentId).node,op.index,structuredClone(op.node));summary.push(`Add ${op.node?.id??'element'} to ${op.parentId}`);
  }else{
   const found=requireNode(next.ui,op.id);if(!found.parent)throw new Error('Keep the workspace root; edit its properties instead.');
   if(op.op==='move'&&locate(found.node,op.parentId))throw new Error('Cannot move an element into itself or its descendants.');
   found.parent.children.splice(found.parent.children.indexOf(found.node),1);
   if(op.op==='move'){insert(requireNode(next.ui,op.parentId).node,op.index,found.node);summary.push(`Move ${op.id} to ${op.parentId}`);}else summary.push(`Remove ${op.id}`);
  }
 }
 return {artifact:validate(next,contract),summary};
}

export const surfaceEditPrompt=`You edit a running Surface app model. Return ONLY a targeted change proposal, not a rewritten app: {changes:[operation],title?:string,state?:{fieldName:{type,initial}},permissions?:string[]}. Operations: {op:"set",id,props:{...changed node properties}}; {op:"insert",parentId,index,node:Node}; {op:"move",id,parentId,index}; {op:"remove",id}. Use stable node IDs from currentPackage; indices are zero-based in the current layout, after removal for moves. At most 20 operations. set merges style fields and changes only named properties; it cannot set id or children. Preserve everything unrelated. Do not move/rebuild the app when the request only changes typography. New local fields add state and surface.local.write; existing keys/types stay intact. New operations/arguments/permissions must fit the supplied contract. Required components remain present. Typography style supports fontWeight (normal/bold or 100-900), fontSize (10-48 px), fontStyle, textAlign, textDecoration, lineHeight (1-2.5); borderRadius 0-32, borderWidth 0-4 and borderColor hex also supported, plus existing color/background/gap/padding. Apply list typography to its repeat node; the style applies to list items. Reuse the node grammar and other constraints below. If impossible return only the unsupported response. The final app is validated, previewed and approved before activation. `;
