import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runReview } from '../packages/runner/index.mjs';
import { verifyReview } from '../packages/runner/verify.mjs';
const reference = JSON.parse(await readFile(new URL('../examples/reference-extension.json', import.meta.url), 'utf8'));
const task = { critical: true, reviewedRevision: 1 };
const observation = { revision: 2 };
const run = (source) => runReview({ ...reference, source }, task, observation);

test('review semantics cover stale/current/out-of-order revisions', async () => {
  assert.equal((await verifyReview(reference)).length, 6);
});
test('host globals and credentials are absent', async () => {
  assert.equal((await run(`export function review(){return {status:'clear',label:[typeof process,typeof require,typeof fetch,typeof WebSocket].join(',')}}`)).label,
    'undefined,undefined,undefined,undefined');
});
test('module imports cannot access host filesystem', async () => {
  await assert.rejects(run(`import fs from 'node:fs'; export function review(){return {status:'clear',label:'escaped'}}`));
});
test('infinite loops are interrupted', async () => {
  await assert.rejects(run('export function review(){while(true){}}'));
});
test('memory growth is bounded', async () => {
  await assert.rejects(run('export function review(){const x=[];while(true)x.push(new Array(10000).fill(1))}'));
});
test('output shape and permission escalation are rejected', async () => {
  await assert.rejects(run('export function review(){return {status:"clear",label:"ok",secret:1}}'));
  await assert.rejects(runReview({ ...reference, manifest: { ...reference.manifest, permissions: ['files.read'] } }, task, observation));
});
test('fresh executions do not share globals or mutate input', async () => {
  const source = 'globalThis.n=0; export function review(t){t.critical=false;return {status:"clear",label:String(++globalThis.n)}}';
  assert.equal((await run(source)).label, '1');
  assert.equal((await run(source)).label, '1');
  assert.equal(task.critical, true);
});
