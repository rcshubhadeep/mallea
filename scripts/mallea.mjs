import {spawn} from 'node:child_process';
import {access,stat,realpath} from 'node:fs/promises';
import {createServer} from 'node:net';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {launchNative,projectEnvironment} from './lib/native-launch.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
export const help=`Mallea source build and launch

  node scripts/mallea.mjs                 Build, start Core and open the dashboard
  node scripts/mallea.mjs run             Open the current build without rebuilding
  node scripts/mallea.mjs build           Build only (no installer)
  node scripts/mallea.mjs clean           Cargo clean for this checkout's native build
  node scripts/mallea.mjs [start|run] --dev         Enable developer exports
  node scripts/mallea.mjs [start|run] --production  Select the configured production profile

Requires Node 24, installed npm dependencies, Rust and Tauri platform prerequisites.
Run npm ci first (Windows: npm.cmd ci --script-shell=cmd.exe).
An optional repository .env is loaded into Core only; keys are never printed.
Close Mallea windows and stop existing Core before building or launching.
Keep this terminal open. Ctrl+C stops the Core started by this command.
`;

export function parseSourceArgs(args){
 if(args.length===1&&['--help','-h'].includes(args[0]))return{command:'help'};
 const rest=[...args],command=rest[0]&&!rest[0].startsWith('-')?rest.shift():'start';
 if(!['start','run','build','clean'].includes(command)||new Set(rest).size!==rest.length||rest.some(v=>!['--dev','--production'].includes(v))||(['build','clean'].includes(command)&&rest.length))throw new Error('Use start, run, build or clean. Run with --help for options.');
 return{command,devMode:rest.includes('--dev'),production:rest.includes('--production')};
}

export async function requireFreePort(port=4318){
 const probe=createServer();
 await new Promise((done,fail)=>{probe.once('error',error=>fail(error.code==='EADDRINUSE'?new Error('Core port 4318 is in use. Close Mallea apps and stop the running source or installed Core, then retry.'):error));probe.listen(port,'127.0.0.1',()=>probe.close(done));});
}

async function requireFile(path,message){try{const info=await stat(path);if(!info.isFile())throw new Error();}catch{throw new Error(message);}}
export function buildSteps(base=root){
 return[
  {label:'Checking TypeScript',args:[join(base,'node_modules/typescript/bin/tsc'),'--noEmit'],cwd:base},
  {label:'Building the web frontend',args:[join(base,'node_modules/vite/bin/vite.js'),'build','--config','apps/web/vite.config.ts'],cwd:base},
  {label:'Building the desktop interface',args:[join(base,'node_modules/vite/bin/vite.js'),'build','--config','apps/desktop/vite.config.ts'],cwd:base},
  {label:'Building the native desktop host',args:[join(base,'node_modules/@tauri-apps/cli/tauri.js'),'build','--no-bundle'],cwd:join(base,'apps/desktop')}
 ];
}

