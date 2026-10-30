import{Surface}from'./Surface';import{shapeSurface,shapeContract}from'../../sdk/framework-ui.mjs';
export function ShapeEntry({disabled,onOpen}:{disabled:boolean;onOpen:()=>void}){return <div className="shape-entry"><Surface model={shapeSurface} contract={shapeContract} data={{runtime:{disabled}}} components={{}} invoke={onOpen}/></div>;}
