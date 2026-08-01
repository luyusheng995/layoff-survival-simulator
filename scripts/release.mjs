import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createReleaseManifest, createReleaseReadme, createStoredZip } from '../src/game/release-package.js';

const root = new URL('../', import.meta.url);
const releaseDir = new URL('../release/', import.meta.url);
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const config = JSON.parse(await readFile(new URL('../dist/game-config.json', import.meta.url), 'utf8'));
const includePaths = [
  'index.html',
  'package.json',
  'src',
  'scripts/server.mjs',
  'scripts/simulate.mjs',
  'scripts/export-config.mjs',
  'scripts/smoke.mjs',
  'dist/game-config.json',
  'docs/delivery',
  'balance'
];

const files = await collectFiles(includePaths);
const manifest = createReleaseManifest(config, {
  version: packageJson.version,
  files: files.map((file) => ({ path: file.path, bytes: file.content.length }))
});
const archiveEntries = files.map((file) => ({
  path: `${manifest.packageName}/${file.path}`,
  content: file.content
}));
const zip = createStoredZip(archiveEntries);
const readme = createReleaseReadme(manifest);

await mkdir(releaseDir, { recursive: true });
await writeFile(new URL(manifest.archiveName, releaseDir), zip);
await writeFile(
  new URL(`${manifest.packageName}-manifest.json`, releaseDir),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);
await writeFile(new URL('README.md', releaseDir), readme, 'utf8');

console.log(`Release package created: release/${manifest.archiveName}`);
console.log(`Release manifest created: release/${manifest.packageName}-manifest.json`);
console.log(`Release README created: release/README.md`);

async function collectFiles(paths) {
  const collected = [];
  for (const path of paths) {
    await collectPath(path, collected);
  }
  return collected.sort((a, b) => a.path.localeCompare(b.path));
}

async function collectPath(path, collected) {
  const url = new URL(path, root);
  const itemStat = await stat(url);
  if (itemStat.isDirectory()) {
    const names = await readdir(url);
    for (const name of names) {
      await collectPath(`${path}/${name}`, collected);
    }
    return;
  }

  collected.push({
    path: path.replaceAll('\\', '/'),
    content: await readFile(url)
  });
}
