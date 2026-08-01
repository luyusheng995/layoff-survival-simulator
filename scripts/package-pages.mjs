import { copyFile, cp, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createPagesPackageManifest } from '../src/game/pages-package.js';

const root = new URL('../', import.meta.url);
const manifest = createPagesPackageManifest();
const outputRoot = new URL(`../${manifest.outputDir}/`, import.meta.url);

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const entry of manifest.entries) {
  await copyEntry(entry);
}

await writeFile(new URL('.nojekyll', outputRoot), '', 'utf8');
await writeFile(
  new URL('pages-manifest.json', outputRoot),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

console.log(`GitHub Pages package created: ${manifest.outputDir}`);

async function copyEntry(entry) {
  const source = new URL(entry.from, root);
  const target = new URL(entry.to, outputRoot);
  const sourceStat = await stat(source);

  if (entry.kind === 'file') {
    if (!sourceStat.isFile()) {
      throw new Error(`Pages package expected file: ${entry.from}`);
    }
    await mkdir(new URL(`${dirname(entry.to)}/`, outputRoot), { recursive: true });
    await copyFile(source, target);
    return;
  }

  if (entry.kind === 'directory') {
    if (!sourceStat.isDirectory()) {
      throw new Error(`Pages package expected directory: ${entry.from}`);
    }
    await cp(source, target, { recursive: true });
    return;
  }

  throw new Error(`Unsupported Pages package entry kind: ${entry.kind}`);
}

