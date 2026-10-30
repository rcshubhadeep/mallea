import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { WebSocketServer } from 'ws';
import { CollaborationStore } from './collaboration-store.mjs';
import { Registry } from './registry.mjs';
import { createGateway } from './gateway.mjs';
import { createAuthor } from './author.mjs';
import { describeApp, appDefinition } from '../../apps/definitions/index.mjs';
import { runReview } from '../../packages/runner/index.mjs';
import { compilePanel } from '../../packages/sdk/document.mjs';
import { StudioStore } from './studio-store.mjs';
import { studioCapabilities } from '../../apps/definitions/studio.mjs';
import{EngineApps}from'./engine-apps.mjs';

export async function createCollaborationServer(options={}){
  const store=options.store??new CollaborationStore(options.database??':memory:');
  const registry=new Registry(store),studio=options.studio?new StudioStore(store):null;
  const engine=options.engine?new EngineApps(store):null;
  registry.studio=studio;
  const gateway=createGateway(registry,studio?studioCapabilities:[]),token=randomUUID(),authors=new Map(),previews=new Map(),frames=new Map();
  const origins=['http://127.0.0.1:5173','http://127.0.0.1:5174','http://tauri.localhost','https://tauri.localhost','tauri://localhost'];
  if(options.artifact){const packages=store.packages('board-main');if(!packages.active()){packages.saveDraft(randomUUID(),options.artifact,null,'Explicit fixture');const row=store.db.prepare('SELECT id FROM app_drafts WHERE app_id=? ORDER BY rowid DESC LIMIT 1').get('board-main');await packages.install(row.id);}}
  async function body(req){if(req.headers['content-type']?.split(';')[0]!=='application/json')throw new Error('JSON required.');let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>(studio?1600000:16384))throw new Error('Request too large.');}return JSON.parse(text);}
  async function tasks(session){
    return Promise.all(store.app(session.appId).tasks.map(async task=>{
      try{return {...task,observation:await gateway.read(session,task.evidence.appId,task.evidence.observationId),availability:'online'};}
      catch(error){return {...task,observation:null,availability:error.message};}
    }));
  }
  async function workspace(session){
    const app=store.app(session.appId),packages=store.packages(app.id),artifact=packages.active();
    if(store.definition(app.id).contract)return studio.info(session);
    // Review is host-owned derived state; it does not depend on a mounted frame.
    const items=await Promise.all((await tasks(session)).map(async task=>({...task,review:artifact&&task.observation?await runReview(artifact,task,task.observation):null})));
    return {name:'Paper Moon',app:describeApp(app),tasks:items,extension:artifact?.manifest??null,versions:packages.versions(),instances:registry.list(session)};
  }
  async function authorContext(session){
    const app=store.app(session.appId),definition=store.definition(app.id),catalog=await gateway.discover(session);
    if(definition.contract){const info=studio.info(session);return {app:store.describe(app.id),contract:definition.contract,currentWorkspace:info.enabled?info.workspace:definition.initialSurface,capabilityCatalog:catalog,instructions:'Compose only registered components/bindings/actions. Preserve the visible starting app and registered working sections unless the user asks to change them. Never embed private data as static text.'};}
    for(const task of app.tasks){registry.authorize(session,task.evidence.appId,task.evidence.observationId);if(task.evidence.appId!==app.id&&!registry.online(task.evidence.appId))throw new Error('Open the source notebook before creating this capability.');}
    return {app:describeApp(app),slot:definition.authoring,capabilityCatalog:catalog,
      bindings:app.tasks.map(t=>({taskId:t.id,...t.evidence})),instructions:'Data stays in the host. The host resolves observation bindings through the authorized read_observation MCP capability. Never embed source data in static UI text.'};
  }
  function author(session){if(!authors.has(session.appId))authors.set(session.appId,createAuthor(store.packages(session.appId),{...options.author,context:()=>authorContext(session)}));return authors.get(session.appId);}
  const server=createServer(async(req,res)=>{
    res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
    const send=(status,value)=>{res.writeHead(status);res.end(JSON.stringify(value));};
    try{
      if(!/^127\.0\.0\.1:\d+$/.test(req.headers.host??''))return send(403,{error:'Invalid host.'});
      const url=new URL(req.url,'http://127.0.0.1');
      if(req.method==='GET'&&/^\/api\/frame\/[a-z0-9-]+$/.test(url.pathname)){
        const id=url.pathname.split('/').at(-1),frame=frames.get(id);if(!frame||frame.expires<Date.now()){frames.delete(id);return send(404,{error:'Panel expired. Reopen it.'});}
        res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Referrer-Policy','no-referrer');res.writeHead(200);return res.end(frame.html);
      }
      const origin=req.headers.origin;if((origin&&!origins.includes(origin))||(!origin&&req.headers['sec-fetch-site']==='cross-site'))return send(403,{error:'Invalid origin.'});
      if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
      if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, POST');res.setHeader('Access-Control-Allow-Headers','Content-Type, X-Mallea-Token, X-Mallea-Session, MCP-Protocol-Version');res.writeHead(204);return res.end();}
      if(req.method==='GET'&&url.pathname==='/api/health')return send(200,{status:'ok'});
      if(engine&&req.method==='POST'&&['/api/native/context','/api/native/register'].includes(url.pathname)){
        const input=await body(req);try{if(Object.keys(input).some(k=>!['appId','credential'].includes(k)))throw new Error('Invalid identity.');engine.authenticate(input.appId,input.credential);}catch{return send(403,{error:'Native app identity was not accepted.'});}
        if(url.pathname.endsWith('/context'))return send(200,engine.describe(input.appId));
        const session=registry.register(input.appId);return send(200,{session:session.id,instanceId:session.instanceId,workspace:await workspace(session)});
      }
      if(engine&&url.pathname.startsWith('/api/engine/')){
        const control=!!options.controlToken&&req.headers['x-mallea-control']===options.controlToken;
        if(req.method==='GET'&&url.pathname==='/api/engine/apps'){if(!control){try{registry.require(req.headers['x-mallea-session']);}catch{return send(403,{error:'Core access required.'});}}return send(200,engine.list(registry));}
        if(!control)return send(403,{error:'Core control access required.'});
        if(req.method==='POST'&&url.pathname==='/api/engine/apps'){const result=engine.register(await body(req));return send(200,{...result,app:engine.describe(result.manifest.id)});}
        if(req.method==='POST'&&url.pathname==='/api/engine/host'){const input=await body(req);return send(200,{appId:input.appId,credential:engine.issueCredential(input.appId)});}
      }
      if(req.method==='GET'&&url.pathname==='/api/bootstrap')return engine?send(403,{error:'Use a registered native host.'}):send(200,{token});
      if(req.method==='POST'&&url.pathname==='/api/register'){
        if(engine)return send(403,{error:'Use a registered native host.'});
        if(req.headers['x-mallea-token']!==token)return send(403,{error:'Local workspace access required.'});
        const input=await body(req),app=input.appId?store.app(input.appId):store.state().apps.find(a=>a.kind===input.kind&&a.workspaceId==='local-demo');
        if(!app)return send(400,{error:'App is not registered.'});const session=registry.register(app.id,'local-demo');
        return send(200,{session:session.id,instanceId:session.instanceId,workspace:await workspace(session)});
      }
      let session;try{session=registry.require(req.headers['x-mallea-session']);}catch(error){return send(403,{error:error.message});}
      const app=store.app(session.appId),packages=store.packages(app.id);
      const scopedMcp=url.pathname.match(/^\/api\/apps\/([a-z][a-z0-9-]{2,39})\/mcp$/);
      if(engine&&scopedMcp&&req.method==='POST'){engine.manifest(scopedMcp[1]);return await gateway.http(session,req,res,await body(req),scopedMcp[1]);}
      if(url.pathname.startsWith('/api/studio/')){
        if(!studio||!store.definition(app.id).contract)throw new Error('Start the service with --studio and open the matching app.');
        if(url.pathname==='/api/studio/state'&&req.method==='GET')return send(200,{...studio.info(session),readAllowed:studio.allowed(app.id,'scratchpad-main','design.saved.read'),feedbackAllowed:studio.allowed(app.id,'review-main','asset.feedback.read'),sourceOnline:registry.online('scratchpad-main'),reviewOnline:registry.online('review-main')});
        if(url.pathname==='/api/studio/review'&&req.method==='POST'){studio.review(session,await body(req));registry.broadcast(session.workspaceId,{type:'studio'});return send(200,studio.info(session));}
        if(url.pathname==='/api/studio/feedback/access'&&req.method==='POST'){studio.feedbackGrant(session,(await body(req)).allowed);registry.broadcast(session.workspaceId,{type:'studio'});return send(200,{ok:true});}
        if(url.pathname==='/api/studio/feedback/refresh'&&req.method==='POST'){studio.own(session,'scratchpad');const feedback=await gateway.invoke(session,'review-main','read_asset_feedback',{assetId:'asset-moon'});studio.cacheFeedback(session,feedback);registry.broadcast(session.workspaceId,{type:'studio'});return send(200,studio.info(session));}
        if(url.pathname==='/api/studio/local'&&req.method==='POST'){if(studio.info(session).enabled===false)throw new Error('Enable the Surface before editing local fields.');const saved=studio.localState.save(session,await body(req));registry.broadcast(session.workspaceId,{type:'studio'});return send(200,saved);}
        if(url.pathname==='/api/studio/save'&&req.method==='POST'){studio.save(session,await body(req));registry.broadcast(session.workspaceId,{type:'studio'});return send(200,studio.info(session));}
        if(url.pathname==='/api/studio/access'&&req.method==='POST'){studio.grant(session,(await body(req)).allowed);registry.broadcast(session.workspaceId,{type:'studio'});return send(200,{ok:true});}
        if(url.pathname==='/api/studio/owner'&&req.method==='POST'){const input=await body(req);return send(200,studio.resource(session,input.capability,input.arguments));}
        if(url.pathname==='/api/studio/refresh'&&req.method==='POST'){studio.own(session,'review-board');const saved=await gateway.invoke(session,'scratchpad-main','read_saved_design',{designId:'design-moon'});studio.publishRead(session,saved);registry.broadcast(session.workspaceId,{type:'studio'});return send(200,studio.info(session));}
        if(url.pathname==='/api/studio/draft'&&req.method==='GET')return send(200,packages.draft(url.searchParams.get('id')).artifact);
        if(url.pathname==='/api/studio/enabled'&&req.method==='POST'){studio.enable(session,(await body(req)).enabled);registry.broadcast(session.workspaceId,{type:'studio'});return send(200,studio.info(session));}
        if(url.pathname==='/api/studio/install'&&req.method==='POST'){const input=await body(req),draft=packages.draft(input.draftId);if(!Array.isArray(input.grants)||JSON.stringify([...input.grants].sort())!==JSON.stringify([...draft.artifact.manifest.permissions].sort()))throw new Error('Approve the declared access before installing.');await packages.install(input.draftId);studio.enable(session,true);registry.broadcast(session.workspaceId,{type:'studio'});return send(200,studio.info(session));}
        return send(404,{error:'Unknown studio action.'});
      }
      if(url.pathname==='/mcp'&&req.method==='POST')return await gateway.http(session,req,res,await body(req));
      if(req.method==='GET'&&url.pathname==='/api/workspace')return send(200,await workspace(session));
      if(req.method==='POST'&&url.pathname==='/api/connection')return send(200,{ticket:registry.ticket(session)});
      if(req.method==='GET'&&url.pathname==='/api/discover')return send(200,await gateway.discover(session));
      if(req.method==='POST'&&url.pathname==='/api/access'){
        const input=await body(req);if(!app.tasks.some(t=>t.evidence.appId===input.targetAppId))throw new Error('No linked evidence from that app.');
        store.grant(app.id,input.targetAppId,'observations.read',input.allowed);registry.broadcast(session.workspaceId,{type:'presence'});return send(200,await workspace(session));
      }
      if(req.method==='GET'&&url.pathname==='/api/observation')return send(200,store.observation(app.id,url.searchParams.get('id')));
      if(req.method==='POST'&&url.pathname==='/api/observation'){
        const event=store.saveObservation(app.id,await body(req));if(!event.duplicate)registry.changed(session.workspaceId,event);return send(200,{event,workspace:await workspace(session)});
      }
      if(req.method==='POST'&&url.pathname==='/api/task'){
        const input=await body(req);const task=app.tasks.find(t=>t.id===input.taskId);if(!task)throw new Error('Task not found.');
        if(input.action==='acknowledge')await gateway.read(session,task.evidence.appId,task.evidence.observationId);
        store.updateTask(app.id,input.taskId,input.action,input);registry.broadcast(session.workspaceId,{type:'tasks',appId:app.id});return send(200,await workspace(session));
      }
      if(req.method==='POST'&&url.pathname==='/api/author')return send(202,author(session).start((await body(req)).request));
      const job=url.pathname.match(/^\/api\/jobs\/([a-z0-9-]+)(\/cancel)?$/);
      if(job){if(req.method==='GET'&&!job[2])return send(200,author(session).get(job[1]));if(req.method==='POST'&&job[2])return send(200,author(session).cancel(job[1]));}
      if(req.method==='POST'&&url.pathname==='/api/install'){
        const input=await body(req),draft=packages.draft(input.draftId);
        if(!Array.isArray(input.grants)||JSON.stringify([...input.grants].sort())!==JSON.stringify([...draft.artifact.manifest.permissions].sort()))throw new Error('Approve the requested access before installing.');
        for(const task of app.tasks)registry.authorize(session,task.evidence.appId,task.evidence.observationId);
        await packages.install(input.draftId);registry.broadcast(session.workspaceId,{type:'tasks',appId:app.id});return send(200,await workspace(session));
      }
      if(req.method==='GET'&&url.pathname==='/api/panel'){
        const draftId=url.searchParams.get('draft'),artifact=draftId?packages.draft(draftId).artifact:packages.active();if(!artifact)throw new Error('No installed package.');
        const key=`${app.id}:${draftId}`;
        if(draftId&&!previews.has(key)){if(previews.size>=32)previews.delete(previews.keys().next().value);previews.set(key,await tasks(session));}
        const task=(draftId?previews.get(key):await tasks(session)).find(t=>t.id===url.searchParams.get('task'));
        if(!task?.observation)throw new Error(task?.availability??'Task not found.');
        registry.authorize(session,task.evidence.appId,task.evidence.observationId);
        const review=await runReview(artifact,task,task.observation),compiled=compilePanel(artifact),frameId=randomUUID();
        if(frames.size>=128)frames.delete(frames.keys().next().value);frames.set(frameId,{html:compiled.html,expires:Date.now()+300000});
        return send(200,{...compiled,framePath:`frame/${frameId}`,manifest:artifact.manifest,policy:artifact.policy,
          snapshot:{task:{id:task.id,title:task.title,reviewedRevision:task.reviewedRevision},observation:task.observation,review,canAcknowledge:artifact.manifest.permissions.includes('reviews.write')&&task.reviewedRevision<task.observation.revision}});
      }
      if(req.method==='POST'&&url.pathname==='/api/preview/acknowledge'){
        const input=await body(req),artifact=packages.draft(input.draftId).artifact,task=previews.get(`${app.id}:${input.draftId}`)?.find(t=>t.id===input.taskId);
        if(!artifact.manifest.permissions.includes('reviews.write')||!task||input.revision!==task.observation.revision)throw new Error('Invalid preview action.');
        registry.authorize(session,task.evidence.appId,task.evidence.observationId);task.reviewedRevision=input.revision;return send(200,{ok:true});
      }
      return send(404,{error:'Not found.'});
    }catch(error){if(!res.headersSent)send(400,{error:error instanceof SyntaxError?'Invalid JSON.':String(error.message).slice(0,300)});else res.end();}
  });
  const ws=new WebSocketServer({noServer:true,maxPayload:studio?1600000:131072});
  server.on('upgrade',(req,socket,head)=>{
    const origin=req.headers.origin;
    if(!/^127\.0\.0\.1:\d+$/.test(req.headers.host??'')||req.url!=='/api/events'||(origin&&!origins.includes(origin))){socket.destroy();return;}
    ws.handleUpgrade(req,socket,head,connection=>{
      let session=null;const timeout=setTimeout(()=>connection.close(),5000);
      connection.on('message',raw=>{try{const data=JSON.parse(raw.toString());if(!session){if(data.type!=='hello')throw new Error('Connection ticket required.');session=registry.attach(data.ticket,connection);clearTimeout(timeout);connection.send(JSON.stringify({type:'connected'}));}
        else if(data.type==='result')registry.reply(session,data);else throw new Error('Invalid message.');}catch{connection.close();}});
      connection.on('error',()=>{});connection.on('close',()=>clearTimeout(timeout));
    });
  });
  server.workspaceStore=store;server.workspaceRegistry=registry;server.workspaceGateway=gateway;
  server.engineApps=engine;
  server.on('close',()=>{for(const a of authors.values())a.close();registry.close();ws.close();store.close();});
  server.requestTimeout=5000;return server;
}
