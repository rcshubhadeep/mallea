import type { ReactNode,CSSProperties } from 'react';
import { readBinding,dispatchSurfaceAction,localKey,validateLocalValues } from '../../sdk/surface.mjs';
import { ColorControl } from './ColorControl';
export type ViewNode={id:string;type:string;label?:string;text?:string;bind?:string;action?:string;argument?:string;value?:string;args?:Record<string,unknown>;disabledBind?:string;hiddenBind?:string;template?:ViewNode;appearance?:string;options?:{label:string;value:string}[];component?:string;style?:CSSProperties;children?:ViewNode[]};
export type SurfaceDefinition={manifest:{id:string;title:string;version:string;sdkVersion:string;permissions:string[]};state?:Record<string,{type:'text'|'color';initial:string}>;ui:ViewNode};
export type SurfaceContract={live?:boolean;primitives?:Record<string,any>;fields:Record<string,string>;actions:Record<string,{argument?:string;binding?:string;values?:string[]}>};
export type LiveEvent=(node:ViewNode,event:'change'|'click',value?:unknown,itemIndex?:number)=>void;
export function Surface({model,contract,data,components,invoke,onLocalChange,onLocalCommit,onElementEvent}:{model:SurfaceDefinition;contract:SurfaceContract;data:unknown;components:Record<string,ReactNode>;invoke:(action:string,args:Record<string,string>)=>void;onLocalChange?:(key:string,value:string)=>void;onLocalCommit?:()=>void;onElementEvent?:LiveEvent}){
 if(contract.live)return <LiveSurface node={model.ui} data={data} components={components} onEvent={onElementEvent??(()=>{})}/>;
 const fire=(name:string,args:Record<string,string>)=>dispatchSurfaceAction(contract,model.manifest.permissions,name,args,invoke);
 function render(n:ViewNode):ReactNode{
  const value=n.bind?readBinding(data,n.bind):undefined;
  if(n.type==='component')return <div key={n.id} className="trusted-component" style={n.style}>{components[n.component!]}</div>;
  const style={...n.style},appearance=n.appearance?` appearance-${n.appearance}`:'';
  if(n.type==='details')return <details key={n.id} className={`surface-details${appearance}`} style={style}><summary>{n.label??'More options'}</summary>{n.children?.map(render)}</details>;
  if(['stack','split','grid','row'].includes(n.type))return <section key={n.id} className={`surface-${n.type}${appearance}`} style={style} aria-label={n.label}>{n.label&&<h3>{n.label}</h3>}{n.children?.map(render)}</section>;
  if(n.type==='text')return <p key={n.id} className={appearance.trim()} style={style}>{n.label&&<strong>{n.label} </strong>}{n.bind?String(value??''):n.text}</p>;
  if(n.type==='image')return <img key={n.id} className="surface-image" src={typeof value==='string'&&/^data:image\/(png|svg\+xml);base64,/.test(value)?value:undefined} alt={n.label??'App image'} style={style}/>;
  if(n.type==='repeat')return <ul key={n.id} className={`surface-repeat${appearance}`} style={style}>{Array.isArray(value)&&value.map((v,i)=><li key={i}>{typeof v==='string'?v:JSON.stringify(v)}</li>)}</ul>;
  if(n.type==='button')return <button key={n.id} className={appearance.trim()} style={style} disabled={!!readBinding(data,n.disabledBind)||!!readBinding(data,'runtime.busy')} onClick={()=>fire(n.action!,n.argument?{[n.argument]:n.value!}:{})}>{n.label??n.text??'Run'}</button>;
  const key=localKey(n.bind);
  const typography=Object.fromEntries(Object.entries(style).filter(([k])=>['fontWeight','fontSize','fontStyle','textAlign','textDecoration','lineHeight'].includes(k))) as CSSProperties;
  const props={id:n.id,style:typography,value:String(value??''),onChange:(e:{target:{value:string}})=>{
   if(key){const local=readBinding(data,'local')??{};validateLocalValues(model,{...local,[key]:e.target.value});onLocalChange?.(key,e.target.value);}
   else fire(n.action!,{[n.argument!]:e.target.value});
  },onBlur:key?onLocalCommit:undefined};
  return <label key={n.id} className={`surface-field field-${n.type}`} style={style}>{n.label??n.id}{n.type==='choice'?<select {...props}>{!n.options?.some(o=>o.value===props.value)&&<option value={props.value}>Current: {props.value}</option>}{n.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:n.type==='color'?<ColorControl value={props.value} label={n.label??n.id} onChange={v=>props.onChange({target:{value:v}})} onCommit={key?onLocalCommit:undefined}/>:n.type==='textarea'?<textarea {...props} rows={3} maxLength={2000}/>:<input {...props} type="text" maxLength={key?2000:140}/>}</label>;
 }
 return <div className="live-surface">{render(model.ui)}</div>;
}
function LiveSurface({node,data,components,onEvent}:{node:ViewNode;data:any;components:Record<string,ReactNode>;onEvent:LiveEvent}){
 function render(n:ViewNode,item?:any,itemIndex?:number):ReactNode{const snapshot={...data,item:item&&typeof item==='object'?{...item,index:itemIndex}:{value:item,index:itemIndex}},value=n.bind?readBinding(snapshot,n.bind):undefined;if(n.hiddenBind&&readBinding(snapshot,n.hiddenBind))return null;const cls=(n.appearance?' appearance-'+n.appearance:''),style=n.style;let el:ReactNode;
  if(['stack','row','split','grid'].includes(n.type))el=<section className={'surface-'+n.type+cls} style={style} aria-label={n.label}>{n.label&&<h3>{n.label}</h3>}{n.children?.map(c=>render(c,item,itemIndex))}</section>;
  else if(n.type==='details')el=<details className={cls} style={style}><summary>{n.label??'More'}</summary>{n.children?.map(c=>render(c,item,itemIndex))}</details>;
  else if(n.type==='text')el=<p className={cls} style={style}>{n.label&&<strong>{n.label} </strong>}{n.bind?String(value??''):n.text}</p>;
  else if(n.type==='image')el=<img className={'surface-image'+cls} style={style} alt={n.label??'Image'} src={typeof value==='string'&&/^data:image\/(png|svg\+xml);base64,/.test(value)?value:undefined}/>;
  else if(n.type==='component')el=<div className="trusted-component" style={style}>{components[n.component!]}</div>;
  else if(n.type==='repeat')el=<ul className={'surface-repeat'+cls} style={style}>{Array.isArray(value)&&value.map((v,i)=><li key={i} data-item-index={i}>{n.template?render(n.template,v,i):typeof v==='string'?v:JSON.stringify(v)}</li>)}</ul>;
  else if(n.type==='button')el=<button className={cls} style={style} disabled={!!readBinding(snapshot,n.disabledBind)} onClick={()=>onEvent(n,'click',undefined,itemIndex)}>{n.label??n.text??'Run'}</button>;
  else{const props={id:n.id,style:Object.fromEntries(Object.entries(style??{}).filter(([key])=>['fontWeight','fontSize','fontStyle','textAlign','textDecoration','lineHeight','color'].includes(key))),value:String(value??''),disabled:!!readBinding(snapshot,n.disabledBind),onChange:(e:{target:{value:string}})=>onEvent(n,'change',n.type==='number'?Number(e.target.value):e.target.value,itemIndex)};el=<label className={'surface-field field-'+n.type+cls} style={style}>{n.label??n.id}{n.type==='checkbox'?<input id={n.id} type="checkbox" checked={!!value} disabled={props.disabled} onChange={e=>onEvent(n,'change',e.target.checked,itemIndex)}/>:n.type==='choice'?<select {...props}>{n.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:n.type==='color'?<ColorControl value={props.value} label={n.label??n.id} onChange={v=>onEvent(n,'change',v,itemIndex)}/>:n.type==='textarea'?<textarea {...props} rows={3} maxLength={2000}/>:<input {...props} type={n.type==='date'?'date':n.type==='number'?'number':'text'} maxLength={2000}/>}</label>;}
  return <div key={n.id} data-element-id={n.id} style={{display:'contents'}}>{el}</div>;
 }return <div className="live-surface">{render(node)}</div>;
}
