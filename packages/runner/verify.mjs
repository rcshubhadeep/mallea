import { runReview } from './index.mjs';

export async function verifyReview(artifact) {
  const cases = [
    ['critical stale', true, 1, 2, 'blocked'],
    ['ordinary stale', false, 1, 2, artifact.policy === 'block-all' ? 'blocked' : 'warning'],
    ['critical current', true, 2, 2, 'clear'],
    ['ordinary current', false, 2, 2, 'clear'],
    ['older event', true, 3, 2, 'clear'],
    ['new evidence after acknowledgement', true, 2, 3, 'blocked'],
  ];
  const results = [];
  for (const [name, critical, reviewedRevision, revision, expected] of cases) {
    const output = await runReview(artifact, { critical, reviewedRevision }, { revision });
    if (output.status !== expected) throw new Error(`Behavior failed: ${name}`);
    results.push({ name, status: output.status });
  }
  return results;
}
