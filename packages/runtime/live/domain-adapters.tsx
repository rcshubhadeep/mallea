import{useState,useEffect,useRef}from'react';import{request}from'../api';import{DesignCanvas,type Draft,type CanvasHandle}from'../studio/DesignCanvas';import{draftSchema}from'../../../apps/definitions/studio.mjs';
// Adapters own only domain behavior/primitive internals, never app layout or panels.
export function useDomainAdapter(info:any,refresh:()=>Promise<void>,emitPrimitive:(component:string,event:string,value:unknown)=>Promise<void>){
 const[draft,setDraft]=useState<Draft|null>(null),[reviewText,setReviewText]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);const canvas=useRef<CanvasHandle|null>(null),revision=useRef<number|null>(null);
 const adapter=info?.app.adapter,scratch=adapter==='fieldnote';useEffect(()=>{if(scratch&&info?.data.saved.revision!==revision.current){setDraft(info.data.draft);revision.current=info.data.saved.revision;}},[scratch,info?.data.saved?.revision]);
 function local(name:string,args:any){if(['annotation.text','annotation.color','annotation.align','design.note'].includes(name)){if(!draft)return true;const next={...draft,...(name==='annotation.text'?{text:args.text}:name==='annotation.color'?{color:args.color}:name==='annotation.align'?{x:({Left:36,Center:160,Right:300} as any)[args.alignment]}:{note:args.note})};setDraft(draftSchema.parse(next));return true;}if(name==='review.draft'){setReviewText(args.text);return true;}return false;}
 async function invoke(name:string,args:any){if(local(name,args))return;setBusy(true);try{
  const calls:Record<string,()=>Promise<unknown>>={
   'document.save':async()=>{if(!canvas.current||!draft)throw new Error('The canvas is not ready.');return request('studio/save',{draft,image:canvas.current.exportPng(),expectedRevision:info.data.saved.revision,operationId:crypto.randomUUID()});},
   'asset.access':()=>request('studio/access',{allowed:!info.readAllowed}),
   'asset.refresh':()=>request('studio/refresh',{}),
   'feedback.access':()=>request('studio/feedback/access',{allowed:!info.feedbackAllowed}),
   'feedback.refresh':()=>request('studio/feedback/refresh',{}),
   'review.status':()=>request('studio/review',{type:'status',text:args.status,expectedRevision:info.data.review.revision,operationId:crypto.randomUUID()}),
   'review.comment':async()=>{await request('studio/review',{type:'comment',text:reviewText,expectedRevision:info.data.review.revision,operationId:crypto.randomUUID()});setReviewText('');},
  };if(!calls[name])throw new Error('Unknown registered adapter action.');await calls[name]();await refresh();
 }finally{setBusy(false);}}
 const data=info?{...info.data,...(draft?{draft:{...draft,alignment:draft.x<100?'Left':draft.x<240?'Center':'Right'}}:{}),reviewDraft:{text:reviewText},runtime:{busy,cannotSave:busy||!ready,cannotRead:busy||(scratch?!info.feedbackAllowed:!info.readAllowed),saveState:draft&&JSON.stringify(draft)!==JSON.stringify(info.data.draft)?'Unsaved changes':`Revision ${info.data.saved?.revision??1}`,connection:(scratch?info.reviewOnline:info.sourceOnline)?'Connected to the source app':'Source app is offline',designAccess:info.readAllowed?'Saved-design access allowed':'Saved-design access not allowed',feedbackAccess:info.feedbackAllowed?'Review feedback access allowed':'Review feedback access not allowed'}}:{};
 const components={'design-canvas':scratch&&draft?<DesignCanvas draft={draft} onChange={value=>{if(value.text!==draft.text)void emitPrimitive('design-canvas','text.changed',{text:value.text});if(value.x!==draft.x||value.y!==draft.y)void emitPrimitive('design-canvas','position.changed',{x:value.x,y:value.y});}} onReady={h=>{canvas.current=h;setReady(!!h);}}/>:null};
 function primitive(component:string,event:string,value:unknown){if(component!=='design-canvas'||!['text.changed','position.changed'].includes(event))throw new Error('Unregistered adapter event.');setDraft(current=>current?draftSchema.parse({...current,...value as object}):current);}
 return{data,components,invoke,local,primitive};
}
