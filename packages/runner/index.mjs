import { Worker } from 'node:worker_threads';
import { validateArtifact, validateInputs, validateOutput } from './contract.mjs';

export async function runReview(artifact, task, observation) {
  validateArtifact(artifact);
  validateInputs(task, observation);
  // Explicit projection prevents extra app data from entering the interpreter.
  const workerData = { source: artifact.source,
    task: { critical: task.critical, reviewedRevision: task.reviewedRevision },
    observation: { revision: observation.revision } };
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker.mjs', import.meta.url), {
      workerData, env: {}, resourceLimits: { maxOldGenerationSizeMb: 32 },
    });
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      error ? reject(error) : resolve(value);
    };
    const timer = setTimeout(() => finish(new Error('Extension exceeded worker deadline.')), 2000);
    worker.once('error', () => finish(new Error('Extension worker failed.')));
    worker.once('exit', () => finish(new Error('Extension worker exited without a result.')));
    worker.once('message', (message) => {
      if (!message.ok) return finish(new Error(message.error));
      try { finish(null, validateOutput(message.value)); }
      catch (error) { finish(error); }
    });
  });
}
