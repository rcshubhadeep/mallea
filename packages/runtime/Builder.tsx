import { useEffect, useState } from 'react';
import type { Job, WorkspaceInfo } from '../sdk/index';
import { request } from './api';
import { ExtensionPanel } from './ExtensionPanel';
const followup='Only block release-critical tasks when evidence changes; show a warning for the others. Keep the screenshot and acknowledgement button. Use the heading Release confidence.';
export function Builder({info,onInstalled,onClose}:{info:WorkspaceInfo;onInstalled:(value:WorkspaceInfo)=>void;onClose:()=>void}){
  const [prompt,setPrompt]=useState(info.extension?followup:info.app.initialRequest);
  const [job,setJob]=useState<Job|null>(null);
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const [granted,setGranted]=useState(false);const [permissions,setPermissions]=useState<string[]>([]);
  const [taskId,setTaskId]=useState(info.tasks[0].id);
  const running=!!job&&!['ready','failed','cancelled','unsupported'].includes(job.phase);
  useEffect(()=>{
    if(!running||!job)return;
    let live=true;
    const timer=setInterval(()=>{request<Job>(`jobs/${job.id}`).then(v=>{if(live)setJob(v);}).catch(e=>{if(live){setError(e.message);setJob(null);}});},750);
    return()=>{live=false;clearInterval(timer);};
  },[running,job?.id]);
  async function generate(){setBusy(true);setError('');setGranted(false);setPermissions([]);setJob(null);try{setJob(await request<Job>('author',{request:prompt}));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function install(){if(!job)return;setBusy(true);setError('');try{onInstalled(await request<WorkspaceInfo>('install',{draftId:job.id,grants:permissions}));onClose();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <div className="overlay"><section className="drawer" role="dialog" aria-modal="true" aria-labelledby="builder-title"><button className="close" disabled={running||busy} onClick={onClose}>Close</button><p className="eyebrow">YOUR APP, YOUR WORKFLOW</p><h2 id="builder-title">Shape this app</h2><p>Describe the review panel you need. Inspect it here, then choose whether to add it to your app.</p>
    <div className="note"><strong>{info.app.title}</strong><p>{info.app.purpose}</p><p>Evidence sources: {[...new Set(info.tasks.map(t=>t.evidence.appId))].join(', ')}. The model receives the app contract and discovered MCP capability descriptions. Using the panel reads only linked evidence.</p></div>
    <label htmlFor="change-request">What would you like to change?</label><textarea id="change-request" value={prompt} maxLength={1500} disabled={running||busy} onChange={e=>setPrompt(e.target.value)} rows={5}/>
    <div className="actions"><button className="primary" disabled={running||busy||!prompt.trim()} onClick={generate}>{info.extension?'Create revision':'Create panel'}</button>{running&&<button onClick={()=>request<Job>(`jobs/${job!.id}/cancel`,{}).then(setJob).catch(e=>setError(e.message))}>Cancel generation</button>}</div>
    {job&&<p role="status">{job.phase==='ready'?'Ready to try':job.phase==='unsupported'?'Not supported yet':job.phase} · attempt {job.attempt} of 3</p>}
    {job?.unsupported&&<div className="note"><strong>This change needs a capability the app does not have yet.</strong><p>{job.unsupported.reason}</p><p>Possible alternative: {job.unsupported.alternative}</p><p>No draft was created. Your installed panel is unchanged. Edit your request if you want to try an alternative.</p></div>}
    {job?.diagnostics.map(d=><div className="note" key={d.attempt}>Attempt {d.attempt}: {d.message}</div>)}
    {(error||job?.error)&&<p className="error" role="alert">{error||job?.error}</p>}
    {job?.phase==='ready'&&<><h3>Try it before installing</h3><p className="muted">These controls use a copy of your data. Preview acknowledgements do not change your tasks.</p><label>Preview task <select value={taskId} onChange={e=>setTaskId(e.target.value)}>{info.tasks.map(t=><option key={t.id} value={t.id}>{t.critical?'Critical':'Ordinary'} · {t.title}</option>)}</select></label>
      <ExtensionPanel taskId={taskId} draftId={job.id} epoch={0} onChange={()=>{}} onManifest={setPermissions}/>
      <div className="note"><strong>Requested access</strong><ul>{permissions.map(p=><li key={p}>{p==='observations.read'?`Read linked evidence from ${[...new Set(info.tasks.map(t=>t.evidence.appId))].join(', ')}`:'Save acknowledgements in this app'}</li>)}</ul><label><input type="checkbox" checked={granted} onChange={e=>setGranted(e.target.checked)}/> Allow this access when installed</label></div><button className="primary install" disabled={!granted||!permissions.length||busy} onClick={install}>Install {info.extension?'revision':'panel'}</button></>}
    <p className="footnote">This slice supports evidence panels and two review policies. Generation is bounded to one attempt plus two repairs. Your installed version stays active until you install a validated replacement.</p>
  </section></div>;
}
