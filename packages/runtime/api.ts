import type { AppKind, WorkspaceInfo } from '../sdk/index';
const base = window.location.hostname === 'tauri.localhost' || window.location.protocol === 'tauri:' ? 'http://127.0.0.1:4318' : '';
let token = '', session = '';
let kind:AppKind='board';
export const apiUrl = (path:string) => `${base}/api/${path}`;
export async function request<T>(path:string,body?:unknown):Promise<T>{
  const response=await fetch(apiUrl(path),{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-Mallea-Token':token,'X-Mallea-Session':session},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const value=await response.json();if(!response.ok)throw new Error(value.error??'Workspace request failed.');return value;
}
export async function bootstrap(appKind:AppKind=kind){
  kind=appKind;token=(await request<{token:string}>('bootstrap')).token;
  const registered=await request<{session:string;workspace:WorkspaceInfo}>('register',{kind});session=registered.session;return registered.workspace;
}
export function connect(onChange:()=>void,onAvailability:(online:boolean)=>void){
  let stopped=false,socket:WebSocket|null=null,timer:ReturnType<typeof setTimeout>|undefined,delay=500;
  async function open(){
    if(stopped)return;
    try{
      const {ticket}=await request<{ticket:string}>('connection',{});
      if(stopped)return;
      const url=new URL(apiUrl('events'),window.location.href);url.protocol=url.protocol==='https:'?'wss:':'ws:';
      socket=new WebSocket(url);
      socket.onopen=()=>socket?.send(JSON.stringify({type:'hello',ticket}));
      socket.onmessage=async event=>{
        let message;try{message=JSON.parse(event.data);}catch{return;}
        if(message.type==='invoke'){
          if(message.capability!=='read_observation'){
            try{const value=await request('studio/owner',{capability:message.capability,arguments:message.arguments});socket?.send(JSON.stringify({type:'result',id:message.id,value}));}catch{socket?.send(JSON.stringify({type:'result',id:message.id,error:true}));}
            return;
          }
          if(message.capability!=='read_observation'||typeof message.arguments?.observationId!=='string')return;
          try{const value=await request(`observation?id=${encodeURIComponent(message.arguments.observationId)}`);socket?.send(JSON.stringify({type:'result',id:message.id,value}));}
          catch{socket?.send(JSON.stringify({type:'result',id:message.id,error:true}));}
        }else if(['connected','presence','changed','tasks','studio'].includes(message.type)){
          if(message.type==='connected'){delay=500;onAvailability(true);}onChange();
        }
      };
      socket.onclose=()=>{onAvailability(false);if(!stopped){timer=setTimeout(async()=>{try{await bootstrap();}catch{/* service may still be restarting */}void open();},delay);delay=Math.min(delay*2,5000);}};
      socket.onerror=()=>socket?.close();
    }catch{onAvailability(false);if(!stopped){timer=setTimeout(async()=>{try{await bootstrap();}catch{/* reconnect later */}void open();},delay);delay=Math.min(delay*2,5000);}}
  }
  void open();return()=>{stopped=true;clearTimeout(timer);socket?.close();};
}
