import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WebSocket } from 'ws';
import { validateSurface,readBinding,dispatchSurfaceAction } from '../packages/sdk/surface.mjs';
import { scratchContract,initialWorkspace } from '../apps/definitions/studio.mjs';
import { createCollaborationServer } from '../services/workspace/collaboration.mjs';
import { CollaborationStore } from '../services/workspace/collaboration-store.mjs';
import { StudioStore } from '../services/workspace/studio-store.mjs';

export function colorSurface(version='1.0.0'){
 const a=structuredClone(initialWorkspace);a.manifest.version=version;a.manifest.permissions.push('annotation.color');a.ui.children.push({id:'color',type:'color',label:'Annotation color',bind:'draft.color',action:'annotation.color',argument:'color'});return a;
}
function png(){
 const crc=b=>{let c=0xffffffff;for(const x of b){c^=x;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^0xffffffff)>>>0;};
 const chunk=(kind,data)=>{const name=Buffer.from(kind),length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([length,name,data,checksum]);};
 const header=Buffer.alloc(13);header.writeUInt32BE(640);header.writeUInt32BE(420,4);header[8]=8;header[9]=6;
 return 'data:image/png;base64,'+Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',header),chunk('IDAT',deflateSync(Buffer.alloc((640*4+1)*420))),chunk('IEND',Buffer.alloc(0))]).toString('base64');
}

test('Surface rejects authority/markup/binding escapes and handles unrelated registered schema',()=>{
 assert.equal(validateSurface(colorSurface(),scratchContract).ui.type,'stack');
 for(const mutate of [a=>a.ui.children.push({id:'script',type:'script'}),a=>a.ui.children.push({id:'bad',type:'text',bind:'secret.key'}),a=>a.ui.children.push({id:'bad',type:'button',action:'filesystem.delete'}),a=>a.ui.children.push(a.ui.children[0]),a=>a.ui.children.push({id:'bad',type:'text',html:'<script/>'}),a=>a.manifest.permissions.push('native.exec')]){const a=colorSurface();mutate(a);assert.throws(()=>validateSurface(a,scratchContract));}
 const contract={readPermission:'weather.read',permissions:['weather.read','units.set'],fields:{'forecast.units':'text'},components:[],actions:{'units.set':{argument:'units'}}};
 const a={manifest:{id:'weather-surface',version:'1.0.0',title:'Forecast',sdkVersion:'0.3',permissions:contract.permissions},ui:{id:'units',type:'input',label:'Units',bind:'forecast.units',action:'units.set',argument:'units'}};
 assert.equal(validateSurface(a,contract).ui.bind,'forecast.units');assert.equal(readBinding({forecast:{units:'celsius'}},a.ui.bind),'celsius');assert.equal(readBinding({},'constructor.prototype'),undefined);
 const weather={units:'celsius'};dispatchSurfaceAction(contract,a.manifest.permissions,'units.set',{units:'fahrenheit'},(_name,args)=>{weather.units=args.units;});assert.equal(weather.units,'fahrenheit');
 assert.throws(()=>dispatchSurfaceAction(contract,[],'units.set',{units:'celsius'},()=>{}),/access/);assert.throws(()=>dispatchSurfaceAction(contract,a.manifest.permissions,'units.set',{wrong:'celsius'},()=>{}),/arguments/);
});

test('Surface install is app-scoped and rejects stale/invalid revisions without changing saved data',async()=>{
 const root=new CollaborationStore(':memory:');const studio=new StudioStore(root);try{
  const packages=root.packages('scratchpad-main'),before=studio.state();packages.saveDraft('a',colorSurface(),null,'color');packages.saveDraft('stale',colorSurface('1.0.1'),null,'stale');await packages.install('a');
  await assert.rejects(packages.install('stale'),/stale/);assert.equal(packages.active().manifest.version,'1.0.0');assert.deepEqual(studio.state(),before);assert.equal(root.packages('review-main').active(),null);
  const bad=colorSurface('1.0.1');bad.ui.children[0].component='raw-tauri';assert.throws(()=>packages.saveDraft('bad',bad,'1.0.0','bad'));
  studio.enable({appId:'scratchpad-main'},false);assert.equal(studio.info({appId:'scratchpad-main'}).enabled,false);assert.equal(packages.active().manifest.version,'1.0.0');
 }finally{root.close();}
});

