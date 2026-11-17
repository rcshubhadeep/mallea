import {z} from 'zod';

export const actionCallers=['user','agent','automation'];
export const genericActionNames=['data.set','collection.append','collection.remove','collection.clear','collection.select','collection.update'];
const legacyNonUser=new Set(['data.set','collection.append','collection.clear']);
export const invocationSchema=z.object({callers:z.array(z.enum(actionCallers)).max(3).refine(v=>new Set(v).size===v.length,'Caller names must be unique.'),requiresUserGesture:z.boolean()}).strict().refine(v=>!v.requiresUserGesture||v.callers.every(c=>c==='user'),'Only user callers can require a direct user gesture.');
const contextSchema=z.object({caller:z.enum(actionCallers),userGesture:z.boolean()}).strict().refine(v=>!v.userGesture||v.caller==='user','Only user events can carry a user gesture.');
const canonical=p=>({...p,callers:actionCallers.filter(c=>p.callers.includes(c))});

// Frozen legacy defaults preserve prior access; new declarations are explicit, inspectable proposals.
export function actionInvocation(name,nodePolicy,contractPolicy){
 const generic=genericActionNames.includes(name),ceiling=contractPolicy===undefined?{callers:generic?actionCallers:['user'],requiresUserGesture:false}:invocationSchema.parse(contractPolicy);
 const desired=nodePolicy===undefined?(contractPolicy===undefined?{callers:legacyNonUser.has(name)?actionCallers:['user'],requiresUserGesture:false}:ceiling):invocationSchema.parse(nodePolicy);
 if(desired.callers.some(c=>!ceiling.callers.includes(c))||(ceiling.requiresUserGesture&&!desired.requiresUserGesture))throw new Error('An element cannot widen its registered action invocation policy.');
 return canonical(desired);
}

export function assertInvocation(policy,context){
 const invocation=contextSchema.parse(context),allowed=invocationSchema.parse(policy);
 if(!allowed.callers.includes(invocation.caller))throw new Error('This action does not allow '+invocation.caller+' callers.');
 if(allowed.requiresUserGesture&&(invocation.caller!=='user'||!invocation.userGesture))throw new Error('This action requires a direct user interaction.');
 return invocation;
}
