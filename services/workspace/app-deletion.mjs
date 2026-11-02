// Dashboard-only lifecycle operation. Project folders and user files are retained.
export class AppDeletion {
  constructor({engine,live,registry,launcher,creator}){Object.assign(this,{engine,live,registry,launcher,creator});}
  reason(appId){
    const app=this.engine.manifest(appId);
    if(app.adapter!=='surface')return 'Built-in apps cannot be deleted.';
    if(this.registry.online(appId))return 'Close this app before deleting it.';
    if(this.launcher.pending.has(appId))return 'Wait for this app to finish opening, then close it.';
    const job=this.creator.public();
    if(job?.appId===appId&&!['ready','failed'].includes(job.phase))return 'Wait for this app to finish building, then close it.';
    return '';
  }
  delete(input){
    if(!input||Object.keys(input).some(k=>!['appId','confirmation'].includes(k))||typeof input.appId!=='string'||!/^[a-z][a-z0-9-]{2,39}$/.test(input.appId))throw new Error('Choose a registered app.');
    const {appId,confirmation}=input,manifest=this.engine.manifest(appId),reason=this.reason(appId);
    if(reason)throw new Error(reason);
    if(confirmation!==manifest.name)throw new Error('Type the app name exactly to confirm deletion.');
    const root=this.live.root,db=root.db,automations=root.automations;
    const affected=(automations?.rows()??[]).filter(a=>a.ownerAppId===appId||[a.source,a.input,a.destination].some(r=>r?.appId===appId));
    db.exec('BEGIN IMMEDIATE');
    try{
      for(const a of affected)if(a.ownerAppId===appId)db.prepare('DELETE FROM automations WHERE id=?').run(a.id);
      else db.prepare('UPDATE automations SET value=? WHERE id=?').run(JSON.stringify({...a,enabled:false,last:{...a.last,status:'unavailable',message:'A referenced app was deleted; this Automation is paused.'}}),a.id);
      for(const table of ['app_packages','app_drafts','app_operations','surface_state','engine_catalog','live_apps','live_backups','live_drafts','live_migrations','live_revisions','live_adapter_schemas','automation_shares','automation_resources'])db.prepare(`DELETE FROM ${table} WHERE app_id=?`).run(appId);
      db.prepare('DELETE FROM automation_grants WHERE requester_app=? OR provider_app=?').run(appId,appId);
      const state=root.state();state.apps=state.apps.filter(a=>a.id!==appId);state.grants=state.grants.filter(g=>g.from!==appId&&g.to!==appId);root.write(state);
      const studio=this.live.studio.state();delete studio.enabled[appId];this.live.studio.write(studio);
      db.prepare('DELETE FROM engine_apps WHERE id=?').run(appId);
      db.exec('COMMIT');
    }catch(error){db.exec('ROLLBACK');throw error;}
    // Abort after commit: a failed transaction must leave the existing runtime usable.
    for(const a of affected){automations.running.get(a.id)?.controller.abort();clearTimeout(automations.timers.get(a.id));automations.timers.delete(a.id);automations.pendingEvents.delete(a.id);}
    for(const[key,author]of this.live.authors)if(key.startsWith(appId+':')){author.close();this.live.authors.delete(key);}
    clearTimeout(this.live.timers.get(appId));this.live.timers.delete(appId);
    for(const[id,session]of this.registry.sessions)if(session.appId===appId){session.socket?.terminate();this.registry.sessions.delete(id);}
    for(const[ticket,record]of this.registry.tickets)if(!this.registry.sessions.has(record.sessionId))this.registry.tickets.delete(ticket);
    root.icons?.cache?.delete(appId);
    this.registry.broadcast('local-demo',{type:'live'});automations?.notify();
    return{status:'deleted',appId,message:manifest.name+' was deleted from Core. Its project folder was kept.'};
  }
}
