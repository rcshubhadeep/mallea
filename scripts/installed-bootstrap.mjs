import { readFile, mkdir, open, stat, rename, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { runtimeFormat, runtimeVersion } from '../services/workspace/runtime-contract.mjs';
import { projectEnvironment } from './lib/native-launch.mjs';

export async function ready(home) {
  try {
    const record = JSON.parse(await readFile(join(home, 'core.json'), 'utf8'));
    if (record.url !== 'http://127.0.0.1:4318' || typeof record.controlToken !== 'string') return false;
    const response = await fetch(record.url + '/api/engine/dashboard', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(700),
      headers: {'Content-Type': 'application/json', 'X-Mallea-Control': record.controlToken},
      body: JSON.stringify({action: 'state', args: {}}),
    });
    if (!response.ok) return false;
    const state = await response.json();
    return state.runtime?.format === runtimeFormat && state.runtime?.version === runtimeVersion;
  } catch { return false; }
}

export async function ensureCore({home, hostBinary, resourceRoot, timeout = 16000}) {
  const manifest = JSON.parse(await readFile(join(resourceRoot, 'runtime.json'), 'utf8'));
  if (manifest.format !== runtimeFormat || manifest.version !== runtimeVersion || manifest.node !== process.versions.node || manifest.platform !== process.platform || manifest.arch !== process.arch) {
    throw new Error('Installed runtime files are incompatible. Reinstall Mallea.');
  }
  await mkdir(home, {recursive: true});
  if (await ready(home)) return join(home, 'hosts', 'mallea-core.json');
  // Serialize startup across shortcuts. An abandoned lock expires; never kill a process by PID.
  const lockPath = join(home, 'startup.lock');
  let lock;
  const deadline = Date.now() + timeout;
  while (!lock && Date.now() < deadline) {
    try { lock = await open(lockPath, 'wx', 0o600); }
    catch (e) {
      if (e.code !== 'EEXIST') throw e;
      if (await ready(home)) return join(home, 'hosts', 'mallea-core.json');
      try {
        if (Date.now() - (await stat(lockPath)).mtimeMs > 60000) {
          await rename(lockPath, lockPath + '.abandoned-' + Date.now());
        }
      } catch {}
      await delay(150);
    }
  }
  if (!lock) throw new Error('Mallea is still starting. Wait and open it again.');
  try {
    if (!await ready(home)) {
      // Bound retained diagnostics. Content consists only of fixed engine failure messages.
      const logPath = join(home, 'core.log');
      try { if ((await stat(logPath)).size > 1000000) await rename(logPath, logPath + '.previous'); } catch {}
      const log = await open(logPath, 'a', 0o600);
      try {
        const child = spawn(process.execPath, [join(resourceRoot, 'scripts', 'installed-engine.mjs'), home, hostBinary, resourceRoot], {
          cwd: resourceRoot, env: projectEnvironment(), detached: true, windowsHide: true,
          stdio: ['ignore', log.fd, log.fd],
        });
        await new Promise((done, fail) => { child.once('spawn', done); child.once('error', fail); });
        child.unref();
      } finally { await log.close(); }
      while (Date.now() < deadline) {
        if (await ready(home)) return join(home, 'hosts', 'mallea-core.json');
        await delay(150);
      }
      throw new Error('Core did not become ready. Another Core may be using port 4318. Close it and retry; see core.log in the Mallea data folder.');
    }
    return join(home, 'hosts', 'mallea-core.json');
  } finally { await lock.close(); await unlink(lockPath).catch(() => {}); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [home, hostBinary, resourceRoot] = process.argv.slice(2);
  try {
    if (!home || !hostBinary || !resourceRoot || process.argv.length !== 5) throw new Error('Invalid launcher arguments.');
    console.log(await ensureCore({home: resolve(home), hostBinary: resolve(hostBinary), resourceRoot: resolve(resourceRoot)}));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
