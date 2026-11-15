import {z} from 'zod';

const id=z.string().regex(/^[a-z][a-z0-9-]{0,39}$/).refine(v=>!['constructor','prototype','__proto__'].includes(v));
const label=z.string().trim().min(1).max(240);
const choice=z.object({label:z.string().trim().min(1).max(80),value:z.string().trim().min(1).max(80)}).strict();
const question=z.discriminatedUnion('kind',[
 z.object({id,label,kind:z.literal('text')}).strict(),
 z.object({id,label,kind:z.literal('choice'),options:z.array(choice).min(2).max(6).refine(v=>new Set(v.map(o=>o.value)).size===v.length,'Choice values must be unique.')}).strict()
]);
export const clarificationRequest=z.object({questions:z.array(question).min(1).max(3).refine(v=>new Set(v.map(q=>q.id)).size===v.length,'Question IDs must be unique.')}).strict();
const submission=z.object({batchId:z.string().uuid(),answers:z.array(z.object({id,value:z.string().trim().min(1).max(1000)}).strict()).min(1).max(3)}).strict();
export function clarificationAnswers(input,batch){
 const answer=submission.parse(input);
 if(answer.batchId!==batch.batchId)throw new Error('These questions are no longer pending.');
 if(answer.answers.length!==batch.questions.length||new Set(answer.answers.map(a=>a.id)).size!==answer.answers.length)throw new Error('Answer each pending question exactly once.');
 const values=new Map(answer.answers.map(a=>[a.id,a.value]));
 return batch.questions.map(q=>{const value=values.get(q.id);if(value===undefined)throw new Error('Answer each pending question exactly once.');if(q.kind==='choice'&&!q.options.some(o=>o.value===value))throw new Error('Choose one of the listed answers.');return{id:q.id,value};});
}

// Core fixes the panel's structure/actions; models supply only bounded question data.
export function clarificationSurface(batch){
 const request=clarificationRequest.parse({questions:batch.questions});
 return{id:'system-shape-questions',title:'Shape questions',ownership:'system',ui:{id:'shape-questions-root',type:'stack',children:[
  {id:'questions-title',type:'text',text:'A few details before building',appearance:'heading'},
  {id:'questions-scope',type:'text',bind:'clarification.scope',appearance:'eyebrow'},
  {id:'questions-disclosure',type:'text',bind:'clarification.disclosure',appearance:'muted'},
  ...request.questions.map((q,i)=>({id:'shape-answer-'+i,type:q.kind==='choice'?'choice':'textarea',label:q.label,bind:'clarification.answer'+i,disabledBind:'clarification.submitting',...(q.kind==='choice'?{options:q.options}:{})})),
  {id:'questions-limit',type:'text',text:'Answers are temporary and limited to 1,000 characters each. Nothing is installed by answering. Questions expire after 30 minutes.',appearance:'muted'},
  {id:'questions-error',type:'text',bind:'clarification.error'},
  {id:'questions-actions',type:'row',children:[{id:'submit-answers',type:'button',label:'Continue building',action:'shape.answer',appearance:'primary',disabledBind:'clarification.cannotSubmit'},{id:'cancel-answers',type:'button',label:'Cancel generation',action:'shape.cancel'}]}
 ]}};
}
