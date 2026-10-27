import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { validatePackage } from '../../packages/sdk/package.mjs';
import { verifyReview } from '../../packages/runner/verify.mjs';

const screenshot = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="250"><rect width="600" height="250" fill="#304c48"/><circle cx="470" cy="65" r="40" fill="#dddca4"/><path d="M40 195h190v55H40zm320-35h200v90H360" fill="#9aad7b"/><rect x="180" y="165" width="18" height="30" rx="4" fill="#edba81"/><text x="20" y="30" fill="#ecf0d6" font-size="14">PAPER MOON / PLAYTEST EVIDENCE</text></svg>').toString('base64');
export function initialState() {
  return { active: null, tasks: [
    { id:'task-42', title:'Make the second landing readable', critical:true, reviewedRevision:0, observation:{ revision:1, text:'Players hesitate before the second platform. The landing edge needs a clearer visual cue.', screenshot } },
    { id:'task-43', title:'Clarify the optional collectible trail', critical:false, reviewedRevision:0, observation:{ revision:1, text:'The optional collectible trail is easy to miss. Check the revised placement during the next playtest.', screenshot } },
  ] };
}
export class WorkspaceStore {
  constructor(path) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive:true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS workspace (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS packages (version TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS drafts (id TEXT PRIMARY KEY, base TEXT, value TEXT NOT NULL, request TEXT NOT NULL);`);
    this.db.prepare('INSERT OR IGNORE INTO workspace VALUES(1,?)').run(JSON.stringify(initialState()));
  }
  state() { return JSON.parse(this.db.prepare('SELECT value FROM workspace WHERE id=1').get().value); }
  write(state) { this.db.prepare('UPDATE workspace SET value=? WHERE id=1').run(JSON.stringify(state)); }
  active() { const version = this.state().active; return version ? JSON.parse(this.db.prepare('SELECT value FROM packages WHERE version=?').get(version).value) : null; }
  versions() { return this.db.prepare('SELECT version FROM packages ORDER BY rowid').all().map(row=>row.version); }
  draft(id) { const row = this.db.prepare('SELECT * FROM drafts WHERE id=?').get(id); if (!row) throw new Error('Draft not found.'); return { id:row.id, base:row.base, artifact:JSON.parse(row.value), request:row.request }; }
  saveDraft(id, artifact, base, request) { validatePackage(artifact); this.db.prepare('INSERT INTO drafts VALUES(?,?,?,?)').run(id, base, JSON.stringify(artifact), request); }
  async install(id) {
    const draft = this.draft(id);
    validatePackage(draft.artifact);
    await verifyReview(draft.artifact);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const state = this.state();
      if (state.active !== draft.base) throw new Error('This draft is stale. Generate a revision from the current installed version.');
      const current = this.active();
      if (current && current.manifest.id !== draft.artifact.manifest.id) throw new Error('A revision must keep the package identity.');
      this.db.prepare('INSERT INTO packages VALUES(?,?)').run(draft.artifact.manifest.version, JSON.stringify(draft.artifact));
      state.active = draft.artifact.manifest.version;
      this.write(state);
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    return this.active();
  }
  updateTask(id, action, input = {}) {
    const state = this.state();
    const task = state.tasks.find(t=>t.id===id);
    if (!task) throw new Error('Task not found.');
    if (action === 'acknowledge') {
      if (!this.active()?.manifest.permissions.includes('reviews.write')) throw new Error('Acknowledgement permission is not installed.');
      if (input.revision !== task.observation.revision) throw new Error('Evidence changed. Review the current revision.');
      task.reviewedRevision = input.revision;
    } else if (action === 'new-evidence') {
      task.observation.revision++;
    } else if (action === 'critical' && typeof input.critical === 'boolean') {
      task.critical = input.critical;
    } else throw new Error('Unsupported task action.');
    this.write(state);
    return task;
  }
  close() { this.db.close(); }
}
