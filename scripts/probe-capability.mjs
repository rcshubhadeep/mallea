// One explicitly selected, bounded development probe. Never uses a user workspace.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { WorkspaceStore } from '../services/workspace/store.mjs';
import { createAuthor } from '../services/workspace/author.mjs';
import { runReview } from '../packages/runner/index.mjs';
import { compilePanel } from '../packages/sdk/document.mjs';

const requests = {
  layout: 'Keep critical-only review behavior. Call the main heading Evidence desk. Put the bound task title first, then the review summary and acknowledgement button, and put the screenshot and observation below them. Use background #eef4e8. Keep live evidence bindings.',
  computed: 'Keep critical-only behavior and the existing evidence and acknowledgement. In the review label show the number of evidence revisions since the last acknowledgement, computed as max(0, observation.revision - task.reviewedRevision). Use the format "N revisions to review" with N replaced by the computed number. Name the heading Revision distance.',
  threshold: 'Change behavior: one unseen revision should only warn, even for a critical task. Block critical tasks only when at least three evidence revisions have accumulated since acknowledgement. Ordinary unreviewed tasks should warn and reviewed tasks should clear. Keep the screenshot and acknowledgement button.',
};
const name = process.argv[2];
if (!Object.hasOwn(requests, name) || process.argv.length !== 3) throw new Error('Choose exactly one probe: layout, computed, or threshold. Development only.');
const store = new WorkspaceStore(':memory:');
const author = createAuthor(store);
const started = Date.now();
const reference = JSON.parse(readFileSync(new URL('../examples/reference-extension.json', import.meta.url), 'utf8'));
try {
  store.saveDraft('seed', reference, null, 'Hand-authored baseline for isolated probe');
  await store.install('seed');
  const job = author.start(requests[name]);
  let status;
  do { await new Promise(resolve => setTimeout(resolve, 200)); status = author.get(job.id); }
  while (!['ready', 'failed', 'cancelled', 'unsupported'].includes(status.phase));
  const report = { probe:name, request:requests[name], environment:'development', baseline:'hand-authored reference, critical-only, v1.0.0', phase:status.phase,
    attempts:status.attempt, diagnostics:status.diagnostics, error:status.error, unsupported:status.unsupported, elapsedMs:Date.now()-started, usage:status.usage, observations:{}, requestCheck:status.phase === 'unsupported' ? 'unsupported' : 'generation-failed' };
  const dir = `.mallea/probes/${Date.now()}-${name}`;
  mkdirSync(dir, { recursive:true });
  if (status.phase === 'ready') {
    const artifact = store.draft(job.id).artifact;
    writeFileSync(`${dir}/package.json`, JSON.stringify(artifact, null, 2));
    writeFileSync(`${dir}/panel.html`, compilePanel(artifact).html);
    const nodes = []; const walk = n => { nodes.push(n); (n.children ?? []).forEach(walk); }; walk(artifact.ui);
    const outcomes = [];
    for (const critical of [true,false]) for (const gap of [0,1,2,3,7]) {
      outcomes.push({critical,gap,...await runReview(artifact,{critical,reviewedRevision:4},{revision:4+gap})});
    }
    report.observations = {policy:artifact.policy, nodes:nodes.map(({tag,text,bind,action,style})=>({tag,text,bind,action,style})),outcomes};
    // These expectations come from the selected user request, not generated code.
    let fulfilled = false;
    if (name === 'computed') fulfilled = nodes.some(n=>n.text==='Revision distance')
      && outcomes.every(o=>o.label===`${o.gap} revisions to review` && o.status===(o.gap===0?'clear':o.critical?'blocked':'warning'));
    if (name === 'threshold') fulfilled = outcomes.every(o=>o.status===(o.gap===0?'clear':o.critical&&o.gap>=3?'blocked':'warning'));
    if (name === 'layout') {
      const positions = ['task.title','review.label','review.acknowledge','observation.screenshot','observation.text'].map(key=>nodes.findIndex(n=>n.bind===key||n.action===key));
      fulfilled = positions.every((value,index)=>value>=0 && (index===0||value>positions[index-1]))
        && nodes.some(n=>n.text==='Evidence desk') && nodes.some(n=>n.style?.backgroundColor==='#eef4e8')
        && outcomes.every(o=>o.status===(o.gap===0?'clear':o.critical?'blocked':'warning'));
    }
    report.requestCheck = fulfilled ? 'fulfilled-on-probed-inputs' : 'request-mismatch';
  }
  writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({report:`${dir}/report.json`,...report},null,2));
  if (status.phase === 'failed' || report.requestCheck === 'request-mismatch') process.exitCode=1;
} finally { author.close(); store.close(); }
