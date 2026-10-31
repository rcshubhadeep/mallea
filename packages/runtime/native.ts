declare global { interface Window { __TAURI__?: {core:{invoke:<T>(command:string,args?:Record<string,unknown>)=>Promise<T>}} } }
export const nativeInvoke=<T>(command:string,args?:Record<string,unknown>)=>{if(!window.__TAURI__)return Promise.reject(new Error('Open this app through its native Mallea host.'));return window.__TAURI__.core.invoke<T>(command,args);};
