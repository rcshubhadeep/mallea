import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WorkspaceStore } from '../services/workspace/store.mjs';
import { packageFixture } from './helpers.mjs';
test('install and revision persist acknowledgements across restart; failed and stale drafts cannot replace active version', async () => {
  const dir = await mkdtemp(join(tmpdir(),'mallea-store-'));
  let store = new WorkspaceStore(join(dir,'workspace.sqlite'));
  try {
    store.saveDraft('first',packageFixture(),null,'initial'); await store.install('first');
    store.updateTask('task-42','acknowledge',{revision:1});
    store.saveDraft('revision',packageFixture('critical-only','1.0.1'),'1.0.0','revision');
    store.saveDraft('stale',packageFixture('critical-only','1.0.2'),'1.0.0','stale');
    await store.install('revision'); await assert.rejects(store.install('stale'), /stale/);
    const bad = packageFixture('critical-only','1.0.3'); bad.source = 'export function review(){return {status:"blocked",label:"bad"}}';
    store.saveDraft('bad',bad,'1.0.1','bad'); await assert.rejects(store.install('bad'));
    store.close(); store = new WorkspaceStore(join(dir,'workspace.sqlite'));
    assert.equal(store.active().manifest.version,'1.0.1');
    assert.equal(store.state().tasks[0].reviewedRevision,1);
    store.updateTask('task-42','new-evidence');
    assert.throws(()=>store.updateTask('task-42','acknowledge',{revision:1}), /Evidence changed/);
  } finally { store.close(); await rm(dir,{recursive:true,force:true}); }
});
