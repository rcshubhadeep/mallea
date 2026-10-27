export function packageFixture(policy = 'block-all', version = '1.0.0') {
  return {
    manifest: { id: 'evidence-review', title: 'Evidence review', version, sdkVersion: '0.2', slot: 'task.details', permissions: ['observations.read', 'reviews.write'] },
    policy,
    source: `export function review(t,o){return {status:t.reviewedRevision>=o.revision?'clear':${policy === 'block-all' ? "'blocked'" : "t.critical?'blocked':'warning'"},label:'Review evidence'}}`,
    ui: { tag: 'section', children: [{tag:'h2',text:'Evidence review'}, { tag:'img',bind:'observation.screenshot' }, {tag:'p',bind:'observation.text'}, {tag:'p',bind:'review.label'}, {tag:'button',text:'Acknowledge evidence',action:'review.acknowledge'}] },
  };
}
