export function inferenceConfig(production = false, {allowMissingKey=false} = {}) {
  const names = production
    ? { key: 'PROD_LLM_KEY', base: 'PROD_BASE_URL', model: 'PROD_MODEL' }
    : { key: 'DEV_API_KEY', base: 'DEV_BASE_URL', model: 'DEV_MODEL' };
  for (const name of Object.values(names)) {
    if ((!allowMissingKey||name!==names.key)&&!process.env[name]?.trim()) throw new Error(`Missing configuration: ${name}`);
  }
  let endpoint;
  try { endpoint = new URL(process.env[names.base]); }
  catch { throw new Error('Invalid API base URL.'); }
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error('Use an HTTPS API base URL without credentials, query, or fragment.');
  }
  // Accept either an API root or a full endpoint copied from a working example.
  const root = endpoint.pathname.replace(/\/+$/, '').replace(/\/(?:responses|chat\/completions)$/, '');
  endpoint.pathname = `${root}/chat/completions`;
  return { endpoint, key: process.env[names.key]??'', model: process.env[names.model] };
}

export class InferenceError extends Error {
  constructor(kind, status) {
    const messages = {
      timeout: 'The model did not respond within 60 seconds. Try again; no automatic retry was made.',
      cancelled: 'Model request cancelled.',
      network: 'Could not reach the inference service. Check connectivity and try again.',
      authentication: 'The inference service rejected authentication. Check the selected API key.',
      quota: 'The inference service reported insufficient credit or quota. Check the selected account.',
      rate_limit: 'The inference service rate-limited this request. Wait before trying again.',
      unavailable: 'The inference service is temporarily unavailable. Try again later.',
      request: 'The inference service rejected the request. Check the selected model and API configuration.',
      response: 'The inference service returned an invalid response. No Surface was installed.',
    };
    super(messages[kind] ?? messages.request);
    this.name = 'InferenceError'; this.kind = kind; this.status = status;
  }
}

export async function chat(config, messages, options = {}, signal) {
  let response;
  const requestSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000);
  try {
    response = await fetch(config.endpoint, {
      method: 'POST', redirect: 'error', signal: requestSignal,
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages, max_tokens: 512, stream: false, ...options }),
    });
  } catch { throw new InferenceError(signal?.aborted ? 'cancelled' : requestSignal.aborted ? 'timeout' : 'network'); }
  if (!response.ok) {
    const status = response.status;
    await response.body?.cancel();
    throw new InferenceError([401,403].includes(status) ? 'authentication' : status===402 ? 'quota' : status===429 ? 'rate_limit' : status>=500 ? 'unavailable' : 'request', status);
  }
  let result;
  try { result = await response.json(); }
  catch { throw new InferenceError(signal?.aborted ? 'cancelled' : requestSignal.aborted ? 'timeout' : 'response'); }
  if (!result.choices?.[0]?.message) throw new InferenceError('response');
  const usage = {};
  for (const field of ['prompt_tokens', 'completion_tokens', 'total_tokens', 'cost']) {
    if (typeof result.usage?.[field] === 'number') usage[field] = result.usage[field];
  }
  return { choice: result.choices[0], usage };
}

// Image generation is a separately enabled production capability: PROD_IMAGE_MODEL must be set; there is no dev fallback.
export function imageConfig() {
  const model = process.env.PROD_IMAGE_MODEL?.trim();
  if (!model) return null;
  const { endpoint, key } = inferenceConfig(true);
  endpoint.pathname = endpoint.pathname.replace(/\/chat\/completions$/, '/responses');
  return { endpoint, key, model };
}

const imageTypes = [['image/webp', b => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP'], ['image/png', b => b[0] === 0x89 && b.subarray(1, 4).toString() === 'PNG'], ['image/jpeg', b => b[0] === 0xff && b[1] === 0xd8]];
export async function generateImage(config, prompt, signal) {
  let response;
  const requestSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(120_000)]) : AbortSignal.timeout(120_000);
  try {
    response = await fetch(config.endpoint, { method: 'POST', redirect: 'error', signal: requestSignal, headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: config.model, input: prompt }) });
  } catch { throw new InferenceError(signal?.aborted ? 'cancelled' : requestSignal.aborted ? 'timeout' : 'network'); }
  if (!response.ok) { const status = response.status; await response.body?.cancel(); throw new InferenceError([401, 403].includes(status) ? 'authentication' : status === 402 ? 'quota' : status === 429 ? 'rate_limit' : status >= 500 ? 'unavailable' : 'request', status); }
  let result;
  try { result = await response.json(); } catch { throw new InferenceError('response'); }
  const encoded = result.output?.find(o => o.type === 'image_generation_call' && typeof o.result === 'string')?.result;
  const bytes = encoded ? Buffer.from(encoded, 'base64') : null;
  const type = bytes && bytes.length <= 4_000_000 ? imageTypes.find(([, test]) => test(bytes))?.[0] : null;
  if (!type) throw new InferenceError('response');
  return { type, bytes, usage: { total_tokens: result.usage?.total_tokens } };
}

// One house style keeps generated icons consistent across apps.
export function iconPrompt(name, purpose, colour) {
  return `A polished desktop app icon for an app named "${name}": ${purpose}. Full-bleed square artwork: a soft ${colour} gradient fills the entire canvas edge to edge, with one simple, bold symbolic glyph centred on it with generous padding and gentle depth. Do not draw a rounded tile, frame, outer margin, drop shadow around the canvas or border; the platform applies its own mask. Modern flat vector style, clean edges, harmonious muted palette, high contrast glyph. No text, no letters, no words, no photograph, no busy detail.`;
}
