const tags = new Set(['section', 'div', 'h2', 'h3', 'p', 'span', 'strong', 'small', 'button', 'img', 'hr']);
const bindings = new Set(['task.title', 'task.reviewedRevision', 'observation.text', 'observation.revision', 'observation.screenshot', 'review.status', 'review.label']);
const styles = {
  color: /^#[0-9a-fA-F]{6}$/, backgroundColor: /^#[0-9a-fA-F]{6}$/,
  padding: /^([0-9]|[1-3][0-9]|40)px$/, gap: /^([0-9]|[1-3][0-9]|40)px$/,
  borderRadius: /^([0-9]|[12][0-9]|30)px$/, fontSize: /^(1[0-9]|2[0-9]|3[0-6])px$/,
  display: /^(flex|grid|block)$/, flexDirection: /^(row|column)$/,
  fontWeight: /^(400|500|600|700)$/, textAlign: /^(left|center|right)$/,
};
const plain = v => v && typeof v === 'object' && !Array.isArray(v);
const keys = (v, allowed, required = []) => plain(v) && Object.keys(v).every(k => allowed.includes(k)) && required.every(k => Object.hasOwn(v, k));

export function validatePackage(artifact) {
  if (!keys(artifact, ['manifest', 'source', 'ui', 'policy'], ['manifest', 'source', 'ui', 'policy'])) throw new Error('Package requires manifest, source, ui, policy.');
  const m = artifact.manifest;
  if (!keys(m, ['id', 'title', 'version', 'sdkVersion', 'slot', 'permissions'], ['id', 'title', 'version', 'sdkVersion', 'slot', 'permissions'])
    || !/^[a-z][a-z0-9-]{2,40}$/.test(m.id) || !/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(m.version)
    || m.sdkVersion !== '0.2' || m.slot !== 'task.details' || typeof m.title !== 'string' || !m.title.trim() || m.title.length > 80
    || !Array.isArray(m.permissions) || new Set(m.permissions).size !== m.permissions.length
    || !m.permissions.includes('observations.read') || m.permissions.some(p => !['observations.read', 'reviews.write'].includes(p))) {
    throw new Error('Invalid manifest or unsupported permissions.');
  }
  if (!['block-all', 'critical-only'].includes(artifact.policy)) throw new Error('Unsupported review policy.');
  if (typeof artifact.source !== 'string' || artifact.source.length > 6000) throw new Error('Behavior source must be at most 6000 characters.');
  let count = 0;
  const seen = new Set();
  function walk(node, depth = 0) {
    if (++count > 60 || depth > 8 || !keys(node, ['tag', 'text', 'bind', 'action', 'style', 'children'], ['tag']) || !tags.has(node.tag)) throw new Error('Invalid UI node or size limit.');
    if (node.text !== undefined && (typeof node.text !== 'string' || node.text.length > 300)) throw new Error('Invalid UI text.');
    if (node.bind !== undefined) {
      if (!bindings.has(node.bind)) throw new Error('Unsupported UI binding.');
      if ((node.tag === 'img') !== (node.bind === 'observation.screenshot')) throw new Error('Images require the approved screenshot binding.');
      seen.add(node.bind);
    }
    if (node.tag === 'img' && node.bind !== 'observation.screenshot') throw new Error('Image binding required.');
    if (node.action !== undefined && (node.tag !== 'button' || node.action !== 'review.acknowledge' || !m.permissions.includes('reviews.write'))) throw new Error('Undeclared UI action.');
    if (node.style !== undefined && (!plain(node.style) || Object.entries(node.style).some(([key, value]) => typeof value !== 'string' || !styles[key]?.test(value)))) throw new Error('Unsupported UI style.');
    if (node.children !== undefined) {
      if (!Array.isArray(node.children) || ['img', 'hr'].includes(node.tag)) throw new Error('Invalid UI children.');
      for (const child of node.children) walk(child, depth + 1);
    }
  }
  walk(artifact.ui);
  if (!seen.has('review.label') || !seen.has('observation.text') || !seen.has('observation.screenshot')) throw new Error('Panel must show evidence screenshot, observation text, and review label.');
  return artifact;
}

export function readUnsupported(value) {
  if (!plain(value) || !Object.hasOwn(value, 'unsupported')) return null;
  if (!keys(value, ['unsupported'], ['unsupported'])
    || !keys(value.unsupported, ['reason', 'alternative'], ['reason', 'alternative'])
    || ['reason', 'alternative'].some(key => typeof value.unsupported[key] !== 'string' || !value.unsupported[key].trim() || value.unsupported[key].length > 500)) {
    throw new Error('Unsupported response must contain only unsupported:{reason,alternative}, each a nonempty string of at most 500 characters.');
  }
  return value.unsupported;
}

export const contractPrompt = `Return JSON only. First assess whether every essential requested change fits the SDK below.
If any essential part cannot be implemented, return ONLY {"unsupported":{"reason":"Specific missing capability or incompatible rule","alternative":"An explicitly described supported alternative the user could request"}}. Each string <=500 chars. Do not generate a package or silently substitute a supported policy. An alternative is a suggestion, not permission to implement it.
Only when the request fits, return {manifest,source,ui,policy}.
manifest: {id,title,version,sdkVersion:"0.2",slot:"task.details",permissions:["observations.read","reviews.write"]}. Use the supplied id/version exactly. title <=80 chars.
policy: "block-all" (all stale tasks blocked) or "critical-only" (critical stale tasks blocked, ordinary stale tasks warning), according to the request. Current or newer acknowledgements always clear. These are the ONLY status rules. Thresholds, warn-only policies, time-based rules, and rules based on text/image content are unsupported. Computed labels using the supplied numeric inputs are supported.
source: ES module exporting synchronous review(task,observation), returning exactly {status:"clear"|"blocked"|"warning",label:string<=200}. Inputs task:{critical:boolean,reviewedRevision:number}, observation:{revision:number}. No imports/host APIs. Maximum 6000 chars.
ui: a model-authored nested tree of {tag,text?,bind?,action?,style?,children?}. Choose a thoughtful layout. Allowed tags section,div,h2,h3,p,span,strong,small,button,img,hr. Bindings: task.title,task.reviewedRevision,observation.text,observation.revision,observation.screenshot,review.status,review.label. Include screenshot img bound to observation.screenshot, observation.text, and review.label. Bindings supply text; do not put template expressions in text.
button action "review.acknowledge" acknowledges the currently shown evidence revision. Include a clear button for this action. img requires screenshot binding, no children. No attributes beyond listed fields, no URLs, no HTML strings or scripts. <=60 nodes, depth <=8, text <=300 chars.
style allowed: color/backgroundColor (#rrggbb), padding/gap (0-40px), borderRadius (0-30px), fontSize (10-36px), display (flex/grid/block), flexDirection(row/column), fontWeight(400/500/600/700), textAlign(left/center/right). All style values strings.
Layout is compiled by the host to inert markup; review source executes in an isolated interpreter. Data belongs to the host, never put state in package globals. Do not copy evidence contents into static UI text. Small labels and layout changes are supported; capabilities outside this contract are not.`;
