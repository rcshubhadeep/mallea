import { validateLocalValues } from '../../packages/sdk/surface.mjs';
import { z } from 'zod';

// Framework-owned local values. No domain field names or cross-app write routes.
export class SurfaceStateStore {
 constructor(root){this.root=root;this.db=root.db;this.db.exec('CREATE TABLE IF NOT EXISTS surface_state(app_id TEXT NOT NULL,surface_id TEXT NOT NULL,revision INTEGER NOT NULL,value TEXT NOT NULL,PRIMARY KEY(app_id,surface_id))');}
 row(appId,id){const row=this.db.prepare('SELECT revision,value FROM surface_state WHERE app_id=? AND surface_id=?').get(appId,id);return row?{revision:row.revision,fields:JSON.parse(row.value)}:{revision:0,fields:{}};}
 snapshot(appId,artifact){const row=this.row(appId,artifact.manifest.id),values={};for(const [key,field]of Object.entries(artifact.state??{})){const old=row.fields[key];values[key]=old?.type===field.type?old.value:field.initial;}return {revision:row.revision,values};}
 activate(appId,artifact){
  if(artifact.manifest.sdkVersion!=='0.3')return;
  const row=this.row(appId,artifact.manifest.id);let changed=false;
  for(const [key,field]of Object.entries(artifact.state??{})){
   if(Object.hasOwn(row.fields,key)){if(row.fields[key].type!==field.type)throw new Error('A saved local field has a different type. Use a new field name.');}
   else{row.fields[key]={type:field.type,value:field.initial};changed=true;}
  }
  if(changed)this.write(appId,artifact.manifest.id,row.revision+1,row.fields);
 }
 write(appId,id,revision,fields){this.db.prepare('INSERT INTO surface_state VALUES(?,?,?,?) ON CONFLICT(app_id,surface_id) DO UPDATE SET revision=excluded.revision,value=excluded.value').run(appId,id,revision,JSON.stringify(fields));}
 save(session,input){
  const parsed=z.object({version:z.string(),expectedRevision:z.number().int().min(0),values:z.record(z.string(),z.string())}).strict().parse(input);
  this.db.exec('BEGIN IMMEDIATE');try{
   const artifact=this.root.packages(session.appId).active();if(!artifact||artifact.manifest.version!==parsed.version)throw new Error('Surface changed. Reload before saving local fields.');
   const values=validateLocalValues(artifact,parsed.values),row=this.row(session.appId,artifact.manifest.id);
   if(row.revision!==parsed.expectedRevision)throw new Error('Local values changed in another window. Review them before saving again.');
   for(const [key,value]of Object.entries(values))row.fields[key]={type:artifact.state[key].type,value};
   this.write(session.appId,artifact.manifest.id,row.revision+1,row.fields);this.db.exec('COMMIT');return {revision:row.revision+1,values};
  }catch(error){this.db.exec('ROLLBACK');throw error;}
 }
}
