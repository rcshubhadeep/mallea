import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { packageRuntime } from './package-runtime.mjs';

if (!['win32', 'darwin'].includes(process.platform)) throw new Error('Installer delivery targets Windows, then macOS.');
const root = fileURLToPath(new URL('../', import.meta.url));
function run(binary, args, cwd = root) {
  return new Promise((done, fail) => {
    const child = spawn(binary, args, {cwd, stdio: 'inherit', windowsHide: true});
    child.once('error', fail);
    child.once('exit', code => code === 0 ? done() : fail(new Error('Installer build failed.')));
  });
}
// No development model environment is loaded or copied by this command.
const npmCli = process.env.npm_execpath;
if (!npmCli || !existsSync(npmCli)) throw new Error('Run through npm run installer.');
await run(process.execPath, [npmCli, ...(process.platform === 'win32' ? ['--script-shell=cmd.exe'] : []), 'run', 'build']);
const stage = join(root, '.mallea', 'distribution', 'build-' + Date.now());
await packageRuntime({destination: join(stage, 'runtime')});
const config = JSON.parse(await readFile(join(root, 'apps/desktop/src-tauri/tauri.installed.json'), 'utf8'));
config.bundle.resources = {[join(stage, 'runtime').replaceAll('\\', '/') + '/']: 'runtime/'};
const configPath = join(stage, 'tauri.installed.json');
await writeFile(configPath, JSON.stringify(config));
await run(process.execPath, [fileURLToPath(new URL('../node_modules/@tauri-apps/cli/tauri.js', import.meta.url)), 'build', '--config', configPath, '--bundles', process.platform === 'win32' ? 'nsis' : 'dmg'], fileURLToPath(new URL('../apps/desktop/', import.meta.url)));
