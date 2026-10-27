export function inferenceConfig(production = false) {
  const names = production
    ? { key: 'PROD_LLM_KEY', base: 'PROD_BASE_URL', model: 'PROD_MODEL' }
    : { key: 'DEV_API_KEY', base: 'DEV_BASE_URL', model: 'DEV_MODEL' };
  for (const name of Object.values(names)) {
    if (!process.env[name]?.trim()) throw new Error(`Missing configuration: ${name}`);
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
  return { endpoint, key: process.env[names.key], model: process.env[names.model] };
}

export async function chat(config, messages, options = {}, signal) {
  let response;
  try {
    response = await fetch(config.endpoint, {
      method: 'POST', redirect: 'error', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(60_000)]) : AbortSignal.timeout(60_000),
      headers: { Authorization: `Bearer ${config.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: config.model, messages, max_tokens: 512, stream: false, ...options }),
    });
  } catch { throw new Error('Network request failed or timed out. No automatic retry.'); }
  if (!response.ok) {
    let detail = '';
    try {
      const failure = await response.json();
      detail = typeof failure.error?.message === 'string' ? failure.error.message : '';
      for (const value of Object.values(process.env)) {
        if (value && value.length >= 6) detail = detail.split(value).join('[redacted]');
      }
      detail = detail.replace(/https?:\/\/\S+/g, '[endpoint]').slice(0, 400);
    } catch { /* Keep the HTTP status if the body cannot be decoded. */ }
    throw new Error(`Inference returned HTTP ${response.status}. ${detail} No automatic retry.`);
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('Endpoint did not return JSON.'); }
  if (!result.choices?.[0]?.message) throw new Error('Missing assistant message.');
  const usage = {};
  for (const field of ['prompt_tokens', 'completion_tokens', 'total_tokens', 'cost']) {
    if (typeof result.usage?.[field] === 'number') usage[field] = result.usage[field];
  }
  return { choice: result.choices[0], usage };
}
