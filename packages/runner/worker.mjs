import { parentPort, workerData } from 'node:worker_threads';
import { getQuickJS } from 'quickjs-emscripten';

// No Node objects or host functions are bound into the interpreter.
const engine = await getQuickJS();
const runtime = engine.newRuntime();
runtime.setMemoryLimit(8 * 1024 * 1024);
runtime.setMaxStackSize(256 * 1024);
const deadline = performance.now() + 100;
runtime.setInterruptHandler(() => performance.now() > deadline);
runtime.setModuleLoader(() => { throw new Error('Imports are disabled.'); });
const context = runtime.newContext();
const handles = [];
function own(result) {
  if (result.error) {
    result.error.dispose();
    throw new Error('Extension execution rejected or interrupted.');
  }
  handles.push(result.value);
  return result.value;
}
try {
  const exports = own(context.evalCode(workerData.source, 'extension.mjs', { type: 'module' }));
  const review = context.getProp(exports, 'review');
  handles.push(review);
  const task = own(context.evalCode(`(${JSON.stringify(workerData.task)})`));
  const observation = own(context.evalCode(`(${JSON.stringify(workerData.observation)})`));
  const output = own(context.callFunction(review, context.undefined, task, observation));
  // Serialization also runs inside the interpreter and its CPU/memory budget.
  context.setProp(context.global, '__output', output);
  const serialized = own(context.evalCode('JSON.stringify(__output)'));
  if (context.typeof(serialized) !== 'string') throw new Error('Output is not JSON.');
  const text = context.getString(serialized);
  if (text.length > 1024) throw new Error('Output exceeds limit.');
  parentPort.postMessage({ ok: true, value: JSON.parse(text) });
} catch {
  parentPort.postMessage({ ok: false, error: 'Extension execution rejected or interrupted.' });
} finally {
  for (const handle of handles.reverse()) handle.dispose();
  context.dispose();
  runtime.dispose();
}
