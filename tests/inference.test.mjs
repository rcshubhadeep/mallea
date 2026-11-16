import test from 'node:test';
import assert from 'node:assert/strict';
import {chat,InferenceError} from '../scripts/lib/inference.mjs';

test('HTTP failures expose status/category without echoing untrusted response bodies',async()=>{
 const original=globalThis.fetch;
 try{
  for(const [status,kind]of [[401,'authentication'],[403,'authentication'],[402,'quota'],[429,'rate_limit'],[503,'unavailable'],[400,'request']]){
   globalThis.fetch=async()=>new Response(JSON.stringify({error:{message:'SECRET_KEY private-endpoint.example provider internal details'}}),{status});
   await assert.rejects(chat({endpoint:'https://example.invalid',key:'SECRET_KEY',model:'test'},[]),error=>{
    assert(error instanceof InferenceError);assert.equal(error.kind,kind);assert.equal(error.status,status);
    assert(!/SECRET_KEY|private-endpoint|provider internal/.test(error.message));return true;
   });
  }
  globalThis.fetch=async()=>{throw new Error('SECRET_KEY in raw network exception');};
  await assert.rejects(chat({endpoint:'https://example.invalid',key:'SECRET_KEY',model:'test'},[]),error=>error.kind==='network'&&!error.message.includes('SECRET_KEY'));
 }finally{globalThis.fetch=original;}
});

test('compatible transport forwards exact model/tools, preserves calls and bounds response bytes',async()=>{
 const original=globalThis.fetch,tools=[{type:'function',function:{name:'lookup_api',parameters:{type:'object'}}}];let sent;
 try{
  globalThis.fetch=async(url,options)=>{sent={url,options,body:JSON.parse(options.body)};return new Response(JSON.stringify({choices:[{finish_reason:'tool_calls',message:{content:null,tool_calls:[{id:'one',type:'function',function:{name:'lookup_api',arguments:'{}'}}]}}],usage:{total_tokens:10,private:'omit'}}));};
  const result=await chat({endpoint:new URL('https://example.invalid/v1/chat/completions'),key:'TEST_SECRET',model:'vendor/exact-id'},[{role:'user',content:'Lookup'}],{tools,tool_choice:'auto'});
  assert.equal(sent.body.model,'vendor/exact-id');assert.deepEqual(sent.body.tools,tools);assert.equal(sent.options.redirect,'error');assert.equal(result.choice.message.tool_calls[0].function.name,'lookup_api');assert.deepEqual(result.usage,{total_tokens:10});
  globalThis.fetch=async()=>new Response(' '.repeat(2_000_001));await assert.rejects(chat({endpoint:'https://example.invalid',key:'TEST_SECRET',model:'test'},[]),e=>e instanceof InferenceError&&e.kind==='response');
 }finally{globalThis.fetch=original;}
});


test('Core environment has one model, ignores old profiles and never falls back',async()=>{
 const {inferenceConfig}=await import('../scripts/lib/inference.mjs');
 const names=['MALLEA_BASE_URL','MALLEA_API_KEY','MALLEA_MODEL','DEV_BASE_URL','DEV_API_KEY','DEV_MODEL','PROD_BASE_URL','PROD_LLM_KEY','PROD_MODEL'];
 const saved=Object.fromEntries(names.map(n=>[n,process.env[n]]));
 try{
  for(const n of names)delete process.env[n];
  Object.assign(process.env,{DEV_BASE_URL:'https://old-dev.invalid/v1',DEV_API_KEY:'old-dev-key',DEV_MODEL:'old-dev-model',PROD_BASE_URL:'https://old-prod.invalid/v1',PROD_LLM_KEY:'old-prod-key',PROD_MODEL:'old-prod-model'});
  assert.throws(()=>inferenceConfig(),/MALLEA_/);
  Object.assign(process.env,{MALLEA_BASE_URL:'https://example.com/v1',MALLEA_API_KEY:'core-only-key',MALLEA_MODEL:'vendor/exact-model'});
  const config=inferenceConfig();assert.equal(config.model,'vendor/exact-model');assert.equal(config.key,'core-only-key');assert.equal(config.endpoint.href,'https://example.com/v1/chat/completions');
  delete process.env.MALLEA_MODEL;assert.throws(()=>inferenceConfig(),/MALLEA_MODEL/);
 }finally{for(const n of names)if(saved[n]===undefined)delete process.env[n];else process.env[n]=saved[n];}
});
