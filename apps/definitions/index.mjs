import { reviewAuthoring, verifyReviewPanel } from './review.mjs';
export const observationCapability = {
  name:'read_observation', version:'1.0',
  description:'Read a permitted playtest observation and its approved screenshot from a connected notebook. The owner, observation ID, and revision identify the evidence. Requires explicit observations.read access; discovery alone grants no access.',
  inputSchema:{type:'object',properties:{targetAppId:{type:'string'},observationId:{type:'string'}},required:['targetAppId','observationId'],additionalProperties:false},
};
export const definitions = {
  board: {kind:'board',title:'Production board',purpose:'Owns release tasks, evidence links, criticality, and review acknowledgements.',
    slots:['task.details'],resources:['linked evidence via read_observation'],actions:['reviews.write','task.critical'],provides:[],authoring:reviewAuthoring,verify:verifyReviewPanel,
    initialRequest:'Create an evidence review panel using the linked notebook screenshot and observation. Include acknowledgement and block every unreviewed task.'},
  notebook: {kind:'notebook',title:'Playtest notebook',purpose:'Owns playtest observations, screenshots, and evidence revisions. Publishes approved evidence to connected apps.',
    slots:['task.details'],resources:['own observations'],actions:['observations.write','reviews.write'],provides:[observationCapability],authoring:reviewAuthoring,verify:verifyReviewPanel,
    initialRequest:'Create a panel for my selected playtest observation with its screenshot and acknowledgement. Block unreviewed evidence.'},
};
export function appDefinition(kind) { const definition=definitions[kind]; if(!definition)throw new Error('Unknown app type.'); return definition; }
export function describeApp(app) {
  const { verify, ...definition }=appDefinition(app.kind);
  return {id:app.id,workspaceId:app.workspaceId,...definition};
}