export async function buildSource({base=root,runStep=runBuildStep}={}){
 for(const step of buildSteps(base))await requireFile(step.args[0],'Dependencies are missing. Run npm ci first (Windows: npm.cmd ci --script-shell=cmd.exe).');
 if(process.env.CARGO_BUILD_TARGET)throw new Error('Unset CARGO_BUILD_TARGET for this local build. Use the desktop build command for cross-compilation.');
 for(const step of buildSteps(base)){console.log(step.label+'…');await runStep(step);}
}
export async function cleanSource({base=root,runStep=runBuildStep}={}){
 const manifest=join(base,'apps/desktop/src-tauri/Cargo.toml'),target=resolve(base,'apps/desktop/src-tauri/target');
 await requireFile(manifest,'Native project manifest is missing. Run this command from a Mallea checkout.');
 const canonicalRoot=await realpath(base),expected=join(canonicalRoot,'apps/desktop/src-tauri/target');
 const same=(a,b)=>process.platform==='win32'?a.toLowerCase()===b.toLowerCase():a===b;
 // cargo clean removes build artifacts recursively. Refuse redirected parent/target
 // paths so a junction cannot redirect cleanup into user data or another checkout.
 if(!same(await realpath(dirname(target)),dirname(expected)))throw new Error('Refusing to clean a redirected native build directory.');
 let actual;try{actual=await realpath(target);}catch(error){if(error.code!=='ENOENT')throw error;actual=target;}
 if(!same(actual,expected))throw new Error('Refusing to clean a redirected native build directory.');
 console.log('Cleaning native build artifacts (saved apps, .env and Core data are retained)…');
 await runStep({label:'Cleaning the native build',command:'cargo',args:['clean','--manifest-path',manifest,'--target-dir',target],cwd:base});
}
function runBuildStep(step){
 return new Promise((done,fail)=>{
  const child=spawn(step.command??process.execPath,step.args,{cwd:step.cwd,stdio:'inherit',windowsHide:true,env:{...projectEnvironment(),CARGO_TARGET_DIR:join(root,'apps/desktop/src-tauri/target')}});
  child.once('error',()=>fail(new Error('Could not start a build step. Check Node, Cargo and the platform prerequisites.')));
  child.once('exit',(code,signal)=>code===0?done():fail(new Error(step.label+' failed'+(signal?' ('+signal+')':'')+'. Launch skipped; close Mallea windows before rebuilding.')));
 });
}

export async function startSource({home=join(root,'.mallea'),database,binary,production=false,devMode=false,port=4318,launch=launchNative}={}){
 await requireFile(binary,'Native build missing. Run node scripts/mallea.mjs build first.');
 const {startEngine}=await import('./engine.mjs');
 const server=await startEngine({home,database:database??join(home,'workspace.sqlite'),production,devMode,port});
 let stopped=false;
 const stop=async()=>{if(stopped)return;stopped=true;server.workspaceRegistry.close();server.closeAllConnections();await new Promise(done=>server.close(done));};
 try{await launch(binary,join(home,'hosts/mallea-core.json'));return{server,stop};}catch{await stop();throw new Error('The dashboard could not open. The Core started by this command has been stopped.');}
}

export async function main(args=process.argv.slice(2)){
 const options=parseSourceArgs(args);
 if(options.command==='help'){console.log(help);return;}
 if(Number(process.versions.node.split('.')[0])!==24)throw new Error('Mallea requires Node 24. Check node --version.');
 // A probe does not authenticate with, modify or stop an existing Core.
 await requireFreePort();
 if(options.command==='clean'){await cleanSource();console.log('Native clean complete. The next build will take longer.');return;}
 if(options.command!=='run')await buildSource();
 if(options.command==='build'){console.log('Build complete. Open it with node scripts/mallea.mjs run.');return;}
 const envFile=join(root,'.env');
 try{await access(envFile);process.loadEnvFile(envFile);}catch(error){if(error.code!=='ENOENT')throw new Error('Could not load the repository .env. Check its permissions and format.');}
 const home=resolve(root,process.env.MALLEA_HOME??'.mallea'),database=resolve(root,process.env.MALLEA_DB??join(home,'workspace.sqlite'));
 const binary=join(root,'apps/desktop/src-tauri/target/release',process.platform==='win32'?'mallea-desktop.exe':'mallea-desktop');
 // Cwd also governs relative configuration in the existing source runtime.
 process.chdir(root);
 let session;
 try{session=await startSource({home,database,binary,...options});}
 catch(error){if(error.code==='EADDRINUSE')throw new Error('Core started elsewhere while building. Stop it and retry; its connection files were retained.');throw error;}
 const quit=()=>{console.log('\nStopping this source Core…');void session.stop().catch(()=>{console.error('Core shutdown failed. Close the Mallea windows and check its terminal.');process.exitCode=1;});};
 process.once('SIGINT',quit);process.once('SIGTERM',quit);
 session.server.once('close',()=>{process.removeListener('SIGINT',quit);process.removeListener('SIGTERM',quit);});
 console.log('Mallea dashboard opened. Keep this terminal open; close app windows and press Ctrl+C to stop Core.');
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
