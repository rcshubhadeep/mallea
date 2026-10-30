import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { initialState } from './store.mjs';
import { appDefinition } from '../../apps/definitions/index.mjs';
import { validatePackage } from '../../packages/sdk/package.mjs';

const encode = value => JSON.stringify(value);
export class CollaborationStore {
  constructor(path) {
    if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
    this.db=new DatabaseSync(path);this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    const legacy=!!this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='workspace'").get();
    const migrated=!!this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='collaboration'").get();
    this.backup=null;
    if(legacy&&!migrated&&path!==':memory:'){
      this.backup=`${path}.pre-slice002-${Date.now()}.sqlite`;
      if(existsSync(this.backup))throw new Error('Migration backup already exists.');
      this.db.exec(`VACUUM INTO '${this.backup.replaceAll("'","''")}'`);
    }
    this.db.exec('BEGIN IMMEDIATE');
    try{
      this.db.exec(`CREATE TABLE IF NOT EXISTS collaboration(id INTEGER PRIMARY KEY CHECK(id=1),value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS app_packages(app_id TEXT NOT NULL,version TEXT NOT NULL,value TEXT NOT NULL,PRIMARY KEY(app_id,version));
        CREATE TABLE IF NOT EXISTS app_drafts(id TEXT PRIMARY KEY,app_id TEXT NOT NULL,base TEXT,value TEXT NOT NULL,request TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS app_operations(app_id TEXT NOT NULL,id TEXT NOT NULL,hash TEXT NOT NULL,value TEXT NOT NULL,PRIMARY KEY(app_id,id));`);
      if(!this.db.prepare('SELECT id FROM collaboration WHERE id=1').get()){
        const previous=legacy?JSON.parse(this.db.prepare('SELECT value FROM workspace WHERE id=1').get().value):initialState();
        const notebook={id:'notebook-main',kind:'notebook',workspaceId:'local-demo',active:null,observations:[],tasks:[]};
        const board={id:'board-main',kind:'board',workspaceId:'local-demo',active:previous.active,tasks:[]};
        for(const task of previous.tasks){
          const observation={id:`obs-${task.id}`,...task.observation,title:task.title};
          notebook.observations.push(observation);
          const {observation:omitted,...fields}=task;
          board.tasks.push({...fields,evidence:{appId:notebook.id,observationId:observation.id}});
          notebook.tasks.push({...fields,reviewedRevision:0,evidence:{appId:notebook.id,observationId:observation.id}});
        }
        this.db.prepare('INSERT INTO collaboration VALUES(1,?)').run(encode({schemaVersion:2,apps:[board,notebook],grants:[]}));
        if(legacy){
          for(const row of this.db.prepare('SELECT version,value FROM packages').all())this.db.prepare('INSERT INTO app_packages VALUES(?,?,?)').run(board.id,row.version,row.value);
          for(const row of this.db.prepare('SELECT * FROM drafts').all())this.db.prepare('INSERT INTO app_drafts VALUES(?,?,?,?,?)').run(row.id,board.id,row.base,row.value,row.request);
        }
      }
      if(this.state().schemaVersion!==2)throw new Error('Unsupported workspace schema.');
      this.db.exec('COMMIT');
    }catch(error){this.db.exec('ROLLBACK');this.db.close();throw error;}
  }
  state(){return JSON.parse(this.db.prepare('SELECT value FROM collaboration WHERE id=1').get().value);}
  write(state){this.db.prepare('UPDATE collaboration SET value=? WHERE id=1').run(encode(state));}
  app(id){const app=this.state().apps.find(a=>a.id===id);if(!app)throw new Error('Unknown app.');return app;}
  definition(id){return this.engineApps?.has(id)?this.engineApps.definition(id):appDefinition(this.app(id).kind);}
  describe(id){if(this.engineApps?.has(id))return this.engineApps.describe(id);const app=this.app(id);const {verify,validate,...definition}=this.definition(id);return {id,workspaceId:app.workspaceId,...definition};}
  createApp(id,kind,workspaceId='local-demo'){
    appDefinition(kind);if(!/^[a-z][a-z0-9-]{2,60}$/.test(id)||this.state().apps.some(a=>a.id===id))throw new Error('Invalid or duplicate app ID.');
    const state=this.state();state.apps.push({id,kind,workspaceId,active:null,tasks:[],...(kind==='notebook'?{observations:[]}: {})});this.write(state);return this.app(id);
  }
  observation(appId,id){const app=this.app(appId);if(app.kind!=='notebook')throw new Error('App does not own observations.');const value=app.observations.find(o=>o.id===id);if(!value)throw new Error('Observation not found.');return value;}
  grant(from,to,capability,allowed){
    const a=this.app(from),b=this.app(to);if(a.workspaceId!==b.workspaceId||b.kind!=='notebook'||capability!=='observations.read'||typeof allowed!=='boolean')throw new Error('Invalid capability grant.');
    const state=this.state();state.grants=state.grants.filter(g=>!(g.from===from&&g.to===to&&g.capability===capability));if(allowed)state.grants.push({from,to,capability});this.write(state);
  }
  allowed(from,to){return from===to||this.state().grants.some(g=>g.from===from&&g.to===to&&g.capability==='observations.read');}
  linked(from,to,id){return this.app(from).tasks.some(t=>t.evidence.appId===to&&t.evidence.observationId===id);}
  saveObservation(appId,input){
    if(!input||typeof input.operationId!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(input.operationId)||typeof input.text!=='string'||!input.text.trim()||input.text.length>4000)throw new Error('Invalid observation edit.');
    const hash=createHash('sha256').update(encode(input)).digest('hex');
    this.db.exec('BEGIN IMMEDIATE');
    try{
      const prior=this.db.prepare('SELECT * FROM app_operations WHERE app_id=? AND id=?').get(appId,input.operationId);
      if(prior){if(prior.hash!==hash)throw new Error('Operation ID was already used for another edit.');this.db.exec('COMMIT');return {...JSON.parse(prior.value),duplicate:true};}
      const state=this.state(),app=state.apps.find(a=>a.id===appId);if(app?.kind!=='notebook')throw new Error('Only the owning notebook can edit evidence.');
      const observation=app.observations.find(o=>o.id===input.id);if(!observation)throw new Error('Observation not found.');
      if(input.expectedRevision!==observation.revision)throw new Error('Evidence changed. Reload before saving.');
      observation.text=input.text;observation.revision++;
      const result={sourceAppId:appId,observationId:observation.id,revision:observation.revision,operationId:input.operationId};
      this.write(state);this.db.prepare('INSERT INTO app_operations VALUES(?,?,?,?)').run(appId,input.operationId,hash,encode(result));this.db.exec('COMMIT');return result;
    }catch(error){this.db.exec('ROLLBACK');throw error;}
  }
  updateTask(appId,id,action,input={}){
    const state=this.state(),app=state.apps.find(a=>a.id===appId),task=app?.tasks.find(t=>t.id===id);if(!task)throw new Error('Task not found.');
    if(action==='critical'&&app.kind==='board'&&typeof input.critical==='boolean')task.critical=input.critical;
    else if(action==='acknowledge'){
      if(!this.packages(appId).active()?.manifest.permissions.includes('reviews.write'))throw new Error('Acknowledgement access is not installed.');
      const current=this.observation(task.evidence.appId,task.evidence.observationId);
      if(!this.allowed(appId,task.evidence.appId)||current.revision!==input.revision)throw new Error('Evidence changed or access is missing. Review the current revision.');
      task.reviewedRevision=input.revision;
    }else throw new Error('This app cannot perform that action.');
    this.write(state);
  }
  packages(appId){
    const root=this;const app=()=>root.app(appId);const verify=artifact=>root.definition(appId).verify(artifact);
    const validate=artifact=>(root.definition(appId).validate??validatePackage)(artifact);
    const adapter={
      definition:root.definition(appId),
      state:()=>({active:app().active,tasks:app().tasks}),
      active:()=>{const version=app().active;return version?JSON.parse(root.db.prepare('SELECT value FROM app_packages WHERE app_id=? AND version=?').get(appId,version).value):null;},
      versions:()=>root.db.prepare('SELECT version FROM app_packages WHERE app_id=? ORDER BY rowid').all(appId).map(r=>r.version),
      draft:id=>{const row=root.db.prepare('SELECT * FROM app_drafts WHERE id=? AND app_id=?').get(id,appId);if(!row)throw new Error('Draft not found for this app.');return {id:row.id,base:row.base,artifact:JSON.parse(row.value),request:row.request};},
      saveDraft:(id,artifact,base,request)=>{validate(artifact);root.db.prepare('INSERT INTO app_drafts VALUES(?,?,?,?,?)').run(id,appId,base,encode(artifact),request);},
      install:async id=>{
        const draft=adapter.draft(id);validate(draft.artifact);await verify(draft.artifact);root.db.exec('BEGIN IMMEDIATE');
        try{const state=root.state(),target=state.apps.find(a=>a.id===appId);if(target.active!==draft.base)throw new Error('This draft is stale. Generate again from the installed version.');
          if(adapter.active()&&adapter.active().manifest.id!==draft.artifact.manifest.id)throw new Error('Keep the package identity when revising.');
          root.surfaceState?.activate(appId,draft.artifact);
          root.db.prepare('INSERT INTO app_packages VALUES(?,?,?)').run(appId,draft.artifact.manifest.version,encode(draft.artifact));target.active=draft.artifact.manifest.version;root.write(state);root.db.exec('COMMIT');
        }catch(error){root.db.exec('ROLLBACK');throw error;}return adapter.active();
      },
    };return adapter;
  }
  close(){this.db.close();}
}
