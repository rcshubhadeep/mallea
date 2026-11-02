const text=(id,text,appearance)=>({id,type:'text',text,...(appearance?{appearance}:{})}),bound=(id,bind,appearance)=>({id,type:'text',bind,...(appearance?{appearance}:{})}),button=(id,label,action,props={})=>({id,type:'button',label,action,...props});
const surface=(id,title,children)=>({id,title,ownership:'system',ui:{id:id+'-root',type:'stack',children}});
export const systemSurfaces={
 recovery:surface('system-recovery','Mallea controls',[{id:'recovery-row',type:'row',appearance:'toolbar',children:[{id:'app-icon',type:'image',bind:'system.appIcon',label:'App icon',hiddenBind:'system.noIcon'},bound('app-name','system.appName','title'),bound('save-outcome','system.saveStatus','muted'),button('undo-change','Undo last change','shape.undo',{appearance:'ghost',disabledBind:'system.cannotUndo'}),button('open-automations','Sharing & Automations','automations.open',{appearance:'ghost'}),button('open-shape','✧ Shape this app','shape.open',{appearance:'primary'})]}]),
 notice:surface('system-notice','Outcome',[bound('notice-message','system.notice')]),
 builder:surface('system-builder','Shape your app',[
  {id:'builder-header',type:'row',children:[text('builder-title','Shape your app','title'),button('close-builder','Close','shape.close',{appearance:'ghost',disabledBind:'system.running'})]},
  bound('builder-scope','system.scope','eyebrow'),button('widen-scope','Edit the whole app instead','shape.widen',{appearance:'ghost',hiddenBind:'system.notScoped',disabledBind:'system.running'}),{id:'builder-steps',type:'component',component:'shape-steps'},{id:'builder-request',type:'textarea',label:'What would you like to change?',bind:'system.prompt',disabledBind:'system.running'},
  {id:'builder-actions',type:'row',children:[button('build','Build changes','shape.build',{appearance:'primary',disabledBind:'system.running'}),button('cancel','Cancel generation','shape.cancel',{disabledBind:'system.notRunning'})]},
  bound('builder-outcome','system.outcome','muted'),{id:'validation-details',type:'details',label:'Validation details',children:[{id:'validation-attempts',type:'repeat',bind:'system.diagnostics'}]},{id:'changes',type:'repeat',bind:'system.changes'},
  text('preview-heading','Preview · a separate copy; changes here are not saved.','eyebrow'),
  {id:'preview',type:'component',component:'app-preview',hiddenBind:'system.noPreview'},
  {id:'approve',type:'checkbox',label:'Allow these Surface definitions and declared data operations',bind:'system.approved',disabledBind:'system.noPreview'},
  button('install','Install changes','shape.install',{disabledBind:'system.cannotInstall',appearance:'primary'}),
  text('builder-rule','Preview changes before installing. Existing app data stays separate from presentation changes. Undo last change restores the previous definitions.','muted')]),
 context:surface('system-context','Element actions',[
  bound('context-owner','system.owner','eyebrow'),button('modify','Modify this surface','context.modify'),button('automation','Set Automation','context.automation',{disabledBind:'system.automationUnavailable'}),bound('trigger-reason','system.triggerReason','muted'),
  button('export-text','Export text…','context.text'),button('export-json','Export JSON…','context.json'),button('export-image','Export saved image…','context.image',{disabledBind:'system.noImage'}),button('dismiss','Close','context.close',{appearance:'ghost'})])
};
