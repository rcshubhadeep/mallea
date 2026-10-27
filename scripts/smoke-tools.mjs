import { randomUUID } from 'node:crypto';
import { chat, inferenceConfig } from './lib/inference.mjs';

// Explicit environment selection, two requests maximum; no retries or fallback.
const flags = process.argv.slice(2);
if (flags.some((flag) => flag !== '--production') || flags.length > 1) {
  console.error('Usage: smoke-tools.mjs [--production]');
  process.exit(1);
}
let config;

const usage = [];
async function request(messages, options) {
  const result = await chat(config, messages, options);
  usage.push(result.usage);
  return result.choice;
}

async function main() {
  config = inferenceConfig(flags.includes('--production'));
  const started = performance.now();
  const messages = [{ role: 'user', content: 'Look up observation obs-demo-1 using the available tool. Then reply with only JSON containing observation_id, revision, and receipt copied exactly from its result. Do not invent these values.' }];
  const tools = [{ type: 'function', function: {
    name: 'read_observation',
    description: 'Read the current revision and fresh receipt for a synthetic playtest observation.',
    parameters: {
      type: 'object', properties: { observation_id: { type: 'string', enum: ['obs-demo-1'] } },
      required: ['observation_id'], additionalProperties: false,
    },
  } }];
  const first = await request(messages, { tools, tool_choice: 'auto' });
  const calls = first.message.tool_calls;
  if (first.finish_reason !== 'tool_calls' || !Array.isArray(calls) || calls.length !== 1) {
    throw new Error('Expected exactly one model-selected tool call.');
  }
  const call = calls[0];
  if (call.type !== 'function' || call.function?.name !== 'read_observation' || typeof call.id !== 'string' || !call.id) {
    throw new Error('Tool call failed the allowlist or identifier check.');
  }
  let args;
  try { args = JSON.parse(call.function.arguments); }
  catch { throw new Error('Tool arguments were not JSON.'); }
  if (!args || Array.isArray(args) || Object.keys(args).length !== 1 || args.observation_id !== 'obs-demo-1') {
    throw new Error('Tool arguments failed validation; nothing executed.');
  }
  // A real local read-only handler. The receipt does not exist until execution,
  // so matching it in the final answer verifies use of the tool result.
  const observation = { observation_id: args.observation_id, revision: 7, receipt: randomUUID() };
  messages.push({ role: 'assistant', content: first.message.content ?? '', tool_calls: calls },
    { role: 'tool', tool_call_id: call.id, content: JSON.stringify(observation) });
  const second = await request(messages, { tools, tool_choice: 'auto' });
  let answer;
  try { answer = JSON.parse(second.message.content); }
  catch { throw new Error('Final answer was not the requested JSON.'); }
  const passed = second.finish_reason === 'stop' && !second.message.tool_calls?.length
    && answer && !Array.isArray(answer) && Object.keys(answer).length === 3
    && Object.entries(observation).every(([key, value]) => answer[key] === value);
  console.log(JSON.stringify({
    status: passed ? 'PASS' : 'FAIL', model_selected_tool: true,
    arguments_validated: true, local_handler_executed: true,
    final_result_verified: Boolean(passed), requests: usage.length,
    elapsed_ms: Math.round(performance.now() - started), usage,
  }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  console.log(JSON.stringify({ status: 'FAIL', completed_requests: usage.length, usage }, null, 2));
  process.exitCode = 1;
});
