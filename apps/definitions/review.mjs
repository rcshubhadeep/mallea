import { verifyReview } from '../../packages/runner/verify.mjs';

// Domain requirements belong to the app that offers this insertion slot.
export function validateReviewPanel(artifact) {
  const bindings = new Set();
  const walk = node => { if (node.bind) bindings.add(node.bind); (node.children ?? []).forEach(walk); };
  walk(artifact.ui);
  for (const binding of ['observation.screenshot','observation.text','review.label']) {
    if (!bindings.has(binding)) throw new Error(`Review panel must include ${binding}.`);
  }
  return artifact;
}
export const verifyReviewPanel = async artifact => { validateReviewPanel(artifact); return verifyReview(artifact); };

export const reviewAuthoring = {
  slot:'task.details',
  bindings:['task.title','task.reviewedRevision','observation.text','observation.revision','observation.screenshot','review.status','review.label'],
  actions:['review.acknowledge'],
  policies:['block-all','critical-only'],
  requirements:'Include bound screenshot, observation text, and review label. Include an acknowledgement action. Review sees only criticality and revision numbers; it cannot analyze text or pixels.',
};
