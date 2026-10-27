import { defineConfig } from 'vite';
export default defineConfig({ root: 'apps/web', server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': {target:'http://127.0.0.1:4318',ws:true} } }, esbuild: { jsx: 'automatic' } });
