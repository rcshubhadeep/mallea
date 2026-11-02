import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createCollaborationServer} from '../services/workspace/collaboration.mjs';
import {builtinManifests} from '../services/workspace/engine-apps.mjs';
import {dashboardManifest,dashboardApp,upgradeDashboardDelete} from '../packages/sdk/dashboard.mjs';
import {applyLiveChanges} from '../packages/sdk/live-model.mjs';
const config={endpoint:new URL('https://example.com/v1/chat/completions'),model:'muse-spark-open',key:'test-only-key'};
async function fixture(options={}){
 const s=await createCollaborationServer({engine:true,studio:true,controlToken:'test-delete-control',author:{config},...options});
 for(const m of [...builtinManifests,dashboardManifest])s.engineApps.register(m);
 const records={};
 for(const id of ['delete-study','keep-study']){
  records[id]=s.engineApps.register({version:1,id,name:id==='delete-study'?'Delete study':'Keep study',author:'Test',purpose:'Deletion test',adapter:'surface'});
  const app=applyLiveChanges(s.liveApps.read(id),{changes:[{op:'createModel',id:'notes',fields:{text:{type:'text',initial:id}}},{op:'addSurface',surface:{id:'body',title:'Notes',lifetime:'persistent',slot:'main',width:'wide',ui:{id:'text',type:'textarea',bind:'models.notes.text'}}}]},s.liveApps.contract(id)).artifact;
  s.liveApps.save(id,app,0);
 }
 return{s,records};
}
async function close(s){s.workspaceRegistry.close();s.closeAllConnections();await new Promise(r=>s.close(r));}
const confirmation={appId:'delete-study',confirmation:'Delete study'};
test('dashboard deletion is confirmed, Core-only, blocks active apps and retains project files across restart',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'mallea-delete-')),database=join(dir,'workspace.sqlite');let s;
 try{
  const result=await fixture({home:dir,database});s=result.s;
  const project=join(dir,'project');await mkdir(project);await writeFile(join(project,'keep.txt'),'project source');await writeFile(join(dir,'projects.json'),JSON.stringify({'delete-study':{folder:project}}));
  const registered=s.workspaceRegistry.register('delete-study'),ticket=s.workspaceRegistry.ticket(registered);
  assert.throws(()=>s.dashboard.deletion.delete({...confirmation,confirmation:''}),/Type the app name/);
  assert.throws(()=>s.dashboard.deletion.delete({...confirmation,folder:project}),/registered app/);
  for(const appId of ['mallea-core','scratchpad-main','review-main'])assert.throws(()=>s.dashboard.deletion.delete({appId,confirmation:s.engineApps.manifest(appId).name}),/Built-in/);
  registered.socket={readyState:1};assert.throws(()=>s.dashboard.deletion.delete(confirmation),/Close this app/);registered.socket=null;
  s.dashboard.launcher.pending.set('delete-study',Promise.resolve());assert.throws(()=>s.dashboard.deletion.delete(confirmation),/finish opening/);s.dashboard.launcher.pending.delete('delete-study');
  s.dashboard.creator.job={appId:'delete-study',phase:'launching'};assert.throws(()=>s.dashboard.deletion.delete(confirmation),/finish building/);s.dashboard.creator.job=null;
  const dashboardSession=s.workspaceRegistry.register('mallea-core');await new Promise(r=>s.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+s.address().port;
  const call=async(headers,args)=>fetch(base+'/api/engine/dashboard',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify({action:'delete',args})});
  assert.equal((await call({'X-Mallea-Session':dashboardSession.id},confirmation)).status,403);
  const response=await call({'X-Mallea-Control':'test-delete-control'},confirmation);assert.equal(response.status,200);assert.equal((await response.json()).status,'deleted');
  assert(!s.engineApps.has('delete-study'));assert(!s.workspaceStore.state().apps.some(a=>a.id==='delete-study'));assert.throws(()=>s.workspaceRegistry.require(registered.id),/expired/);assert(!s.workspaceRegistry.tickets.has(ticket));
  assert.throws(()=>s.engineApps.authenticate('delete-study',result.records['delete-study'].credential),/not accepted/);assert.equal(s.liveApps.read('keep-study').models.notes.values.text,'keep-study');
  assert.equal(await readFile(join(project,'keep.txt'),'utf8'),'project source');assert(JSON.parse(await readFile(join(dir,'projects.json'),'utf8'))['delete-study']);
  assert(!s.dashboard.state().data.apps.some(a=>a.id==='delete-study'));
  await close(s);s=await createCollaborationServer({engine:true,studio:true,home:dir,database,author:{config}});assert(!s.engineApps.has('delete-study'));assert.equal(s.liveApps.read('keep-study').models.notes.values.text,'keep-study');
 }finally{if(s)await close(s);await rm(dir,{recursive:true,force:true});}
});
test('deletion removes owned data/grants, pauses dependent Automations and rolls back failed cleanup',async()=>{
 const{s}=await fixture();try{
  const db=s.workspaceStore.db,sessions={};
  for(const id of ['delete-study','keep-study']){sessions[id]=s.workspaceRegistry.register(id);sessions[id].socket={readyState:1,send(){},terminate(){}};s.automations.share(sessions[id],{surfaceId:'body',shared:true});}
  const ref=id=>Object.fromEntries(['appId','surfaceId','elementId','binding'].map(k=>[k,s.automations.resources(id)[0][k]]));
  const install=(from,to)=>{const grant=s.automations.request(sessions[from],{requesterSurfaceId:'body',resource:ref(to),operation:'write'});s.automations.decide(sessions[to],{id:grant.id,allowed:true});return s.automations.install(sessions[from],{name:'Copy',source:ref(from),event:'value.changed',input:ref(from),processor:'copy',instruction:'',destination:ref(to),mode:'replace',approved:true});};
  const owned=install('delete-study','keep-study'),dependent=install('keep-study','delete-study');sessions['delete-study'].socket=null;
  db.prepare('INSERT INTO live_revisions VALUES(?,?,?)').run('delete-study',1,'{}');db.prepare('INSERT INTO live_drafts VALUES(?,?,?,?,?,?)').run('test-draft','delete-study',1,'{}','test',null);
  db.exec("CREATE TRIGGER fail_app_delete BEFORE DELETE ON live_apps BEGIN SELECT RAISE(ABORT,'test rollback'); END");
  assert.throws(()=>s.dashboard.deletion.delete(confirmation),/test rollback/);assert(s.engineApps.has('delete-study'));assert.equal(s.automations.rows().length,2);assert.equal(s.automations.grants('delete-study').length,2);
  db.exec('DROP TRIGGER fail_app_delete');
  const controller=new AbortController();s.automations.running.set(dependent.id,{controller});
  s.dashboard.deletion.delete(confirmation);assert(controller.signal.aborted);
  assert(!s.automations.rows().some(a=>a.id===owned.id));const paused=s.automations.rows().find(a=>a.id===dependent.id);assert.equal(paused.enabled,false);assert.match(paused.last.message,/app was deleted/);
  assert.equal(s.automations.grants('keep-study').length,0);assert.equal(s.liveApps.read('keep-study').models.notes.values.text,'keep-study');
  for(const table of ['live_apps','live_backups','live_drafts','live_revisions','live_adapter_schemas','automation_resources','automation_shares'])assert.equal(db.prepare(`SELECT count(*) n FROM ${table} WHERE app_id=?`).get('delete-study').n,0,table);
 }finally{await close(s);}
});
test('delete controls are Surface data and their preserving upgrade runs once',async()=>{
 const fresh=dashboardApp(),old=structuredClone(fresh);const cards=old.surfaces.find(s=>s.id==='running-apps').ui.children.find(n=>n.type==='repeat');cards.template.children=cards.template.children.filter(n=>n.action!=='core.delete'&&n.id!=='delete-app-reason');cards.template.children[1].text='Custom';
 const next=upgradeDashboardDelete(old);assert.equal(next.revision,old.revision+1);assert.equal(upgradeDashboardDelete(next),next);assert.equal(next.surfaces[1].ui.children[1].template.children[1].text,'Custom');
 const{s}=await fixture();try{s.liveApps.read('mallea-core');const session=s.workspaceRegistry.register('mallea-core'),info=s.liveApps.info(session),index=info.data.dashboard.apps.findIndex(a=>a.id==='delete-study');
  const action=s.liveApps.event(session,{surfaceId:'running-apps',elementId:'delete-app',event:'click',itemIndex:index,expectedDataRevision:info.dataRevision});assert.deepEqual(action.adapterAction,{name:'core.delete',args:{appId:'delete-study'}});assert(s.engineApps.has('delete-study'),'Opening confirmation must not delete');
  assert(s.liveApps.inventory('mallea-core').some(v=>v.id==='core-delete-app'&&v.ownership==='system'));assert(!s.liveApps.inventory('delete-study').some(v=>v.id==='core-delete-app'));
  const current=s.liveApps.read('mallea-core'),list=current.surfaces.find(s=>s.id==='running-apps').ui.children.find(n=>n.type==='repeat');list.template.children=list.template.children.filter(n=>n.action!=='core.delete');s.liveApps.save('mallea-core',current,0);s.liveApps.read('mallea-core');const migrated=s.liveApps.read('mallea-core');assert(!JSON.stringify(migrated).includes('"action":"core.delete"'));
 }finally{await close(s);}
});
test('a deleted app cannot save a late authoring result or reuse its old connection',async()=>{
 let release;const{s}=await fixture({author:{config,infer:()=>new Promise(r=>{release=r;})}});
 try{const session=s.workspaceRegistry.register('delete-study'),author=s.liveApps.author(session),job=author.start('Arrange the app in rows');await new Promise(r=>setImmediate(r));
  s.dashboard.deletion.delete(confirmation);release({choice:{finish_reason:'stop',message:{content:JSON.stringify({changes:[{op:'setApp',layout:'rows'}]})}},usage:{}});
  await new Promise(r=>setImmediate(r));assert.equal(author.get(job.id).phase,'cancelled');assert(![...s.liveApps.authors.keys()].some(k=>k.startsWith('delete-study:')));
  assert.equal(s.workspaceStore.db.prepare('SELECT count(*) n FROM live_drafts WHERE app_id=?').get('delete-study').n,0);assert.throws(()=>s.workspaceRegistry.require(session.id),/expired/);assert(!s.engineApps.has('delete-study'));
 }finally{await close(s);}
});
