import test from 'node:test';
import assert from 'node:assert/strict';
import { compilePanel } from '../packages/sdk/document.mjs';
import { packageFixture } from './helpers.mjs';
test('UI compilation escapes model text and restricts script/network policy',()=>{
 const p=packageFixture();p.ui.children[0].text='</script><script>alert(1)</script>';
 const doc=compilePanel(p);assert.match(doc.html,/&lt;script&gt;/);assert.equal((doc.html.match(/<script /g)??[]).length,1);assert.match(doc.html,/connect-src 'none'/);assert.match(doc.html,/event.source!==parent/);
});
