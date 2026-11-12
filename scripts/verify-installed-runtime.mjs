import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

const stage = resolve(process.argv[2] ?? '.mallea/distribution/runtime');
const temporary = await mkdtemp(join(tmpdir(), 'mallea-installed-proof-'));
const resources = join(temporary, 'runtime'), home = join(temporary, 'data');
let owned = false;
function run(file, args) {
  return new Promise((done, fail) => {
    const env = {...process.env, PATH: '', DEV_API_KEY: 'synthetic-ignored-key'};
    delete env.NODE_OPTIONS; delete env.NODE_PATH;
    const child = spawn(join(resources, 'bin', process.platform === 'win32' ? 'node.exe' : 'node'), [join(resources, 'scripts', file), ...args], {cwd: temporary, env, windowsHide: true});
    let output = '', error = '';
    child.stdout.on('data', b => output += b); child.stderr.on('data', b => error += b);
    child.once('error', fail); child.once('exit', code => code === 0 ? done(output.trim()) : fail(new Error(error)));
  });
}
const core = async () => JSON.parse(await readFile(join(home, 'core.json')));
async function request(path, input, session) {
  const record = await core();
  const response = await fetch(record.url + '/api/' + path, {method: input === undefined ? 'GET' : 'POST', signal: AbortSignal.timeout(5000), headers: {'Content-Type': 'application/json', ...(session ? {'X-Mallea-Session': session} : {'X-Mallea-Control': record.controlToken})}, ...(input === undefined ? {} : {body: JSON.stringify(input)})});
  const value = await response.json();
  if (!response.ok) throw new Error(value.error);
  return value;
}
try {
  // Refuse to interfere with a pre-existing developer/installed Core.
  try { await fetch('http://127.0.0.1:4318/api/health', {signal: AbortSignal.timeout(500)}); throw new Error('Port 4318 is occupied. Stop the existing Core before this isolated check.'); }
  catch (error) { if (error.message.includes('occupied')) throw error; if (error.cause?.code !== 'ECONNREFUSED') throw error; }
  await cp(stage, resources, {recursive: true});
  const args = [home, process.execPath, resources];
  owned = true;
  const starts = await Promise.all([run('installed-bootstrap.mjs', args), run('installed-bootstrap.mjs', args)]);
  assert.equal(starts[0], starts[1]);
  const before = await core();
  assert.equal(await run('installed-bootstrap.mjs', args), starts[0]);
  assert.equal((await core()).controlToken, before.controlToken);
  const state = await request('engine/dashboard', {action: 'state', args: {}});
  assert.equal(state.settings.ready, false); assert.equal(state.data.apps.length, 3);
  const host = JSON.parse(await readFile(join(home, 'hosts/review-main.json')));
  const native = await request('native/register', {appId: host.appId, credential: host.credential});
  const saved = await request('studio/review', {type: 'comment', text: 'Retained through installed restart.', expectedRevision: 0, operationId: randomUUID()}, native.session);
  assert(saved.data.review);
  await assert.rejects(() => request('engine/dashboard', {action: 'project', args: {}}), /unavailable/);
  await assert.rejects(() => request('live/author', {request: 'Change the heading'}, native.session), /Configure/);
  await run('installed-stop.mjs', [home]);
  await delay(250);
  await run('installed-bootstrap.mjs', args);
  assert.notEqual((await core()).controlToken, before.controlToken);
  const again = JSON.parse(await readFile(join(home, 'hosts/review-main.json')));
  const session = await request('native/register', {appId: again.appId, credential: again.credential});
  const restored = await request('studio/state', undefined, session.session);
  assert(JSON.stringify(restored.data.review).includes('Retained through installed restart.'));
  const manifest = JSON.parse(await readFile(join(resources, 'runtime.json')));
  console.log(JSON.stringify({passed: true, node: manifest.node, platform: manifest.platform, bundledApps: state.data.apps.map(a => a.name), checks: ['outside-checkout', 'empty-PATH', 'concurrent-start', 'reconnect', 'no-inherited-model-key', 'ordinary-feedback-write', 'creator-denial', 'Shape-gate', 'restart-persistence', 'authenticated-stop']}));
} finally {
  if (owned) { try { await run('installed-stop.mjs', [home]); await delay(250); } catch { console.error('The isolated Core may still be running; inspect its test folder before retrying.'); owned = false; } }
  // Only remove this mkdtemp-owned tree after shutdown; retain it on uncertain shutdown.
  if (owned) await rm(temporary, {recursive: true, force: true});
}
