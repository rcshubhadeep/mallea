import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createWorkspaceServer } from './application.mjs';
import { createCollaborationServer } from './collaboration.mjs';
export { createWorkspaceServer };
export { createCollaborationServer };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    const artifactPath = args.find(a=>!a.startsWith('--'));
    const artifact = artifactPath ? JSON.parse(await readFile(artifactPath, 'utf8')) : null;
    if(args.filter(a=>a.startsWith('--')).some(a=>a!=='--production'))throw new Error('Only --production and an optional package path are supported.');
    const server = await createCollaborationServer({artifact, database: process.env.MALLEA_DB ?? '.mallea/workspace.sqlite', author: { production: args.includes('--production') } });
    if(server.workspaceStore.backup)console.log('Created a pre-Slice-002 SQLite backup alongside the workspace database.');
    server.requestTimeout = 5000;
    server.on('error', () => { console.error('Service failed to bind. Check port 4318.'); process.exitCode = 1; });
    server.listen(4318, '127.0.0.1', () => console.log('Workspace service: http://127.0.0.1:4318'));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
