import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { chat, inferenceConfig } from './lib/inference.mjs';

// Authoring contract experiment only. Generated JavaScript is parsed, never run.
async function main() {
  const result = await chat(inferenceConfig(), [{ role: 'user', content: `
Create a small Mallea evidence-review extension. Return only a JSON object with exactly two keys: manifest and source.
manifest must have exactly these keys and values: id="evidence-review", version="0.1.0", sdkVersion="0.1", permissions=["observations.read"], slot="task.details".
source must be JavaScript ES module source exporting function review(task, observation).
Inputs: task has critical (boolean) and reviewedRevision (number); observation has revision (number).
Output: {status, label}; status is "clear" when reviewedRevision >= revision, otherwise "blocked" for critical tasks and "warning" for other tasks. Write a short human-readable label for each state.
No imports, dependencies, network, file access, global state, or top-level side effects. Keep the module under 1500 characters. Do not include markdown fences.
` }], { max_tokens: 2048 });
  console.log(JSON.stringify({ usage: result.usage }));
  if (result.choice.finish_reason !== 'stop') throw new Error('Generation did not finish within its limit.');
  let artifact;
  try { artifact = JSON.parse(result.choice.message.content); }
  catch { throw new Error('Generated package is not JSON.'); }
  const exactKeys = (object, keys) => object && typeof object === 'object' && !Array.isArray(object)
    && Object.keys(object).length === keys.length && keys.every((key) => Object.hasOwn(object, key));
  if (!exactKeys(artifact, ['manifest', 'source'])) throw new Error('Invalid package fields.');
  const m = artifact.manifest;
  if (!exactKeys(m, ['id', 'version', 'sdkVersion', 'permissions', 'slot'])
    || m.id !== 'evidence-review' || m.version !== '0.1.0' || m.sdkVersion !== '0.1'
    || m.slot !== 'task.details' || JSON.stringify(m.permissions) !== '["observations.read"]') {
    throw new Error('Manifest failed the experimental contract.');
  }
  if (typeof artifact.source !== 'string' || artifact.source.length > 1500) throw new Error('Invalid source length.');
  const parsed = spawnSync(process.execPath, ['--input-type=module', '--check'], {
    input: artifact.source, encoding: 'utf8', timeout: 5000, windowsHide: true,
  });
  if (parsed.status !== 0) throw new Error('Generated source failed JavaScript syntax validation.');
  // Syntax validation is not a security review or a behavior test.
  const directory = `.mallea/experiments/${Date.now()}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/package.json`, JSON.stringify(artifact, null, 2), { flag: 'wx' });
  console.log(JSON.stringify({ status: 'PASS', manifest_valid: true, syntax_valid: true,
    generated_code_executed: false, behavior_verified: false, artifact: `${directory}/package.json`, usage: result.usage }, null, 2));
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
