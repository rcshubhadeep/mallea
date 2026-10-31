import{catalogue}from'./catalogue.mjs';import{dashboardPanels}from'../../packages/sdk/dashboard.mjs';import{ProjectCreator}from'./project-creator.mjs';
import{AppLauncher}from'./app-launcher.mjs';
export class Dashboard{
 constructor({engine,live,registry,models,home}){Object.assign(this,{engine,live,registry,models});this.launcher=new AppLauncher({engine,registry,home});this.creator=new ProjectCreator({engine,home,notify:()=>registry.broadcast('local-demo',{type:'live'})});this.panels=dashboardPanels(models.public().profiles);for(const panel of Object.values(this.panels))live.db.prepare('INSERT INTO live_system_surfaces VALUES(?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').run(panel.id,JSON.stringify(panel));}
 data(selected){const apps=this.engine.list(this.registry),chosen=selected?apps.find(a=>a.id===selected):null,settings=this.models.public();return{apps:apps.map(a=>({id:a.id,name:a.name,author:'By '+a.author,purpose:a.purpose,presence:a.online?'Running · '+a.instances.length+' window(s)':'Not connected',counts:a.surfaces.filter(s=>s.ownership==='app').length+' app Surfaces · '+a.sharing.length+' declared shared capabilities'})),summary:apps.filter(a=>a.online).length+' running · '+apps.length+' registered',detail:chosen?`${chosen.name} · ${chosen.author}\n${chosen.purpose}\nApp ID: ${chosen.id}\nMCP: ${chosen.mcp.path}\nDeclared sharing: ${chosen.sharing.join(', ')||'No cross-app capabilities declared'}`:'',inventory:chosen?chosen.surfaces.map(s=>({title:s.title,ownership:s.ownership+' · '+s.lifetime,details:`${s.elements.length} elements · models: ${s.models.map(m=>m.id).join(', ')||'none'}`})):[],noDetail:!chosen,model:settings.model,ready:settings.ready?'Ready · shared by every app':'Not configured · set model environment and restart Core',catalogue};}
 state(selected){return{data:this.data(selected),settings:this.models.public(),panels:dashboardPanels(this.models.public().profiles),project:this.creator.public()};}
 async action(input){if(!input||Object.keys(input).some(k=>!['action','args'].includes(k)))throw new Error('Invalid Core action.');const a=input.args??{};
  if(input.action==='state'){if(Object.keys(a).some(k=>k!=='selected'))throw new Error('Invalid detail request.');return this.state(a.selected);}
  if(input.action==='settings'){this.models.configure(a);this.registry.broadcast('local-demo',{type:'live'});return this.state();}
  if(input.action==='project')return this.creator.start(a);
  if(input.action==='launch')return this.launcher.launch(a);
  throw new Error('Unknown Core operation.');
 }
 close(){this.creator.close();}
}
