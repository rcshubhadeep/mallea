import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
if (!['dev', 'build'].includes(args[0]) || args.length !== 1) {
  console.error('Usage: npm run desktop -- dev|build'); process.exit(1);
}
const cli = fileURLToPath(new URL('../node_modules/@tauri-apps/cli/tauri.js', import.meta.url));
const child = spawn(process.execPath, [cli, ...args], {
  cwd: fileURLToPath(new URL('../apps/desktop', import.meta.url)), stdio: 'inherit', windowsHide: true,
});
child.on('error', () => { console.error('Could not start desktop CLI.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
