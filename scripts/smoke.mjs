import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createReleaseChecklist, createReleaseChecklistMarkdown } from '../src/game/release-checklist.js';

const root = new URL('../', import.meta.url);
const requiredFiles = [
  'index.html',
  'package.json',
  'src/main.js',
  'src/data/events.js',
  'dist/game-config.json',
  'docs/delivery/game-config.md'
];

for (const file of requiredFiles) {
  await access(new URL(file, root));
}

const config = JSON.parse(await readFile(new URL('dist/game-config.json', root), 'utf8'));
const result = createReleaseChecklist(config, { requiredFiles });
const markdown = createReleaseChecklistMarkdown(result);

await mkdir(new URL('docs/delivery/', root), { recursive: true });
await writeFile(new URL('docs/delivery/release-checklist.md', root), markdown, 'utf8');

if (!result.passed) {
  console.error('Release smoke failed.');
  console.error(markdown);
  process.exit(1);
}

console.log(`Release smoke passed: ${result.checks.length} checks.`);
