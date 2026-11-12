import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Installer hook: stop only the authenticated installed Core, never unrelated Node processes.
try {
  const home = process.argv[2];
  if (!home || process.argv.length !== 3) throw new Error('Invalid data folder.');
  let core;
  try { core = JSON.parse(await readFile(join(home, 'core.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') process.exit(0); throw error; }
  if (core.url !== 'http://127.0.0.1:4318' || typeof core.controlToken !== 'string') throw new Error('Invalid Core record.');
  let response;
  try {
    response = await fetch(core.url + '/api/engine/dashboard', {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(2500),
      headers: {'Content-Type': 'application/json', 'X-Mallea-Control': core.controlToken},
      body: JSON.stringify({action: 'quit', args: {}}),
    });
  } catch (error) { if (error.cause?.code === 'ECONNREFUSED') process.exit(0); throw error; }
  if (!response.ok) throw new Error('Close Mallea apps first.');
  for (let n = 0; n < 40; n++) {
    await delay(100);
    try { await fetch(core.url + '/api/health', {signal: AbortSignal.timeout(500)}); }
    catch { process.exit(0); }
  }
  throw new Error('Core has not stopped.');
} catch {
  console.error('Close all Mallea apps and quit Mallea before installing or uninstalling. Your data has been kept.');
  process.exitCode = 1;
}
