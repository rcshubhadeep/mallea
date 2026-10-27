import { useEffect, useRef, useState } from 'react';
import type { Panel } from '../sdk/index';
import { request, apiUrl } from './api';

export function ExtensionPanel({taskId,draftId,epoch,onChange,onManifest}:{taskId:string;draftId?:string;epoch:number;onChange:()=>void;onManifest?:(permissions:string[])=>void}) {
  const frame=useRef<HTMLIFrameElement>(null);
  const [panel,setPanel]=useState<Panel|null>(null);
  const [error,setError]=useState('');
  const [height,setHeight]=useState(360);
  const [revision,setRevision]=useState(0);
  const callbacks=useRef({onChange,onManifest});callbacks.current={onChange,onManifest};
  useEffect(()=>{
    let live=true;setPanel(null);setError('');
    request<Panel>(`panel?task=${encodeURIComponent(taskId)}${draftId?`&draft=${encodeURIComponent(draftId)}`:''}`)
      .then(value=>{if(live){setPanel(value);callbacks.current.onManifest?.(value.manifest.permissions);}})
      .catch(e=>{if(live)setError(e.message);});
    return()=>{live=false;};
  },[taskId,draftId,epoch,revision]);
  useEffect(()=>{
    if(!panel)return;
    let pending=false;
    const receive=async(event:MessageEvent)=>{
      const data=event.data;
      if(event.source!==frame.current?.contentWindow||data?.channel!==panel.channel)return;
      if(data.type==='ready')frame.current?.contentWindow?.postMessage({type:'snapshot',channel:panel.channel,value:panel.snapshot},'*');
      if(data.type==='height'&&Number.isFinite(data.height))setHeight(Math.max(180,Math.min(1000,data.height+8)));
      if(data.type!=='action'||pending||data.action!=='review.acknowledge'||data.taskId!==taskId||data.revision!==panel.snapshot.observation.revision||!panel.snapshot.canAcknowledge||!panel.manifest.permissions.includes('reviews.write'))return;
      pending=true;
      try {
        await request(draftId?'preview/acknowledge':'task',{draftId,taskId,action:'acknowledge',revision:data.revision});
        setRevision(n=>n+1);if(!draftId)callbacks.current.onChange();
      }catch(e){setError((e as Error).message);}finally{pending=false;}
    };
    window.addEventListener('message',receive);
    return()=>window.removeEventListener('message',receive);
  },[panel,taskId,draftId]);
  return <>{error&&<p role="alert" className="error">{error}</p>}{panel?<><div className="panel-status" aria-live="polite">{panel.snapshot.review.status} · v{panel.manifest.version}{draftId?' · preview only':''}</div><iframe ref={frame} key={panel.channel} title={draftId?'Generated preview':'Installed review panel'} sandbox="allow-scripts" src={apiUrl(panel.framePath)} style={{height}} onLoad={()=>frame.current?.contentWindow?.postMessage({type:'snapshot',channel:panel.channel,value:panel.snapshot},'*')}/></>:!error&&<p>Loading panel…</p>}</>;
}
