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
