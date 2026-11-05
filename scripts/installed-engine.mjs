import { resolve } from 'node:path';
import { startEngine } from './engine.mjs';
import { installedRuntime } from '../services/workspace/runtime-contract.mjs';

const [home, hostBinary, resourceRoot] = process.argv.slice(2);
if (process.argv.length !== 5 || !home) throw new Error('Invalid installed runtime arguments.');
try {
  const runtime = installedRuntime({hostBinary, resourceRoot});
  const server = await startEngine({home: resolve(home), runtime});
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    server.workspaceRegistry.close();
    server.closeAllConnections();
    server.close(() => process.exit(0));
  };
  server.dashboard.shutdown = stop;
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
} catch (error) {
  // Never log request bodies, configuration or model credentials.
  console.error(error.code === 'EADDRINUSE'
    ? 'Another process owns the Core port. Reopen Mallea or close its developer Core.'
    : 'Core could not start. Check the Mallea data folder and installed files.');
  process.exitCode = 1;
}
