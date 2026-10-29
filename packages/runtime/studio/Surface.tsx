import type { ReactNode } from 'react';
import { readBinding,dispatchSurfaceAction,localKey,validateLocalValues } from '../../sdk/surface.mjs';
import { ColorControl } from './ColorControl';
export type ViewNode={id:string;type:string;label?:string;text?:string;bind?:string;action?:string;argument?:string;component?:string;style?:{color?:string;background?:string;gap?:number;padding?:number};children?:ViewNode[]};
export type SurfaceDefinition={manifest:{id:string;title:string;version:string;sdkVersion:string;permissions:string[]};state?:Record<string,{type:'text'|'color';initial:string}>;ui:ViewNode};
export type SurfaceContract={fields:Record<string,string>;actions:Record<string,{argument?:string;binding?:string}>};
export function Surface({model,contract,data,components,invoke,onLocalChange,onLocalCommit}:{model:SurfaceDefinition;contract:SurfaceContract;data:unknown;components:Record<string,ReactNode>;invoke:(action:string,args:Record<string,string>)=>void;onLocalChange?:(key:string,value:string)=>void;onLocalCommit?:()=>void}){
 const fire=(name:string,args:Record<string,string>)=>dispatchSurfaceAction(contract,model.manifest.permissions,name,args,invoke);
 function render(n:ViewNode):ReactNode{
  const value=n.bind?readBinding(data,n.bind):undefined;
  if(n.type==='component')return <div key={n.id} className="trusted-component" style={n.style}>{components[n.component!]}</div>;
  const style={...n.style};
  if(['stack','split','grid'].includes(n.type))return <section key={n.id} className={`surface-${n.type}`} style={style} aria-label={n.label}>{n.label&&<h3>{n.label}</h3>}{n.children?.map(render)}</section>;
  if(n.type==='text')return <p key={n.id} style={style}>{n.label&&<strong>{n.label} </strong>}{n.bind?String(value??''):n.text}</p>;
  if(n.type==='image')return <img key={n.id} className="surface-image" src={typeof value==='string'&&/^data:image\/(png|svg\+xml);base64,/.test(value)?value:undefined} alt={n.label??'App image'} style={style}/>;
  if(n.type==='repeat')return <ul key={n.id} style={style}>{Array.isArray(value)&&value.map((v,i)=><li key={i}>{typeof v==='string'?v:JSON.stringify(v)}</li>)}</ul>;
  if(n.type==='button')return <button key={n.id} style={style} onClick={()=>fire(n.action!,{})}>{n.label??n.text??'Run'}</button>;
  const key=localKey(n.bind);
  const props={id:n.id,value:String(value??''),onChange:(e:{target:{value:string}})=>{
   if(key){const local=readBinding(data,'local')??{};validateLocalValues(model,{...local,[key]:e.target.value});onLocalChange?.(key,e.target.value);}
   else fire(n.action!,{[n.argument!]:e.target.value});
  },onBlur:key?onLocalCommit:undefined};
  return <label key={n.id} className={`surface-field field-${n.type}`} style={style}>{n.label??n.id}{n.type==='color'?<ColorControl value={props.value} label={n.label??n.id} onChange={v=>props.onChange({target:{value:v}})} onCommit={key?onLocalCommit:undefined}/>:n.type==='textarea'?<textarea {...props} rows={3} maxLength={2000}/>:<input {...props} type="text" maxLength={key?2000:140}/>}</label>;
 }
 return <div className="live-surface">{render(model.ui)}</div>;
}
