import { randomUUID } from 'node:crypto';
import { describeApp, appDefinition } from '../../apps/definitions/index.mjs';

export class Registry {
  constructor(store){this.store=store;this.sessions=new Map();this.tickets=new Map();this.pending=new Map();}
  register(appId,workspaceId='local-demo'){
    const app=this.store.app(appId);if(app.workspaceId!==workspaceId)throw new Error('App is outside this workspace.');
    if(this.sessions.size>=64)throw new Error('Too many app sessions. Restart unused clients.');
    const session={id:randomUUID(),instanceId:randomUUID(),appId,workspaceId,socket:null};this.sessions.set(session.id,session);
    return session;
  }
  require(id){const session=this.sessions.get(id);if(!session)throw new Error('Session expired. Reconnect the app.');return session;}
  ticket(session){const ticket=randomUUID();if(this.tickets.size>=128)this.tickets.delete(this.tickets.keys().next().value);this.tickets.set(ticket,{sessionId:session.id,expires:Date.now()+10000});return ticket;}
  attach(ticket,socket){const record=this.tickets.get(ticket);this.tickets.delete(ticket);if(!record||record.expires<Date.now())throw new Error('Invalid connection ticket.');
    const session=this.require(record.sessionId);session.socket?.close();session.socket=socket;this.broadcast(session.workspaceId,{type:'presence'});
    socket.on('close',()=>{if(session.socket===socket){session.socket=null;this.broadcast(session.workspaceId,{type:'presence'});}
      for(const [id,p]of this.pending)if(p.sessionId===session.id){clearTimeout(p.timer);p.reject(new Error('Evidence owner disconnected.'));this.pending.delete(id);}});
    return session;
  }
  online(appId){return [...this.sessions.values()].some(s=>s.appId===appId&&s.socket?.readyState===1);}
  list(session){return this.store.state().apps.filter(a=>a.workspaceId===session.workspaceId).map(a=>({...describeApp(a),online:this.online(a.id),allowed:this.store.allowed(session.appId,a.id)}));}
  authorize(session,targetAppId,observationId){
    const target=this.store.app(targetAppId);
    if(target.workspaceId!==session.workspaceId||!appDefinition(target.kind).provides.some(c=>c.name==='read_observation'))throw new Error('Capability is unavailable in this workspace.');
    if(!this.store.allowed(session.appId,targetAppId))throw new Error('Allow notebook evidence access before reading.');
    if(session.appId!==targetAppId&&!this.store.linked(session.appId,targetAppId,observationId))throw new Error('Evidence is not linked to this app.');
    return target;
  }
  async read(session,targetAppId,observationId){
    this.authorize(session,targetAppId,observationId);
    if(session.appId===targetAppId)return this.store.observation(targetAppId,observationId);
    const target=[...this.sessions.values()].find(s=>s.appId===targetAppId&&s.workspaceId===session.workspaceId&&s.socket?.readyState===1);
    if(!target)throw new Error('Evidence owner is offline. Open the notebook to refresh evidence.');
    const id=randomUUID();
    const value=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Evidence owner did not respond.'));},5000);
      this.pending.set(id,{sessionId:target.id,resolve,reject,timer});target.socket.send(JSON.stringify({type:'invoke',id,capability:'read_observation',arguments:{observationId}}));
    });
    this.authorize(session,targetAppId,observationId);
    const authoritative=this.store.observation(targetAppId,observationId);
    if(JSON.stringify(value)!==JSON.stringify(authoritative))throw new Error('Owner response is stale or invalid. Refresh evidence.');
    return value;
  }
  reply(session,message){const pending=this.pending.get(message.id);if(!pending||pending.sessionId!==session.id)return;
    this.pending.delete(message.id);clearTimeout(pending.timer);message.error?pending.reject(new Error('Evidence owner could not complete the read.')):pending.resolve(message.value);
  }
  async readRegistered(session,targetAppId,name,args){
    this.studio.authorize(session,targetAppId,name,args);
    if(session.appId===targetAppId)return this.studio.resource(session,name,args);
    const target=[...this.sessions.values()].find(s=>s.appId===targetAppId&&s.workspaceId===session.workspaceId&&s.socket?.readyState===1);
    if(!target)throw new Error('Source app is offline. Open Fieldnote to read a saved revision.');
    const id=randomUUID();const value=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Source app did not respond.'));},5000);this.pending.set(id,{sessionId:target.id,resolve,reject,timer});target.socket.send(JSON.stringify({type:'invoke',id,capability:name,arguments:args}));});
    this.studio.authorize(session,targetAppId,name,args);
    const current=this.studio.resource(target,name,args);if(JSON.stringify(current)!==JSON.stringify(value))throw new Error('Source revision changed during read. Try again.');return value;
  }
  broadcast(workspaceId,event){for(const s of this.sessions.values())if(s.workspaceId===workspaceId&&s.socket?.readyState===1)s.socket.send(JSON.stringify(event));}
  changed(workspaceId,event){for(const s of this.sessions.values())if(s.workspaceId===workspaceId&&s.socket?.readyState===1&&this.store.allowed(s.appId,event.sourceAppId)&&(s.appId===event.sourceAppId||this.store.linked(s.appId,event.sourceAppId,event.observationId)))s.socket.send(JSON.stringify({type:'changed',...event}));}
  close(){for(const s of this.sessions.values())s.socket?.terminate();for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(new Error('Service stopped.'));}this.pending.clear();}
}
