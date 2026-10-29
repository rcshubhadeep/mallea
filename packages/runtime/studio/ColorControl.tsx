import { useEffect,useState } from 'react';
export function ColorControl({value,label,onChange,onCommit}:{value:string;label:string;onChange:(value:string)=>void;onCommit?:()=>void}){
 const [hex,setHex]=useState(value);useEffect(()=>setHex(value),[value]);
 return <span className="color-control"><input type="color" aria-label={`${label} picker`} value={value} onInput={e=>onChange(e.currentTarget.value)} onChange={e=>onChange(e.currentTarget.value)} onBlur={onCommit}/><input type="text" aria-label={`${label} hex`} value={hex} maxLength={7} spellCheck={false} onChange={e=>{const v=e.target.value;setHex(v);if(/^#[\da-f]{6}$/i.test(v))onChange(v);}} onBlur={()=>{setHex(value);onCommit?.();}}/></span>;
}
