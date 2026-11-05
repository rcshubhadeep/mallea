import { isAbsolute } from 'node:path';

// Host-independent contract. Platform adapters supply paths; apps cannot choose binaries.
export const runtimeFormat = 1;
export const runtimeVersion = '0.1.0';
export function installedRuntime({hostBinary, resourceRoot} = {}) {
  if (![hostBinary, resourceRoot].every(p => typeof p === 'string' && isAbsolute(p))) {
    throw new Error('Installed runtime requires absolute host and resource paths.');
  }
  return Object.freeze({format: runtimeFormat, version: runtimeVersion, edition: 'installed', hostBinary, resourceRoot});
}

export function installedDashboard(app) {
  const next = structuredClone(app);
  // Applied to presentation only, never persisted over a user's definitions/data.
  function visit(n) {
    if (n.action === 'core.create') { n.disabledBind = 'dashboard.creationUnavailable'; n.label = 'App creation unavailable'; }
    if (n.id === 'new-help') n.text = 'This edition includes ready-to-use apps. New app creation is available in the developer workflow.';
    if (n.id === 'new-title') n.text = 'Included apps, ready to use';
    for (const c of n.children ?? []) visit(c);
    if (n.template) visit(n.template);
  }
  for (const surface of next.surfaces) visit(surface.ui);
  return next;
}
