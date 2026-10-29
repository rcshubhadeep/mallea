import { useEffect,useRef,useState } from 'react';
import { request } from '../api';
import type { SurfaceDefinition } from './Surface';

type LocalInfo={app:{id:string};workspace:SurfaceDefinition;localState:{revision:number;values:Record<string,string>};enabled:boolean};
export function useSurfaceLocalState(info:LocalInfo|null,onSaved:()=>void){
 const [values,setValues]=useState<Record<string,string>>({}),[status,setStatus]=useState(''),[saving,setSaving]=useState(false);
 const current=useRef(info),liveValues=useRef(values),dirty=useRef(new Set<string>()),revision=useRef(0),identity=useRef(''),queue=useRef(Promise.resolve()),refresh=useRef(onSaved),mounted=useRef(true);
 current.current=info;refresh.current=onSaved;
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
 useEffect(()=>{
  if(!info?.localState)return;const id=`${info.app.id}:${info.workspace.manifest.id}`;
  if(identity.current!==id){dirty.current.clear();identity.current=id;}
  const next:Record<string,string>={};for(const [key,field]of Object.entries(info.workspace.state??{}))next[key]=dirty.current.has(key)&&Object.hasOwn(liveValues.current,key)?liveValues.current[key]:(info.localState.values[key]??field.initial);
  for(const key of dirty.current)if(!Object.hasOwn(next,key))dirty.current.delete(key);
  revision.current=info.localState.revision;liveValues.current=next;setValues(next);
 },[info?.app.id,info?.workspace.manifest.version,info?.localState?.revision]);
 function change(key:string,value:string){liveValues.current={...liveValues.current,[key]:value};dirty.current.add(key);setValues(liveValues.current);setStatus('Saving local changes…');}
 function save(){
  queue.current=queue.current.then(async()=>{
   const active=current.current;if(!active||!active.enabled||!dirty.current.size||!mounted.current)return;
   const snapshot={...liveValues.current};setSaving(true);
   try{
    const result=await request<{revision:number;values:Record<string,string>}>('studio/local',{version:active.workspace.manifest.version,expectedRevision:revision.current,values:snapshot});
    if(!mounted.current)return;revision.current=result.revision;
    for(const [key,value]of Object.entries(snapshot))if(liveValues.current[key]===value)dirty.current.delete(key);
    setStatus(dirty.current.size?'Local changes pending':'Local changes saved');refresh.current();
   }catch(e){if(mounted.current)setStatus(`Not saved: ${(e as Error).message}`);}
   finally{if(mounted.current)setSaving(false);}
  });
 }
 // Bounded save after an edit, plus blur/manual save. A failure waits for another edit or explicit retry.
 useEffect(()=>{if(!dirty.current.size)return;const timer=setTimeout(save,600);return()=>clearTimeout(timer);},[values]);
 return {values,change,save,status,saving,dirty:dirty.current.size>0};
}
