const text=(id,text)=>({id,type:'text',text}),bound=(id,bind)=>({id,type:'text',bind}),button=(id,label,action,props={})=>({id,type:'button',label,action,...props});
const surface=(id,title,children)=>({id,title,ownership:'system',ui:{id:id+'-root',type:'stack',children}});
export const systemSurfaces={
 recovery:surface('system-recovery','Mallea controls',[{id:'recovery-row',type:'row',children:[bound('save-outcome','system.saveStatus'),button('open-shape','✧ Shape this app','shape.open')]}]),
 notice:surface('system-notice','Outcome',[bound('notice-message','system.notice')]),
 builder:surface('system-builder','Shape your app',[
  {id:'builder-header',type:'row',children:[{...text('builder-title','Shape your app'),style:{fontSize:26,fontWeight:'bold'}},button('close-builder','Close','shape.close',{disabledBind:'system.running'})]},
  bound('builder-scope','system.scope'),{id:'builder-request',type:'textarea',label:'What would you like to change?',bind:'system.prompt',disabledBind:'system.running'},
  {id:'builder-actions',type:'row',children:[button('build','Build changes','shape.build',{disabledBind:'system.running'}),button('cancel','Cancel generation','shape.cancel',{disabledBind:'system.notRunning'})]},
  bound('builder-outcome','system.outcome'),{id:'changes',type:'repeat',bind:'system.changes'},
  text('preview-heading','Preview — a separate copy; changes here are not saved.'),
  {id:'preview',type:'component',component:'app-preview',hiddenBind:'system.noPreview'},
  {id:'approve',type:'checkbox',label:'Allow these Surface definitions and declared data operations',bind:'system.approved',disabledBind:'system.noPreview'},
  button('install','Install changes','shape.install',{disabledBind:'system.cannotInstall',appearance:'primary'}),
  text('builder-rule','Preview changes before installing. Existing app data stays separate from presentation changes.')]),
 context:surface('system-context','Element actions',[
  bound('context-owner','system.owner'),button('modify','Modify this surface','context.modify'),button('automation','Set Automation','context.automation',{disabledBind:'system.automationUnavailable'}),bound('trigger-reason','system.triggerReason'),
  button('export-text','Export text…','context.text'),button('export-json','Export JSON…','context.json'),button('export-image','Export saved image…','context.image',{disabledBind:'system.noImage'}),button('dismiss','Close','context.close')])
};
