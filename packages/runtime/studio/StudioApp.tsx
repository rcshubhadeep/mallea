import { useEffect,useRef,useState } from 'react';
import { bootstrap,connect,request } from '../api';
import { draftSchema,initialWorkspace,reviewWorkspace } from '../../../apps/definitions/studio.mjs';
import { DesignCanvas,type Draft,type CanvasHandle } from './DesignCanvas';
import { Surface,type SurfaceDefinition,type SurfaceContract } from './Surface';
import { SurfaceBuilder } from './SurfaceBuilder';
import { useSurfaceLocalState } from './useSurfaceLocalState';
import { localDefaults } from '../../sdk/surface.mjs';
import './studio.css';
import{ShapeEntry}from'./ShapeEntry';

type AppData={local:Record<string,string>;draft:Draft;saved:{image:string;note:string;revision:number;history:string[]};asset:{title:string;image:string;note:string;revision:number;sourceRevision:number};review:{status:string;revision:number;items:string[]};feedback:{status:string;items:string[]}};
type Info={app:{id:string;title:string;initialRequest:string};localState:{revision:number;values:Record<string,string>};data:AppData;workspace:SurfaceDefinition;installed:boolean;enabled:boolean;versions:string[];contract:SurfaceContract;readAllowed:boolean;feedbackAllowed:boolean;sourceOnline:boolean;reviewOnline:boolean};
function editDraft(draft:Draft,action:string,args:Record<string,string>){
 const handlers:Record<string,()=>Draft>={'annotation.color':()=>({...draft,color:args.color}),'annotation.text':()=>({...draft,text:args.text}),'design.note':()=>({...draft,note:args.note}),'annotation.align':()=>({...draft,x:({Left:36,Center:160,Right:300} as Record<string,number>)[args.alignment]})};
 if(!handlers[action])throw new Error('Unknown app action.');const value=handlers[action]();return draftSchema.parse({text:value.text,color:value.color,note:value.note,x:value.x,y:value.y}) as Draft;
}
function Preview({model,initial,contract}:{model:SurfaceDefinition;initial:Record<string,any>;contract:SurfaceContract}){
 const [data,setData]=useState<Record<string,any>>({...initial,local:localDefaults(model,initial.local)});
 function invoke(action:string,args:Record<string,string>){setData((d:any)=>{
  if(['annotation.color','annotation.text','design.note','annotation.align'].includes(action))return {...d,draft:{...editDraft(d.draft,action,args),alignment:args.alignment??d.draft.alignment}};
  if(action==='review.draft')return {...d,reviewDraft:{text:args.text}};
  if(action==='review.status')return {...d,review:{...d.review,status:args.status}};
  return d; // Preview has no service write/export/grant bridge.
 });}
 return <Surface model={model} contract={contract} data={data} onLocalChange={(key,value)=>setData((d:any)=>({...d,local:{...d.local,[key]:value}}))} components={{'design-canvas':data.draft?<DesignCanvas draft={data.draft} onChange={draft=>setData((d:any)=>({...d,draft}))} onReady={()=>{}}/>:null}} invoke={invoke}/>;
}
export function StudioApp({kind}:{kind:'scratchpad'|'review-board'}){
 const scratch=kind==='scratchpad',[info,setInfo]=useState<Info|null>(null),[draft,setDraft]=useState<Draft|null>(null),[reviewText,setReviewText]=useState(''),[online,setOnline]=useState(false),[error,setError]=useState(''),[builder,setBuilder]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[canvasReady,setCanvasReady]=useState(false);
 const handle=useRef<CanvasHandle|null>(null),refreshRef=useRef(()=>{}),requestSequence=useRef(0),revision=useRef<number|null>(null),lastSavedDraft=useRef('');
 async function refresh(){const seq=++requestSequence.current;try{const value=await request<Info>('studio/state');if(seq!==requestSequence.current)return;setInfo(value);if(scratch&&revision.current!==value.data.saved.revision){setDraft(value.data.draft);lastSavedDraft.current=JSON.stringify(value.data.draft);revision.current=value.data.saved.revision;}}catch(e){setError((e as Error).message);}}
 refreshRef.current=()=>void refresh();const local=useSurfaceLocalState(info,()=>void refresh());
 useEffect(()=>{let live=true,disconnect:(()=>void)|undefined;void bootstrap(kind).then(()=>{if(!live)return;void refresh();disconnect=connect(()=>refreshRef.current(),setOnline);}).catch(e=>{if(live)setError((e as Error).message+' Start the service with --studio.');});return()=>{live=false;disconnect?.();requestSequence.current++;};},[kind]);
 async function action(path:string,input:unknown,success=''){setBusy(true);setError('');setNotice('');try{await request(path,input);if(success)setNotice(success);await refresh();return true;}catch(e){setError((e as Error).message);return false;}finally{setBusy(false);}}
 async function save(){if(!draft||!handle.current||!info)return;await action('studio/save',{draft,image:handle.current.exportPng(),expectedRevision:info.data.saved.revision,operationId:crypto.randomUUID()},'Saved revision. Ready to share.');}
 async function invoke(name:string,args:Record<string,string>){
  if(!info)return;
  if(['annotation.color','annotation.text','design.note','annotation.align'].includes(name)){try{setDraft(d=>d?editDraft(d,name,args):d);}catch(e){setError((e as Error).message);}return;}
  if(name==='review.draft'){setReviewText(args.text);return;}
  const handlers:Record<string,()=>Promise<unknown>>={
   'document.save':save,
   'asset.access':()=>action('studio/access',{allowed:!info.readAllowed},'Saved-design access updated.'),
   'asset.refresh':()=>action('studio/refresh',{},'Refreshed the saved artwork.'),
   'feedback.access':()=>action('studio/feedback/access',{allowed:!info.feedbackAllowed},'Feedback access updated.'),
   'feedback.refresh':()=>action('studio/feedback/refresh',{},'Review feedback updated from Parcel.'),
   'review.status':()=>action('studio/review',{type:'status',text:args.status,expectedRevision:info.data.review.revision,operationId:crypto.randomUUID()},'Review status saved.'),
   'review.comment':async()=>{if(await action('studio/review',{type:'comment',text:reviewText,expectedRevision:info.data.review.revision,operationId:crypto.randomUUID()},'Feedback posted.'))setReviewText('');},
  };
  try{if(!handlers[name])throw new Error('Unregistered host action.');await handlers[name]();}catch(e){setError((e as Error).message);}
 }
 const changed=!!draft&&JSON.stringify(draft)!==lastSavedDraft.current,baseModel=scratch?initialWorkspace:reviewWorkspace,custom=!!info?.installed&&info.enabled,model=custom?info!.workspace:baseModel;
 const data=info?{...info.data,local:local.values,reviewDraft:{text:reviewText},...(draft?{draft:{...draft,alignment:draft.x<100?'Left':draft.x<240?'Center':'Right'}}:{}),runtime:{busy:busy||!online,cannotSave:!canvasReady||busy||!online,cannotRead:busy||!online||(scratch?!info.feedbackAllowed:!info.readAllowed),saveState:changed?'Unsaved changes':`Revision ${info.data.saved?.revision??1} · Saved`,connection:(scratch?info.reviewOnline:info.sourceOnline)?'Connected to the source app':'Source app is offline',designAccess:info.readAllowed?'Saved-design access allowed':'Saved-design access not allowed',feedbackAccess:info.feedbackAllowed?'Review feedback access allowed':'Review feedback access not allowed'}}:null;
 return <div className={`studio-app ${scratch?'fieldnote':'parcel'}`}>
  <header className="app-top"><div className="app-brand"><span>{scratch?'◒':'▧'}</span>{scratch?'fieldnote':'parcel'}<small>{scratch?'VISUAL SCRATCHPAD':'ASSET REVIEW'}</small></div><div className="top-actions"><span className={`connection ${online?'is-online':''}`}>{online?'Connected':'Reconnecting'}</span>{custom&&Object.keys(info!.workspace.state??{}).length>0&&<button disabled={!online||local.saving||!local.dirty} onClick={local.save}>Save local changes</button>}<ShapeEntry disabled={!info||!online} onOpen={()=>setBuilder(true)}/></div></header>
  <main>{error&&<p role="alert" className="studio-error">{error}</p>}{notice&&<p role="status" className="studio-notice">{notice}</p>}{custom&&local.status&&<p role="status" className={local.status.startsWith('Not saved')?'studio-error':'local-save-status'}>{local.status}</p>}{!info&&<p>Connect the local workspace service to begin.</p>}
   {info&&data&&<><Surface model={model} contract={info.contract} onLocalChange={local.change} onLocalCommit={local.save} data={data} components={{'design-canvas':draft?<DesignCanvas draft={draft} onChange={setDraft} onReady={h=>{handle.current=h;setCanvasReady(!!h);}}/>:null}} invoke={(name,args)=>void invoke(name,args)}/><div className="installed-strip"><span>{custom?`${info.workspace.manifest.title} · v${info.workspace.manifest.version} · Your customization`:'Original workspace'}</span>{info.installed&&<button disabled={busy} onClick={()=>void action('studio/enabled',{enabled:!info.enabled})}>{custom?'Show built-in app':'Resume saved customization'}</button>}</div></>}
   <footer className="app-footer"><span>Powered by <strong>mallea</strong></span><span>{scratch?'Make space for your next idea.':'Good feedback moves work forward.'}</span></footer>
  </main>{builder&&info&&data&&<SurfaceBuilder app={info.app} data={data} onClose={()=>setBuilder(false)} onInstalled={()=>{void refresh();setNotice('Surface installed. Your workspace has changed.');}} renderPreview={(artifact,copy)=><Preview key={artifact.manifest.version} model={artifact} initial={copy as Record<string,any>} contract={info.contract}/>}/>}</div>;
}
