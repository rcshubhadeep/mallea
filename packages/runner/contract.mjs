import { validatePackage } from '../sdk/package.mjs';
export function validateArtifact(artifact) {
  if (artifact?.manifest?.sdkVersion === '0.2') return validatePackage(artifact);
  const m = artifact?.manifest;
  if (!m || m.id !== 'evidence-review' || m.version !== '0.1.0' || m.sdkVersion !== '0.1'
    || m.slot !== 'task.details' || JSON.stringify(m.permissions) !== '["observations.read"]'
    || Object.keys(m).length !== 5 || Object.keys(artifact).sort().join() !== 'manifest,source'
    || typeof artifact.source !== 'string' || artifact.source.length > 1500) {
    throw new Error('Unsupported experimental extension contract.');
  }
}

export function validateInputs(task, observation) {
  if (!task || typeof task.critical !== 'boolean'
    || !Number.isSafeInteger(task.reviewedRevision) || task.reviewedRevision < 0
    || !observation || !Number.isSafeInteger(observation.revision) || observation.revision < 0) {
    throw new Error('Invalid review inputs.');
  }
}

export function validateOutput(value) {
  if (!value || Object.keys(value).sort().join() !== 'label,status'
    || !['clear', 'blocked', 'warning'].includes(value.status)
    || typeof value.label !== 'string' || !value.label.trim() || value.label.length > 200) {
    throw new Error('Extension returned invalid review output.');
  }
  return value;
}
