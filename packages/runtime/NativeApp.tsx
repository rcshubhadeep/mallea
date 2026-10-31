import{useEffect,useState}from'react';import{nativeInvoke}from'./native';import{LiveApp}from'./live/LiveApp';import{Surface}from'./studio/Surface';
export function NativeApp(){
 const [app,setApp]=useState<{adapter:string}|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;void nativeInvoke<{adapter:string;name:string}>('native_context').then(v=>{if(active){document.title=`${v.name} · Powered by Mallea`;setApp(v);}}).catch(e=>{if(active)setError(String(e));});return()=>{active=false;};},[]);
 if(app)return <LiveApp/>;
 return <div className="studio-app"><main><Surface model={{manifest:{id:'core-connection',title:'Core connection',version:'1.0.0',sdkVersion:'0.3',permissions:[]},ui:{id:'message',type:'text',text:error||'Connecting to Mallea Core…'}}} contract={{fields:{},actions:{}}} data={{}} components={{}} invoke={()=>{}}/></main></div>;
}
