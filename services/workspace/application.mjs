import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { runReview } from '../../packages/runner/index.mjs';
import { compilePanel } from '../../packages/sdk/document.mjs';
import { WorkspaceStore } from './store.mjs';
import { createAuthor } from './author.mjs';

export async function createWorkspaceServer(artifact, options = {}) {
  const store = new WorkspaceStore(options.database ?? ':memory:');
  try {
    if (artifact && !store.active()) { store.saveDraft('bootstrap',artifact,null,'Explicit reference fixture'); await store.install('bootstrap'); }
  } catch (error) { store.close(); throw error; }
  const token = randomUUID();
  const author = createAuthor(store, options.author);
  const previews = new Map();
  const frames = new Map();
  const origins = ['http://127.0.0.1:5173','http://127.0.0.1:5174','http://tauri.localhost','https://tauri.localhost','tauri://localhost'];
  const workspace = () => ({ name:'Paper Moon', tasks:store.state().tasks,
    extension:store.active()?.manifest ?? null, versions:store.versions() });
  async function body(req) {
    if (req.headers['content-type'] !== 'application/json') throw new Error('JSON required.');
    let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>8192)throw new Error('Request too large.');}
    return JSON.parse(text);
  }
  function previewState(id) {
    store.draft(id);
    if (!previews.has(id)) {
      if(previews.size>=20)previews.delete(previews.keys().next().value);
      previews.set(id,structuredClone(store.state()));
    }
    return previews.get(id);
  }
  const server = createServer(async(req,res)=>{
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    const send=(status,value)=>{res.writeHead(status);res.end(JSON.stringify(value));};
    if(!/^127\.0\.0\.1:\d+$/.test(req.headers.host??''))return send(403,{error:'Invalid host.'});
    const url=new URL(req.url,'http://127.0.0.1');
    // Frame navigation cannot send the parent's session header. Its short-lived,
    // random handle grants only inert package markup, never workspace data.
    if(req.method==='GET'&&/^\/api\/frame\/[a-z0-9-]+$/.test(url.pathname)){
      const id=url.pathname.split('/').at(-1);const frame=frames.get(id);
      if(!frame||frame.expires<Date.now()){frames.delete(id);return send(404,{error:'Preview expired. Reopen the panel.'});}
      res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Referrer-Policy','no-referrer');
      res.writeHead(200);return res.end(frame.html);
    }
    const origin=req.headers.origin;
    if((origin&&!origins.includes(origin))||(!origin&&req.headers['sec-fetch-site']==='cross-site'))return send(403,{error:'Invalid origin.'});
    if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
    if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, POST');res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Mallea-Token');res.writeHead(204);return res.end();}
    if(req.method==='GET'&&url.pathname==='/api/health')return send(200,{status:'ok'});
    if(req.method==='GET'&&url.pathname==='/api/bootstrap')return send(200,{token,...workspace()});
    if(req.headers['x-mallea-token']!==token)return send(403,{error:'Session expired. Reload the app.'});
    try{
      if(req.method==='GET'&&url.pathname==='/api/workspace')return send(200,workspace());
      if(req.method==='POST'&&url.pathname==='/api/author')return send(202,author.start((await body(req)).request));
      const jobMatch=url.pathname.match(/^\/api\/jobs\/([a-z0-9-]+)(\/cancel)?$/);
      if(jobMatch){if(req.method==='POST'&&jobMatch[2])return send(200,author.cancel(jobMatch[1]));if(req.method==='GET'&&!jobMatch[2])return send(200,author.get(jobMatch[1]));}
      if(req.method==='POST'&&url.pathname==='/api/install'){
        const input=await body(req);const draft=store.draft(input.draftId);
        if(!Array.isArray(input.grants)||JSON.stringify([...input.grants].sort())!==JSON.stringify([...draft.artifact.manifest.permissions].sort()))throw new Error('Approve exactly the requested access before installing.');
        await store.install(input.draftId);return send(200,workspace());
      }
      if(req.method==='GET'&&url.pathname==='/api/panel'){
        const draftId=url.searchParams.get('draft');
        const p=draftId?store.draft(draftId).artifact:store.active();if(!p)throw new Error('No installed package.');
        const state=draftId?previewState(draftId):store.state();
        const task=state.tasks.find(t=>t.id===url.searchParams.get('task'));if(!task)throw new Error('Task not found.');
        const review=await runReview(p,task,task.observation);
        const compiled=compilePanel(p);const frameId=randomUUID();
        if(frames.size>=128)frames.delete(frames.keys().next().value);
        frames.set(frameId,{html:compiled.html,expires:Date.now()+300000});
        return send(200,{...compiled,framePath:`frame/${frameId}`,manifest:p.manifest,policy:p.policy,
          snapshot:{task:{id:task.id,title:task.title,reviewedRevision:task.reviewedRevision},observation:task.observation,review,
            canAcknowledge:p.manifest.permissions.includes('reviews.write')&&task.reviewedRevision<task.observation.revision}});
      }
      if(req.method==='POST'&&url.pathname==='/api/preview/acknowledge'){
        const input=await body(req);const p=store.draft(input.draftId).artifact;
        if(!p.manifest.permissions.includes('reviews.write'))throw new Error('Permission not declared.');
        const task=previewState(input.draftId).tasks.find(t=>t.id===input.taskId);
        if(!task||input.revision!==task.observation.revision)throw new Error('Invalid preview revision.');
        task.reviewedRevision=input.revision;return send(200,{ok:true});
      }
      if(req.method==='POST'&&url.pathname==='/api/task'){
        const input=await body(req);store.updateTask(input.taskId,input.action,input);return send(200,workspace());
      }
      return send(404,{error:'Not found.'});
    }catch(error){return send(400,{error:error instanceof SyntaxError?'Invalid JSON.':String(error.message).slice(0,300)});}
  });
  server.requestTimeout=5000;
  server.on('close',()=>{author.close();store.close();});
  return server;
}
