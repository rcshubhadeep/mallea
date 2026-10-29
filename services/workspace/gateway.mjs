import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { z } from 'zod';
import { observationCapability } from '../../apps/definitions/index.mjs';

export function createGateway(registry,capabilities=[]){
  function server(session){
    const mcp=new McpServer({name:'mallea-workspace',version:'0.2.0'});
    mcp.registerTool('read_observation',{
      description:observationCapability.description,
      inputSchema:{targetAppId:z.string().min(3).max(61),observationId:z.string().min(1).max(100)},
    },async({targetAppId,observationId})=>{
      try{const value=await registry.read(session,targetAppId,observationId);return {content:[{type:'text',text:JSON.stringify(value)}]};}
      catch(error){return {isError:true,content:[{type:'text',text:error.message}]};}
    });
    for(const capability of capabilities)mcp.registerTool(capability.name,{description:capability.description,inputSchema:z.object({targetAppId:z.string().min(3).max(61),arguments:capability.schema}).strict()},async input=>{
      try{return {content:[{type:'text',text:JSON.stringify(await registry.readRegistered(session,input.targetAppId,capability.name,input.arguments))}]};}catch(error){return {isError:true,content:[{type:'text',text:error.message}]};}
    });return mcp;
  }
  async function withClient(session,action){
    const mcp=server(session);const client=new Client({name:'mallea-runtime',version:'0.2.0'});const [a,b]=InMemoryTransport.createLinkedPair();
    try{await mcp.connect(b);await client.connect(a);return await action(client);}finally{await client.close();await mcp.close();}
  }
  return {
    discover:session=>withClient(session,async client=>({tools:(await client.listTools()).tools,instances:registry.list(session)})),
    read:(session,targetAppId,observationId)=>withClient(session,async client=>{
      const result=await client.callTool({name:'read_observation',arguments:{targetAppId,observationId}});
      if(result.isError)throw new Error(result.content[0].text);return JSON.parse(result.content[0].text);
    }),
    invoke:(session,targetAppId,name,args)=>withClient(session,async client=>{const result=await client.callTool({name,arguments:{targetAppId,arguments:args}});if(result.isError)throw new Error(result.content[0].text);return JSON.parse(result.content[0].text);}),
    async http(session,req,res,body){
      const mcp=server(session),transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
      try{await mcp.connect(transport);res.on('close',()=>{void transport.close();void mcp.close();});await transport.handleRequest(req,res,body);}
      catch(error){await transport.close();await mcp.close();throw error;}
    },
  };
}
