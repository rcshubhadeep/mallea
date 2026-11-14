import {useEffect,useRef,useState} from 'react';
import {Surface,type SurfaceDefinition,type ViewNode} from '../studio/Surface';
import {clarificationAnswers} from '../../sdk/clarification.mjs';

type Question={id:string;label:string;kind:'text'|'choice';options?:{label:string;value:string}[]};
export type QuestionBatch={batchId:string;expiresAt:number;questions:Question[];surface:{id:string;title:string;ui:ViewNode}};
export function ShapeQuestions({batch,scope,model,onAnswer,onCancel}:{batch:QuestionBatch;scope:string;model:string;onAnswer:(input:unknown)=>Promise<void>;onCancel:()=>void}){
 const [answers,setAnswers]=useState<Record<string,string>>({}),[submitting,setSubmitting]=useState(false),[error,setError]=useState('');
 const root=useRef<HTMLDivElement>(null),posting=useRef(false);
 useEffect(()=>{root.current?.querySelector<HTMLElement>('select,textarea,input')?.focus();},[batch.batchId]);
 const complete=batch.questions.every(q=>{const v=(answers[q.id]??'').trim();return v.length>0&&v.length<=1000&&(q.kind!=='choice'||q.options?.some(o=>o.value===v));});
 const data={clarification:{scope,disclosure:`Your answers will be sent to ${model}, the model selected when this request began, to continue this request. They are not saved in app data.`,submitting,cannotSubmit:!complete||submitting,error,...Object.fromEntries(batch.questions.map((q,i)=>['answer'+i,answers[q.id]??'']))}};
 async function event(node:ViewNode,kind:string,value?:unknown){
  if(kind==='change'){const i=batch.questions.findIndex((_q,i)=>node.bind==='clarification.answer'+i);if(i>=0&&!posting.current)setAnswers(a=>({...a,[batch.questions[i].id]:String(value)}));return;}
  if(kind!=='click')return;
  if(node.action==='shape.cancel'){onCancel();return;}
  if(node.action!=='shape.answer'||posting.current||!complete)return;
  const input={batchId:batch.batchId,answers:batch.questions.map(q=>({id:q.id,value:answers[q.id]}))};
  try{clarificationAnswers(input,batch);}catch{setError('Complete each question using the listed choices or at most 1,000 characters.');return;}
  posting.current=true;setSubmitting(true);setError('');
  try{await onAnswer(input);}catch(e){setError((e as Error).message.slice(0,500));}finally{posting.current=false;setSubmitting(false);}
 }
 const definition:SurfaceDefinition={manifest:{id:batch.surface.id,title:batch.surface.title,version:'1.0.0',sdkVersion:'0.4',permissions:[]},ui:batch.surface.ui};
 return <div ref={root} data-system-surface="clarification"><Surface model={definition} contract={{live:true,fields:{},actions:{}}} data={data} components={{}} invoke={()=>{}} onElementEvent={(n,e,v)=>void event(n,e,v)}/></div>;
}
