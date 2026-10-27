import { randomUUID } from 'node:crypto';
import { validatePackage } from './package.mjs';
const escape = text => String(text).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function compilePanel(artifact, channel = randomUUID()) {
  validatePackage(artifact);
  const nonce = randomUUID().replaceAll('-','');
  function render(node) {
    const style = Object.entries(node.style ?? {}).map(([k,v])=>`${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${v}`).join(';');
    const attrs = `${style ? ` style="${escape(style)}"` : ''}${node.bind ? ` data-bind="${escape(node.bind)}"` : ''}${node.action ? ` data-action="${escape(node.action)}"` : ''}${node.tag==='img' ? ' alt="Playtest evidence screenshot"' : ''}${node.tag==='button' ? ' type="button"' : ''}`;
    return `<${node.tag}${attrs}>${escape(node.text ?? '')}${(node.children ?? []).map(render).join('')}${['img','hr'].includes(node.tag)?'':`</${node.tag}>`}`;
  }
  // Only this host-authored script executes in the opaque-origin frame.
  const script = `const channel=${JSON.stringify(channel)};let snapshot=null;
    function height(){parent.postMessage({type:'height',channel,height:document.body.scrollHeight},'*')}
    addEventListener('message',event=>{if(event.source!==parent||event.data?.channel!==channel||event.data.type!=='snapshot')return;snapshot=event.data.value;
      for(const el of document.querySelectorAll('[data-bind]')){const [a,b]=el.dataset.bind.split('.');const value=snapshot?.[a]?.[b];
        if(el.tagName==='IMG'){if(typeof value==='string'&&value.startsWith('data:image/'))el.src=value}else el.textContent=String(value??'')}
      for(const el of document.querySelectorAll('[data-action]'))el.disabled=!snapshot?.canAcknowledge;
      height()});
    document.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button||!snapshot||button.disabled)return;
      parent.postMessage({type:'action',channel,action:button.dataset.action,taskId:snapshot.task.id,revision:snapshot.observation.revision},'*')});
    new ResizeObserver(height).observe(document.body);parent.postMessage({type:'ready',channel},'*');`;
  return { channel, html:`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>body{font:14px/1.6 system-ui,sans-serif;color:#304137;margin:0;padding:18px;overflow-wrap:anywhere}*{box-sizing:border-box}img{display:block;width:100%;border-radius:8px}button{font:inherit;padding:10px 15px;background:#304c38;color:white;border:0;border-radius:7px;cursor:pointer}button:disabled{opacity:.45;cursor:default}[data-bind="review.status"]{white-space:nowrap;flex-shrink:0}h2,h3{line-height:1.3}hr{border:0;border-top:1px solid #ddd}</style></head><body>${render(artifact.ui)}<script nonce="${nonce}">${script}</script></body></html>` };
}
