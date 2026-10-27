// One bounded development-only request. No dependencies or automatic retries.
const required = ['DEV_API_KEY', 'DEV_BASE_URL', 'DEV_MODEL'];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing configuration: ${missing.join(', ')}`);
  process.exit(1);
}

async function main() {
  let endpoint;
  try {
    endpoint = new URL(`${process.env.DEV_BASE_URL.replace(/\/+$/, '')}/chat/completions`);
  } catch {
    throw new Error('DEV_BASE_URL must be a valid API base URL.');
  }
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error('Use an HTTPS API base URL without embedded credentials, query, or fragment.');
  }
  const started = performance.now();
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(60_000),
      headers: {
        Authorization: `Bearer ${process.env.DEV_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEV_MODEL,
        messages: [{ role: 'user', content: 'Reply with exactly MALLEA_OK and nothing else.' }],
        max_tokens: 512,
        stream: false,
      }),
    });
  } catch {
    throw new Error('Request failed or timed out. Check network access and endpoint configuration. No retry was made.');
  }
  if (!response.ok) {
    // Raw error bodies can contain infrastructure details or sensitive request data.
    throw new Error(`Inference returned HTTP ${response.status}. Check credentials, model access, quota, and API path. No retry was made.`);
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('Endpoint did not return JSON.'); }
  const content = result.choices?.[0]?.message?.content;
  const passed = typeof content === 'string' && content.trim() === 'MALLEA_OK';
  const usage = {};
  for (const field of ['prompt_tokens', 'completion_tokens', 'total_tokens', 'cost']) {
    if (typeof result.usage?.[field] === 'number') usage[field] = result.usage[field];
  }
  console.log(JSON.stringify({
    status: passed ? 'PASS' : 'FAIL',
    expected_response_matched: passed,
    finish_reason: ['stop', 'length', 'tool_calls', 'content_filter'].includes(result.choices?.[0]?.finish_reason)
      ? result.choices[0].finish_reason : 'other',
    elapsed_ms: Math.round(performance.now() - started),
    usage,
  }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
