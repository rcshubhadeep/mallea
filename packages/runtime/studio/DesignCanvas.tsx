import { useEffect,useRef } from 'react';
import { Canvas,FabricImage,IText } from 'fabric';
import background from '../assets/moon-poster.svg';
export type Draft={text:string;color:string;note:string;x:number;y:number};
export type CanvasHandle={exportPng:()=>string};
export function DesignCanvas({draft,onChange,onReady}:{draft:Draft;onChange:(value:Draft)=>void;onReady:(handle:CanvasHandle|null)=>void}){
 const element=useRef<HTMLCanvasElement>(null),canvas=useRef<Canvas|null>(null),text=useRef<IText|null>(null),latest=useRef(draft),change=useRef(onChange),ready=useRef(onReady);
 latest.current=draft;change.current=onChange;ready.current=onReady;
 useEffect(()=>{let disposed=false;const c=new Canvas(element.current!,{width:640,height:420,selection:false});canvas.current=c;
  void FabricImage.fromURL(background).then(image=>{if(disposed)return;image.set({originX:'left',originY:'top',left:0,top:0,selectable:false,evented:false});c.add(image);const d=latest.current,t=new IText(d.text,{originX:'left',originY:'top',left:d.x,top:d.y,fill:d.color,fontFamily:'sans-serif',fontWeight:600,fontSize:42,lockScalingX:true,lockScalingY:true,lockRotation:true,hasControls:false});text.current=t;c.add(t);c.renderAll();
   c.on('text:changed',()=>{const value=(t.text||' ').slice(0,140);if(t.text!==value)t.set('text',value);change.current({...latest.current,text:value});});
   c.on('object:modified',()=>{t.set({left:Math.max(0,Math.min(600,t.left)),top:Math.max(0,Math.min(360,t.top))});change.current({...latest.current,x:t.left,y:t.top});});
   ready.current({exportPng:()=>{t.exitEditing();c.discardActiveObject();c.renderAll();return c.toDataURL({format:'png',multiplier:1});}});
  }).catch(()=>ready.current(null));
  return()=>{disposed=true;ready.current(null);text.current=null;canvas.current=null;void c.dispose();};
 },[]);
 useEffect(()=>{if(text.current){text.current.set({text:draft.text,fill:draft.color,left:draft.x,top:draft.y});canvas.current?.requestRenderAll();}},[draft]);
 return <div className="design-canvas" aria-label="Design canvas"><canvas ref={element}/><small>Double-click the title to edit it. Drag to reposition.</small></div>;
}
