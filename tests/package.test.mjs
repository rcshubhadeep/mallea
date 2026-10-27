import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePackage } from '../packages/sdk/package.mjs';
import { verifyReview } from '../packages/runner/verify.mjs';
import { packageFixture } from './helpers.mjs';
test('versioned initial and revised packages honor their distinct policies', async () => {
  for (const p of [packageFixture(), packageFixture('critical-only','1.0.1')]) {
    validatePackage(p); assert.equal((await verifyReview(p)).length, 6);
  }
});
test('undeclared access, script markup, and remote style URLs rejected', () => {
  const p = packageFixture(); p.manifest.permissions.push('files.read'); assert.throws(() => validatePackage(p));
  const q = packageFixture(); q.ui.children.push({tag:'script',text:'bad()'}); assert.throws(() => validatePackage(q));
  const r = packageFixture(); r.ui.style = {backgroundImage:'url(https://example.com)'}; assert.throws(() => validatePackage(r));
});
test('policy/source mismatch fails behavior verification', async () => {
  const p = packageFixture(); p.policy = 'critical-only'; await assert.rejects(verifyReview(p));
});
