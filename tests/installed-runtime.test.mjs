import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EventEmitter } from 'node:events';
import { startEngine } from '../scripts/engine.mjs';
import { ModelSettings } from '../services/workspace/model-settings.mjs';
import { installedRuntime } from '../services/workspace/runtime-contract.mjs';
import { AppLauncher } from '../services/workspace/app-launcher.mjs';

test('installed model setup starts empty, validates user access and keeps keys session-only', () => {
  const settings = new ModelSettings({installed: true, config: {model: 'muse-spark-open', key: 'ignored-developer-key'}});
  assert.equal(settings.public().ready, false);
  assert.throws(() => settings.config());
  const input = {profile: 'user', model: 'muse-spark-open', endpoint: 'https://example.com/v1/', key: 'synthetic-session-key'};
  for (const endpoint of ['http://example.com', 'https://user:pass@example.com', 'https://example.com/?key=secret']) {
    assert.throws(() => settings.configure({...input, endpoint}));
  }
  assert.throws(() => settings.configure({...input, model: 'unregistered-model'}));
  assert.throws(() => settings.configure({...input, key: 'bad\nheader'}));
  settings.configure(input);
  assert.equal(settings.config().endpoint.href, 'https://example.com/v1/chat/completions');
  assert.equal(settings.public().ready, true);
  assert(!JSON.stringify(settings.public()).includes(input.key));
  assert.equal(new ModelSettings({installed: true}).public().ready, false);
});

test('installed edition preserves ordinary data, denies creation and gates Shape before generation', async () => {
  const home = await mkdtemp(join(tmpdir(), 'mallea-installed-'));
  const runtime = installedRuntime({hostBinary: join(home, 'host.exe'), resourceRoot: join(home, 'runtime')});
  let server;
  async function stop() { if (server) { server.workspaceRegistry.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); server = null; } }
  try {
    server = await startEngine({home, port: 0, runtime});
    const session = server.workspaceRegistry.register('mallea-core');
    const state = server.liveApps.info(session);
    const nodes = []; const walk = n => { nodes.push(n); for (const c of n.children ?? []) walk(c); };
    state.model.surfaces.forEach(s => walk(s.ui));
    assert.equal(nodes.find(n => n.action === 'core.create').disabledBind, 'dashboard.creationUnavailable');
    assert.equal(state.data.dashboard.creationUnavailable, true);
    assert.equal(state.inferenceReady, false);
    let shutdowns = 0;
    server.dashboard.shutdown = () => { shutdowns++; };
    const originalOnline = server.workspaceRegistry.online;
    server.workspaceRegistry.online = id => id === 'scratchpad-main';
    await assert.rejects(() => server.dashboard.action({action: 'quit', args: {}}), /Close the other/);
    assert.equal(shutdowns, 0);
    server.workspaceRegistry.online = originalOnline;
    assert.deepEqual(state.data.dashboard.apps.map(a => a.name).sort(), ['Fieldnote', 'Mallea Core', 'Parcel']);
    const base = `http://127.0.0.1:${server.address().port}`;
    const core = JSON.parse(await readFile(join(home, 'core.json')));
    const request = (path, input, headers) => fetch(base + path, {method: 'POST', headers: {'Content-Type': 'application/json', ...headers}, body: JSON.stringify(input)});
    const denied = await request('/api/live/author', {request: 'Change the title'}, {'X-Mallea-Session': session.id});
    assert.equal(denied.status, 400); assert.match((await denied.json()).error, /Configure/);
    await assert.rejects(() => server.dashboard.action({action: 'project', args: {}}), /unavailable/);
    const registration = await request('/api/engine/apps', {version: 1, id: 'another-app', name: 'Another', author: 'Test', purpose: 'Denied', adapter: 'surface'}, {'X-Mallea-Control': core.controlToken});
    assert.equal(registration.status, 400); assert.equal(server.engineApps.has('another-app'), false);
    server.modelSettings.configure({profile: 'user', endpoint: 'https://example.com/v1', model: 'muse-spark-open', key: 'not-persisted-session-key'});
    assert.equal(server.liveApps.info(session).inferenceReady, true);
    assert(!JSON.stringify(server.dashboard.state()).includes('not-persisted-session-key'));
    const app = server.liveApps.read('scratchpad-main'); app.models.personal = {fields: {note: {type: 'text', initial: ''}}, values: {note: 'Keep my work'}};
    server.liveApps.save('scratchpad-main', app, 0);
    await stop();
    assert(!(await readFile(join(home, 'workspace.sqlite'))).includes(Buffer.from('not-persisted-session-key')));
    server = await startEngine({home, port: 0, runtime});
    assert.equal(server.liveApps.read('scratchpad-main').models.personal.values.note, 'Keep my work');
    assert.equal(server.modelSettings.public().ready, false);
  } finally { await stop(); await rm(home, {recursive: true, force: true}); }
});

test('installed launch uses the supplied host without compiler paths and accepts only included apps', async () => {
  const home = await mkdtemp(join(tmpdir(), 'mallea-installed-launch-'));
  const binary = join(home, 'Mallea.exe'), calls = [];
  try {
    await writeFile(binary, 'Never executed; process is injected.'); await mkdir(join(home, 'hosts'));
    await writeFile(join(home, 'hosts/scratchpad-main.json'), JSON.stringify({version: 1, appId: 'scratchpad-main', engineUrl: 'http://127.0.0.1:4318', credential: 'a'.repeat(64)}));
    const launcher = new AppLauncher({home, runtime: installedRuntime({hostBinary: binary, resourceRoot: home}), engine: {manifest: () => ({name: 'Fieldnote'}), authenticate: () => {}}, registry: {online: () => false}, spawnProcess: (...args) => { calls.push(args); const child = new EventEmitter(); child.unref = () => {}; queueMicrotask(() => child.emit('spawn')); return child; }});
    await launcher.launch({appId: 'scratchpad-main'}); assert.equal(calls[0][0], binary);
    assert.equal(calls[0][2].env.PROD_LLM_KEY, undefined);
    await assert.rejects(() => launcher.launch({appId: 'other-app'}), /not included/);
    assert.equal(calls.length, 1);
    assert.throws(() => installedRuntime({hostBinary: 'relative', resourceRoot: home}));
  } finally { await rm(home, {recursive: true, force: true}); }
});
