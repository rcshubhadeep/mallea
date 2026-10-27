import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWorkspaceServer } from '../services/workspace/server.mjs';
const artifact = JSON.parse(await readFile(new URL('../examples/reference-extension.json', import.meta.url), 'utf8'));
test('service verifies artifact, routes review, and rejects hostile origins', async () => {
  const server = await createWorkspaceServer(artifact);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200);
    const {token} = await (await fetch(`${base}/api/bootstrap`)).json();
    assert.equal((await fetch(`${base}/api/workspace`)).status, 403);
    const request = { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Mallea-Token':token }, body: JSON.stringify({ taskId:'task-42', action:'acknowledge', revision:1 }) };
    const panel=await (await fetch(`${base}/api/panel?task=task-42`, {headers:request.headers})).json();
    assert.equal(panel.snapshot.review.status, 'blocked');
    const frame=await fetch(`${base}/api/${panel.framePath}`,{headers:{'Sec-Fetch-Site':'cross-site'}});
    assert.equal(frame.status,200);assert.match(frame.headers.get('content-type'),/text\/html/);
    const html=await frame.text();assert.match(html,/default-src 'none'/);assert.match(html,/connect-src 'none'/);
    assert.ok(!html.includes(token));assert.ok(!html.includes('Players hesitate'));
    assert.equal((await fetch(`${base}/api/frame/not-a-real-handle`)).status,404);
    assert.equal((await fetch(`${base}/api/task`,request)).status,200);
    assert.equal((await (await fetch(`${base}/api/panel?task=task-42`, {headers:request.headers})).json()).snapshot.review.status, 'clear');
    assert.equal((await fetch(`${base}/api/review`, { ...request, headers: { ...request.headers, Origin: 'https://evil.example' } })).status, 403);
    const preflight = await fetch(`${base}/api/review`, { method: 'OPTIONS', headers: { Origin: 'http://tauri.localhost' } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://tauri.localhost');
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
