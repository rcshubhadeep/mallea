import { readFile } from 'node:fs/promises';
import { verifyReview } from '../packages/runner/verify.mjs';

try {
  const path = process.argv[2];
  if (!path) throw new Error('Pass the path to an extension JSON artifact.');
  const results = await verifyReview(JSON.parse(await readFile(path, 'utf8')));
  console.log(JSON.stringify({ status: 'PASS', isolated_execution: true, results }, null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
