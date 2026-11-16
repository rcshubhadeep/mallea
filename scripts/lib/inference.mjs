export function chatEndpoint(value){
 let endpoint;try{endpoint=new URL(value);}catch{throw new Error('Invalid API base URL.');}
 if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw new Error('Use an HTTPS API base URL without credentials, query, or fragment.');
 const root=endpoint.pathname.replace(/\/+$/,'').replace(/\/(?:responses|chat\/completions)$/,'');endpoint.pathname=root+'/chat/completions';return endpoint;
}
export function inferenceConfig({allowMissingKey=false} = {}) {
  const names = { key: 'MALLEA_API_KEY', base: 'MALLEA_BASE_URL', model: 'MALLEA_MODEL' };
  for (const name of Object.values(names)) {
    if ((!allowMissingKey||name!==names.key)&&!process.env[name]?.trim()) throw new Error(`Missing configuration: ${name}`);
  }
  const endpoint=chatEndpoint(process.env[names.base]);
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
  try {
    const reader=response.body?.getReader();if(!reader)throw new Error('Missing response body.');
    const chunks=[];let size=0;try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2_000_000){await reader.cancel();throw new Error('Response limit exceeded.');}chunks.push(value);}}finally{reader.releaseLock();}
    result=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  catch { throw new InferenceError(signal?.aborted ? 'cancelled' : requestSignal.aborted ? 'timeout' : 'response'); }
  if (!result.choices?.[0]?.message) throw new InferenceError('response');
  const usage = {};
  for (const field of ['prompt_tokens', 'completion_tokens', 'total_tokens', 'cost']) {
    if (typeof result.usage?.[field] === 'number') usage[field] = result.usage[field];
  }
  return { choice: result.choices[0], usage };
}
