import { copyFile, cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const publicExtensions = new Set(['.css', '.html', '.js', '.svg', '.webmanifest']);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile() || !publicExtensions.has(extname(entry.name))) continue;
  await copyFile(join(root, entry.name), join(output, entry.name));
}

await cp(join(root, 'assets'), join(output, 'assets'), { recursive: true });

for (const required of ['index.html', 'manifest.webmanifest', 'sw.js']) {
  await stat(join(output, required));
}

console.log('Static assets prepared in dist/.');
