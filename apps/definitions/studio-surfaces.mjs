import { z } from 'zod';
import { surfacePrompt,validateSurface,withSurfaceState } from '../../packages/sdk/surface.mjs';
export const draftSchema=z.object({text:z.string().min(1).max(140),color:z.string().regex(/^#[\da-f]{6}$/i),note:z.string().max(2000),x:z.number().min(0).max(640),y:z.number().min(0).max(420)}).strict();
const runtimeFields={'runtime.busy':'boolean','runtime.cannotSave':'boolean','runtime.cannotRead':'boolean','runtime.connection':'text','runtime.saveState':'text','runtime.designAccess':'text','runtime.feedbackAccess':'text'};
export const reviewStatuses=['In review','Changes requested','Approved'];
export const scratchContract={readPermission:'design.read',permissions:['design.read','annotation.color','annotation.text','design.note','annotation.align','document.save','feedback.access','feedback.refresh'],fields:{...runtimeFields,'draft.text':'text','draft.color':'color','draft.note':'text','draft.alignment':'text','saved.note':'text','saved.image':'image','saved.revision':'number','saved.history':'list','feedback.items':'list','feedback.status':'text'},components:['design-canvas'],requiredComponents:['design-canvas'],actions:{'annotation.color':{argument:'color',binding:'draft.color',label:'Change annotation color'},'annotation.text':{argument:'text',binding:'draft.text',label:'Edit annotation text'},'design.note':{argument:'note',binding:'draft.note',label:'Edit accompanying note'},'annotation.align':{argument:'alignment',binding:'draft.alignment',values:['Left','Center','Right']},'document.save':{},'feedback.access':{},'feedback.refresh':{}}};
export const reviewContract={readPermission:'asset.read',permissions:['asset.read','asset.access','asset.refresh','review.status','review.draft','review.comment'],fields:{...runtimeFields,'asset.image':'image','asset.note':'text','asset.revision':'number','asset.sourceRevision':'number','asset.title':'text','review.status':'text','review.items':'list','reviewDraft.text':'text'},components:[],actions:{'asset.access':{},'asset.refresh':{},'review.status':{argument:'status',binding:'review.status',values:reviewStatuses},'review.draft':{argument:'text',binding:'reviewDraft.text'},'review.comment':{}}};
// Helpers produce ordinary Surface data; built-ins have no alternate rendering path.
scratchContract.primitives={'design-canvas':{singleInstance:true,properties:{dataModel:'draft',width:640,height:420},events:{
 'text.changed':{label:'When I edit canvas text',fields:{text:{type:'text',initial:'',minLength:1,maxLength:140}}},
 'position.changed':{label:'When I move canvas text',fields:{x:{type:'number',initial:0,minimum:0,maximum:640},y:{type:'number',initial:0,minimum:0,maximum:420}}}
},actions:['document.save']}};
const text=(id,value,appearance)=>({id,type:'text',text:value,...(appearance?{appearance}:{})});
const bound=(id,bind,label,appearance)=>({id,type:'text',bind,...(label?{label}:{}),...(appearance?{appearance}:{})});
const button=(id,label,action,extra={})=>({id,type:'button',label,action,...extra});
const stack=(id,children,extra={})=>({id,type:'stack',children,...extra});
const field=(id,label,bind,action,argument,type='input')=>({id,type,label,bind,action,argument});
const model=(id,title,contract,ui)=>({manifest:{id,title,version:'1.0.0',sdkVersion:'0.3',permissions:[...contract.permissions]},ui});
export const initialWorkspace=model('scratch-workspace','Fieldnote studio',scratchContract,{
 id:'workspace',type:'grid',appearance:'workspace',children:[
  stack('project-sidebar',[
   text('project-eyebrow','PERSONAL STUDIO','eyebrow'),text('project-title','Moonlight','title'),text('project-type','Launch artwork · Concept 01','muted'),
   stack('project-brief',[text('brief-title','Working brief','eyebrow'),text('brief-copy','A warmer, more curious direction for the autumn launch. Refine the headline and palette, then save a version for review.')],{appearance:'card'}),
   text('version-title','SAVED VERSIONS','eyebrow'),{id:'versions',type:'repeat',bind:'saved.history'},text('project-format','640 × 420 px · PNG export','muted'),
  ],{appearance:'sidebar'}),
  stack('design-stage',[
   {id:'document-tools',type:'row',appearance:'toolbar',children:[text('document-name','MOONLIGHT / CONCEPT 01','eyebrow'),bound('save-state','runtime.saveState',undefined,'badge'),button('save-design','Save revision','document.save',{appearance:'primary',disabledBind:'runtime.cannotSave'})]},
   {id:'canvas',type:'component',component:'design-canvas'},
   stack('revision-card',[text('revision-heading','Revision note','eyebrow'),field('note','What changed in this version?','draft.note','design.note','note','textarea')],{appearance:'card'}),
  ]),
  stack('design-inspector',[
   text('inspector-heading','Inspector','title'),text('inspector-description','Selected: headline annotation','muted'),
   stack('type-controls',[field('annotation','Headline','draft.text','annotation.text','text'),{...field('alignment','Horizontal position','draft.alignment','annotation.align','alignment','choice'),options:['Left','Center','Right'].map(value=>({label:value,value}))}],{appearance:'card'}),
   {id:'appearance-controls',type:'details',label:'Appearance',appearance:'card',children:[field('annotation-color','Headline color','draft.color','annotation.color','color','color')]},
   stack('feedback-card',[text('feedback-title','Review from Parcel','eyebrow'),bound('feedback-access','runtime.feedbackAccess',undefined,'muted'),button('feedback-access-button','Change feedback access','feedback.access'),button('feedback-refresh-button','Check review feedback','feedback.refresh',{disabledBind:'runtime.cannotRead'}),bound('review-status','feedback.status',undefined,'badge'),{id:'review-feedback',type:'repeat',bind:'feedback.items'}],{appearance:'card'}),
  ],{appearance:'sidebar'}),
 ]});
export const reviewWorkspace=model('review-workspace','Parcel review desk',reviewContract,{
 id:'asset-detail',type:'grid',appearance:'workspace',children:[
  stack('collection-sidebar',[
   text('collection-eyebrow','AUTUMN CAMPAIGN','eyebrow'),text('collection-heading','Assets','title'),
   stack('selected-asset',[text('asset-category','01 / LAUNCH ARTWORK','eyebrow'),bound('asset-name','asset.title'),bound('asset-status','review.status',undefined,'badge')],{appearance:'card'}),
   text('connection-heading','LINKED SOURCE','eyebrow'),text('source-name','Fieldnote · Moonlight'),bound('source-connection','runtime.connection',undefined,'muted'),bound('source-access','runtime.designAccess',undefined,'muted'),button('design-access','Change saved-design access','asset.access'),button('refresh-design','Refresh saved design','asset.refresh',{disabledBind:'runtime.cannotRead'}),text('source-hint','Only saved versions are shared. Draft edits stay in Fieldnote.','muted'),
  ],{appearance:'sidebar'}),
  stack('asset-stage',[
   {id:'asset-toolbar',type:'row',appearance:'toolbar',children:[bound('asset-title','asset.title',undefined,'title'),bound('source-revision','asset.sourceRevision','SOURCE REVISION','badge')]},
   {id:'image',type:'image',label:'Published artwork',bind:'asset.image'},
   stack('revision-details',[text('revision-label','DESIGNER’S NOTE','eyebrow'),bound('note','asset.note'),bound('publication-revision','asset.revision','Published version')],{appearance:'card'}),
  ]),
  stack('review-inspector',[
   text('review-title','Review desk','title'),text('review-description','Keep decisions beside the work.','muted'),
   {...field('review-status','Review status','review.status','review.status','status','choice'),options:reviewStatuses.map(value=>({label:value,value}))},
   stack('comment-composer',[field('review-comment','Add feedback','reviewDraft.text','review.draft','text','textarea'),button('post-feedback','Post feedback','review.comment',{appearance:'primary'})],{appearance:'card'}),
   text('discussion-title','DISCUSSION','eyebrow'),{id:'feedback-list',type:'repeat',bind:'review.items'},
  ],{appearance:'sidebar'}),
 ]});
const definition=(kind,title,purpose,contract,initialSurface)=>({kind,title,purpose,provides:[],slots:['workspace'],resources:[contract.readPermission],actions:Object.keys(contract.actions),contract:withSurfaceState(contract),contractPrompt:surfacePrompt,packageId:initialSurface.manifest.id,initialSurface,validate:a=>validateSurface(a,contract),verify:async a=>validateSurface(a,contract),initialRequest:'Add a separate local notes panel above the main content. Keep the existing app sections and working controls.'});
export const studioDefinitions={scratchpad:definition('scratchpad','Fieldnote · Visual scratchpad','Annotate a design, save revisions and read permitted review feedback.',scratchContract,initialWorkspace),'review-board':definition('review-board','Parcel · Asset review','Review saved artwork, change review status and write feedback.',reviewContract,reviewWorkspace)};
for(const item of Object.values(studioDefinitions))validateSurface(item.initialSurface,item.contract);
export const studioCapabilities=[{name:'read_saved_design',ownerKind:'scratchpad',permission:'design.saved.read',description:'Read a saved design PNG, note and revision. Draft edits are never returned.',schema:z.object({designId:z.literal('design-moon')}).strict()},{name:'read_asset_feedback',ownerKind:'review-board',permission:'asset.feedback.read',description:'Read review status and feedback for the linked asset; returns data, not UI.',schema:z.object({assetId:z.literal('asset-moon')}).strict()}];
