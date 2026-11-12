import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runtimeFormat, runtimeVersion } from '../services/workspace/runtime-contract.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function packageRuntime({destination = join(root, '.mallea/distribution/runtime')} = {}) {
  if (process.versions.node !== '24.19.0') throw new Error('Build the installed runtime with Node 24.19.0.');
  if (process.platform === 'darwin') {
    // A Homebrew Node may reference Cellar dylibs that do not exist on users' Macs.
    const linked = execFileSync('otool', ['-L', process.execPath], {encoding: 'utf8'}).split('\n').slice(1).map(line => line.trim().split(' (')[0]).filter(Boolean);
    if (linked.some(path => !path.startsWith('/usr/lib/') && !path.startsWith('/System/Library/'))) {
      throw new Error('Use the official Node 24.19.0 macOS binary; this Node links libraries outside the OS.');
    }
  }
  destination = resolve(destination);
  // Never delete an existing destination: a new distribution gets its own staging folder.
  if (existsSync(destination)) throw new Error('Distribution folder already exists. Choose a new empty staging folder.');
  await mkdir(destination, {recursive: true});
  for (const folder of ['services/workspace', 'packages/sdk', 'packages/runner', 'apps/definitions']) {
    await cp(join(root, folder), join(destination, folder), {
      recursive: true,
      filter: source => !/\.(?:log|sqlite(?:-wal|-shm)?|db(?:-wal|-shm)?|map|key|pem)$/.test(source) && !source.split(/[\\/]/).at(-1).startsWith('.env') && !['.mallea', 'node_modules'].includes(source.split(/[\\/]/).at(-1)),
    });
  }
  for (const file of ['scripts/engine.mjs', 'scripts/installed-engine.mjs', 'scripts/installed-stop.mjs', 'scripts/installed-bootstrap.mjs', 'scripts/lib/inference.mjs', 'scripts/lib/native-launch.mjs']) {
    await mkdir(dirname(join(destination, file)), {recursive: true});
    await cp(join(root, file), join(destination, file));
  }
  await writeFile(join(destination, 'package.json'), JSON.stringify({name: 'mallea-installed-runtime', version: runtimeVersion, private: true, type: 'module'}));
  // Copy only the runtime dependency closure, preserving Node's resolution layout.
  const copied = new Set();
  async function dependency(name, from = root) {
    let parent = from, found;
    while (true) {
      const candidate = join(parent, 'node_modules', name);
      if (existsSync(join(candidate, 'package.json'))) { found = candidate; break; }
      if (parent === root || dirname(parent) === parent) break;
      parent = dirname(parent);
    }
    if (!found) throw new Error('Missing runtime dependency: ' + name);
    const path = relative(root, found);
    if (path.startsWith('..') || isAbsolute(path) || !path.startsWith('node_modules')) throw new Error('Dependency escaped the checkout.');
    if (copied.has(path)) return;
    copied.add(path);
    await cp(found, join(destination, path), {recursive: true, filter: source => source === found || !relative(found, source).split(/[\\/]/).includes('node_modules')});
    const manifest = JSON.parse(await readFile(join(found, 'package.json'), 'utf8'));
    for (const child of Object.keys(manifest.dependencies ?? {})) await dependency(child, found);
  }
  for (const name of ['@modelcontextprotocol/sdk', 'ws', 'zod', 'quickjs-emscripten']) await dependency(name);
  await mkdir(join(destination, 'bin'));
  await cp(process.execPath, join(destination, 'bin', process.platform === 'win32' ? 'node.exe' : 'node'));
  const license = await fetch('https://raw.githubusercontent.com/nodejs/node/v24.19.0/LICENSE', {signal: AbortSignal.timeout(20000)});
  if (!license.ok) throw new Error('Could not obtain the bundled Node license.');
  await writeFile(join(destination, 'NODE-LICENSE'), await license.text());
  await writeFile(join(destination, 'runtime.json'), JSON.stringify({format: runtimeFormat, version: runtimeVersion, node: process.versions.node, platform: process.platform, arch: process.arch, apps: ['mallea-core', 'scratchpad-main', 'review-main']}, null, 2) + '\n');
  await access(join(destination, 'scripts/installed-bootstrap.mjs'));
  return {destination, packages: copied.size};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const destination = process.argv[2];
  console.log(await packageRuntime(destination ? {destination} : {}));
}
