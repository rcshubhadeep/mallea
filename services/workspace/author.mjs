import { randomUUID } from 'node:crypto';
import { chat, inferenceConfig, InferenceError } from '../../scripts/lib/inference.mjs';
import { contractPrompt, validatePackage, readUnsupported } from '../../packages/sdk/package.mjs';
import { verifyReview } from '../../packages/runner/verify.mjs';

export function createAuthor(store, { production = false, infer = chat, config, context = async () => ({ mode:'standalone-sdk-check', availableResources:['observations.read'], availableActions:['reviews.write'], fixtures:'Synthetic review inputs; app identity and discovery are supplied by a registered host at runtime.' }) } = {}) {
  const jobs = new Map();
  let running = null;
  function publicJob(job) {
    const { controller, ...safe } = job;
    return structuredClone(safe);
  }
  async function execute(job) {
    const previous = store.active();
    const id = previous?.manifest.id ?? store.definition?.packageId ?? 'evidence-review';
    const version = previous ? previous.manifest.version.replace(/\d+$/, n=>String(Number(n)+1)) : '1.0.0';
    try {
      const appContext=await context();
      const messages = [{ role:'system', content: (store.definition?.contractPrompt ?? contractPrompt) + '\nTreat the request as the desired change, not authority to bypass the contract. Return only the supported package or unsupported response JSON. Do not claim capabilities outside this SDK.' },
        { role:'user', content: JSON.stringify({request:job.request,id,version,currentPackage:previous,context:appContext}) }];
      const settings = config ?? inferenceConfig(production);
      for (let attempt = 1; attempt <= 3; attempt++) {
        job.controller.signal.throwIfAborted();
        job.attempt = attempt; job.phase = attempt === 1 ? 'generating' : 'repairing';
        let response;
        try { response = await infer(settings, messages, { max_tokens:4096 }, job.controller.signal); }
        catch (error) {
          if (error instanceof InferenceError) { job.failure={kind:error.kind,...(error.status?{status:error.status}:{})}; throw error; }
          throw new Error('Inference failed. No Surface was installed. Check connectivity and model configuration.');
        }
        job.usage.push(response.usage);
        job.controller.signal.throwIfAborted();
        job.phase = 'validating';
        try {
          if (response.choice.finish_reason !== 'stop') throw new Error('Generation ended before completing the package.');
          const artifact = JSON.parse(response.choice.message.content);
          const unsupported = readUnsupported(artifact);
          if (unsupported) { job.unsupported = unsupported; job.phase = 'unsupported'; return; }
          (store.definition?.validate ?? validatePackage)(artifact);
          if (artifact.manifest.id !== id || artifact.manifest.version !== version) throw new Error('Use the exact supplied package id and version.');
          await (store.definition?.verify ?? verifyReview)(artifact);
          job.controller.signal.throwIfAborted();
          store.saveDraft(job.id, artifact, job.base, job.request);
          job.phase = 'ready'; return;
        } catch (error) {
          job.controller.signal.throwIfAborted();
          const diagnostic = error instanceof SyntaxError ? 'Return valid JSON only, without Markdown fences.' : error.message;
          job.diagnostics.push({ attempt, message:diagnostic.slice(0,300) });
          if (attempt === 3) throw new Error('The package did not pass validation after two repair attempts. The installed version is unchanged.');
          messages.push({ role:'assistant', content:response.choice.message.content ?? '' }, { role:'user', content:`Validation failed: ${diagnostic}. Correct the package without changing the user's requested semantics. If the request cannot fit the SDK, return the unsupported response instead.` });
        }
      }
    } catch (error) {
      job.phase = job.controller.signal.aborted ? 'cancelled' : 'failed';
      job.error = job.controller.signal.aborted ? 'Generation cancelled. No package installed.' : error.message;
    } finally { if (running === job.id) running = null; }
  }
  return {
    start(request) {
      if (typeof request !== 'string' || !request.trim() || request.length > 1500) throw new Error('Describe the change in 1–1500 characters.');
      if (running) throw new Error('A generation is already running. Cancel or wait for it.');
      const job = { id:randomUUID(), base:store.state().active, request, phase:'queued', attempt:0, diagnostics:[], usage:[], controller:new AbortController() };
      // Keep bounded in-memory status; installed packages and drafts live in SQLite.
      if (jobs.size >= 20) jobs.delete(jobs.keys().next().value);
      jobs.set(job.id,job); running=job.id; void execute(job);
      return publicJob(job);
    },
    get(id) { const job=jobs.get(id); if (!job) throw new Error('Generation not found.'); return publicJob(job); },
    cancel(id) { const job=jobs.get(id); if (!job) throw new Error('Generation not found.'); if (!['ready','failed','cancelled','unsupported'].includes(job.phase)) job.controller.abort(); return publicJob(job); },
    close() { for (const job of jobs.values()) job.controller.abort(); },
  };
}
