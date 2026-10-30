import{createHash,randomBytes,timingSafeEqual}from'node:crypto';
import{validateAppManifest,genericDefinition,surfaceCatalogue,builtinManifests}from'../../packages/sdk/app-manifest.mjs';
import{appDefinition,describeApp}from'../../apps/definitions/index.mjs';
import{shapeSurface,shapeContract}from'../../packages/sdk/framework-ui.mjs';
const digest=value=>createHash('sha256').update(value).digest('hex');
export class EngineApps{
 constructor(root){this.root=root;this.db=root.db;this.db.exec('CREATE TABLE IF NOT EXISTS engine_apps(id TEXT PRIMARY KEY,manifest TEXT NOT NULL,credential_hash TEXT NOT NULL);CREATE TABLE IF NOT EXISTS engine_catalog(app_id TEXT PRIMARY KEY,value TEXT NOT NULL)');root.engineApps=this;}
 has(id){return !!this.db.prepare('SELECT id FROM engine_apps WHERE id=?').get(id);}
 manifest(id){const row=this.db.prepare('SELECT manifest FROM engine_apps WHERE id=?').get(id);if(!row)throw new Error('App is not registered with Core.');return JSON.parse(row.manifest);}
 definition(id){const manifest=this.manifest(id);return manifest.adapter==='surface'?genericDefinition(manifest):appDefinition(manifest.adapter==='fieldnote'?'scratchpad':'review-board');}
 register(value){
  const manifest=validateAppManifest(value);if(this.has(manifest.id)){if(JSON.stringify(this.manifest(manifest.id))!==JSON.stringify(manifest))throw new Error('App ID already belongs to another manifest.');return {manifest,created:false};}
  const existing=this.root.state().apps.find(a=>a.id===manifest.id),kind=manifest.adapter==='surface'?'surface-app':manifest.adapter==='fieldnote'?'scratchpad':'review-board';
  if(existing&&existing.kind!==kind)throw new Error('App ID already belongs to another adapter.');
  const credential=randomBytes(32).toString('hex');this.db.exec('BEGIN IMMEDIATE');try{
   this.db.prepare('INSERT INTO engine_apps VALUES(?,?,?)').run(manifest.id,JSON.stringify(manifest),digest(credential));
   if(!existing){const state=this.root.state();state.apps.push({id:manifest.id,kind,workspaceId:'local-demo',active:null,tasks:[]});this.root.write(state);}
   this.db.exec('COMMIT');return {manifest,created:true,credential};
  }catch(error){this.db.exec('ROLLBACK');throw error;}
 }
 issueCredential(id){this.manifest(id);const credential=randomBytes(32).toString('hex');this.db.prepare('UPDATE engine_apps SET credential_hash=? WHERE id=?').run(digest(credential),id);return credential;}
 authenticate(id,credential){const row=this.db.prepare('SELECT credential_hash FROM engine_apps WHERE id=?').get(id);if(!row||typeof credential!=='string'||credential.length!==64||!timingSafeEqual(Buffer.from(row.credential_hash),Buffer.from(digest(credential))))throw new Error('Native app identity was not accepted.');return this.manifest(id);}
 describe(id){
  const manifest=this.manifest(id),definition=this.definition(id),app=this.root.app(id),active=this.root.packages(id).active();
  const studio=this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='studio_state'").get();
  const enabled=studio?JSON.parse(this.db.prepare('SELECT value FROM studio_state WHERE id=1').get().value).enabled?.[id]!==false:true;
  const model=active&&enabled?active:definition.initialSurface,catalog=surfaceCatalogue(id,model,definition.contract);
  this.db.prepare('INSERT INTO engine_catalog VALUES(?,?) ON CONFLICT(app_id) DO UPDATE SET value=excluded.value').run(id,JSON.stringify(catalog));
  return {id,workspaceId:app.workspaceId,kind:definition.kind,title:definition.title,initialRequest:definition.initialRequest,name:manifest.name,author:manifest.author,purpose:manifest.purpose,adapter:manifest.adapter,surfaces:[{...catalog,ownership:'app'},{...surfaceCatalogue(id,shapeSurface,shapeContract),ownership:'system'}],mcp:{path:`/api/apps/${id}/mcp`},sharing:manifest.adapter==='fieldnote'?['read_saved_design']:manifest.adapter==='parcel'?['read_asset_feedback']:[]};
 }
 list(registry){return this.db.prepare('SELECT id FROM engine_apps ORDER BY rowid').all().map(({id})=>({...this.describe(id),online:registry.online(id),instances:[...registry.sessions.values()].filter(s=>s.appId===id&&s.socket?.readyState===1).map(s=>({id:s.instanceId,connectedAt:s.connectedAt,lastSeen:s.lastSeen}))}));}
}
export{builtinManifests};