test('studio saved state, installed Surface and disabled state survive reopening storage',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mallea-surface-')),path=join(dir,'studio.sqlite');let root;
 try{
  root=new CollaborationStore(path);let studio=new StudioStore(root);const packages=root.packages('scratchpad-main');packages.saveDraft('persist',colorSurface(),null,'persist');await packages.install('persist');
  const draft={...studio.state().draft,color:'#112233',note:'Persist saved image/note'};studio.save({appId:'scratchpad-main'},{image:png(),draft,expectedRevision:1,operationId:randomUUID()});studio.enable({appId:'scratchpad-main'},false);root.close();
  root=new CollaborationStore(path);studio=new StudioStore(root);const info=studio.info({appId:'scratchpad-main'});assert.equal(info.workspace.manifest.version,'1.0.0');assert.equal(info.enabled,false);assert.equal(info.data.draft.color,'#112233');assert.equal(info.data.saved.note,'Persist saved image/note');assert.equal(info.data.saved.revision,2);
 }finally{root?.close();await rm(dir,{recursive:true,force:true});}
});

test('saved-design MCP owner routing enforces grants, draft boundary, offline and duplicate saves',async()=>{
 const server=await createCollaborationServer({studio:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;let socket;
 try{
  const token=(await(await fetch(base+'/api/bootstrap')).json()).token;
  const call=async(session,path,body)=>{const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token,'X-Mallea-Session':session??''},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,value:await r.json()};};
  const source=(await call(null,'register',{kind:'scratchpad'})).value.session,review=(await call(null,'register',{kind:'review-board'})).value.session;
  assert.equal((await call(review,'studio/refresh',{})).status,400);assert.equal((await call(review,'studio/save',{})).status,400);
  await call(review,'studio/access',{allowed:true});assert.match((await call(review,'studio/refresh',{})).value.error,/offline/);
  const ticket=(await call(source,'connection',{})).value.ticket;socket=new WebSocket(base.replace('http:','ws:')+'/api/events');await new Promise(r=>socket.once('open',r));
  const connected=new Promise(r=>socket.on('message',raw=>{if(JSON.parse(raw).type==='connected')r();}));
  socket.on('message',async raw=>{const m=JSON.parse(raw);if(m.type==='invoke'){const result=await call(source,'studio/owner',{capability:m.capability,arguments:m.arguments});socket.send(JSON.stringify({type:'result',id:m.id,value:result.value}));}});socket.send(JSON.stringify({type:'hello',ticket}));await connected;
  const state=(await call(source,'studio/state')).value.data;const input={image:png(),draft:{...state.draft,text:'Published title',note:'Saved note'},expectedRevision:1,operationId:randomUUID()};
  assert.equal((await call(source,'studio/save',input)).status,200);assert.equal((await call(source,'studio/save',input)).status,200);
  assert.equal((await call(source,'studio/save',{...input,draft:{...input.draft,note:'different'}})).status,400);
  assert.equal((await call(source,'studio/save',{...input,operationId:randomUUID()})).status,400);
  const refreshed=await call(review,'studio/refresh',{});assert.equal(refreshed.status,200);assert.equal(refreshed.value.data.asset.sourceRevision,2);assert.equal(refreshed.value.data.asset.note,'Saved note');
  const unchanged=await call(review,'studio/refresh',{});assert.equal(unchanged.value.data.asset.revision,refreshed.value.data.asset.revision);
  await call(review,'studio/access',{allowed:false});assert.equal((await call(review,'studio/refresh',{})).status,400);
  const scoped=await call(review,'studio/owner',{capability:'read_saved_design',arguments:{designId:'design-moon'}});assert.equal(scoped.status,400);
 }finally{socket?.terminate();server.closeAllConnections();await new Promise(r=>server.close(r));}
});
