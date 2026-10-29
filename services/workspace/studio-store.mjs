import { z } from 'zod';
import { createHash } from 'node:crypto';
import { draftSchema,initialWorkspace,reviewWorkspace,studioCapabilities } from '../../apps/definitions/studio.mjs';
import { appDefinition,describeApp } from '../../apps/definitions/index.mjs';
import { SurfaceStateStore } from './surface-state.mjs';
const savedSchema=z.object({image:z.string().max(1500000).regex(/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/),draft:draftSchema,expectedRevision:z.number().int().min(0),operationId:z.string().uuid()}).strict();
const seedImage='data:image/svg+xml;base64,'+Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#284f50"/><circle cx="448" cy="135" r="79" fill="#f0dfac"/><path d="M0 300L160 180 325 330 470 260 640 325V420H0Z" fill="#193a38"/><path d="M0 350L190 270 380 400 640 318V420H0Z" fill="#d39a70"/><text x="40" y="260" fill="#f0dfac" font-size="42" font-family="sans-serif">STAY CURIOUS</text></svg>').toString('base64');
export class StudioStore{
 constructor(root){this.root=root;this.db=root.db;this.localState=new SurfaceStateStore(root);root.surfaceState=this.localState;this.db.exec('CREATE TABLE IF NOT EXISTS studio_state(id INTEGER PRIMARY KEY CHECK(id=1),value TEXT NOT NULL)');
  this.db.prepare('INSERT OR IGNORE INTO studio_state VALUES(1,?)').run(JSON.stringify({draft:{text:'STAY CURIOUS',color:'#f0dfac',note:'Exploring a warmer palette for the launch artwork.',x:36,y:226},saved:{id:'design-moon',image:seedImage,note:'Initial concept for review.',revision:1},asset:{id:'asset-moon',title:'Moonlight / Launch artwork',image:seedImage,note:'Initial concept for review.',revision:1,sourceRevision:1},enabled:{},operations:{}}));
  for(const [id,kind]of [['scratchpad-main','scratchpad'],['review-main','review-board']])if(!root.state().apps.some(a=>a.id===id))root.createApp(id,kind);
 }
 state(){return JSON.parse(this.db.prepare('SELECT value FROM studio_state WHERE id=1').get().value);}
 write(s){this.db.prepare('UPDATE studio_state SET value=? WHERE id=1').run(JSON.stringify(s));}
 info(session){const app=this.root.app(session.appId),s=this.state(),packages=this.root.packages(app.id),workspace=packages.active()??(app.kind==='scratchpad'?initialWorkspace:reviewWorkspace),localState=this.localState.snapshot(app.id,workspace);return {app:describeApp(app),data:{...(app.kind==='scratchpad'?{draft:s.draft,saved:s.saved}:{asset:s.asset}),local:localState.values},localState,workspace,installed:!!packages.active(),enabled:s.enabled[app.id]!==false,versions:packages.versions(),contract:appDefinition(app.kind).contract};}
 own(session,kind){if(this.root.app(session.appId).kind!==kind)throw new Error('This action belongs to another app.');}
 save(session,value){this.own(session,'scratchpad');const input=savedSchema.parse(value),s=this.state();
  const fingerprint=createHash('sha256').update(JSON.stringify(input)).digest('hex');
  if(s.operations[input.operationId]){if(s.operations[input.operationId].input!==fingerprint)throw new Error('Operation ID conflict.');return s.saved;}
  if(input.expectedRevision!==s.saved.revision)throw new Error('Saved revision changed. Reload before saving.');
  // Validate PNG signature and IHDR dimensions, not only a user-controlled data URL prefix.
  const bytes=Buffer.from(input.image.split(',')[1],'base64');if(bytes.length<33||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.toString('ascii',12,16)!=='IHDR'||bytes.readUInt32BE(16)!==640||bytes.readUInt32BE(20)!==420)throw new Error('Expected a 640 x 420 PNG export.');
  s.draft=input.draft;s.saved={id:'design-moon',revision:s.saved.revision+1,image:input.image,note:input.draft.note};
  if(Object.keys(s.operations).length>=50)delete s.operations[Object.keys(s.operations)[0]];s.operations[input.operationId]={input:fingerprint};this.write(s);return s.saved;
 }
 allowed(from,to,capability){return this.root.state().grants.some(g=>g.from===from&&g.to===to&&g.capability===capability);}
 grant(session,allowed){this.own(session,'review-board');if(typeof allowed!=='boolean')throw new Error('Boolean grant required.');const s=this.root.state();s.grants=s.grants.filter(g=>!(g.from===session.appId&&g.to==='scratchpad-main'&&g.capability==='design.saved.read'));if(allowed)s.grants.push({from:session.appId,to:'scratchpad-main',capability:'design.saved.read'});this.root.write(s);}
 authorize(session,targetAppId,name,args){const descriptor=studioCapabilities.find(c=>c.name===name),target=this.root.app(targetAppId);if(!descriptor||target.kind!==descriptor.ownerKind||target.workspaceId!==session.workspaceId)throw new Error('Capability owner unavailable.');descriptor.schema.parse(args);if(session.appId!==targetAppId&&!this.allowed(session.appId,targetAppId,descriptor.permission))throw new Error('Allow saved-design read access first.');return descriptor;}
 resource(session,name,args){this.authorize(session,session.appId,name,args);return this.state().saved;}
 publishRead(session,saved){this.own(session,'review-board');const s=this.state();if(saved.revision<s.asset.sourceRevision)throw new Error('Source revision is older.');if(saved.revision>s.asset.sourceRevision){s.asset={...s.asset,image:saved.image,note:saved.note,sourceRevision:saved.revision,revision:s.asset.revision+1};this.write(s);}return s.asset;}
 enable(session,enabled){if(typeof enabled!=='boolean')throw new Error('Boolean enabled required.');const s=this.state();s.enabled[session.appId]=enabled;this.write(s);}
}
