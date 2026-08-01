import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createDeliveryMarkdown, createGameConfig } from '../src/game/config-export.js';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const config = createGameConfig({ version: packageJson.version });
const markdown = createDeliveryMarkdown(config);

await mkdir(new URL('../dist/', import.meta.url), { recursive: true });
await mkdir(new URL('../docs/delivery/', import.meta.url), { recursive: true });

await writeFile(
  new URL('../dist/game-config.json', import.meta.url),
  `${JSON.stringify(config, null, 2)}\n`,
  'utf8'
);
await writeFile(
  new URL('../docs/delivery/game-config.md', import.meta.url),
  markdown,
  'utf8'
);

console.log(`Exported ${config.eventStats.total} events, ${config.endings.length} endings, ${config.adPlacements.length} ad placements.`);
