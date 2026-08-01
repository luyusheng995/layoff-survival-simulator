import { mkdir, writeFile } from 'node:fs/promises';
import { createPlaytestMarkdown, runPlaytestScenarios } from '../src/game/playtest.js';

const report = runPlaytestScenarios();
const markdown = createPlaytestMarkdown(report);

await mkdir(new URL('../docs/qa/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/qa/m16-playtest-report.md', import.meta.url), markdown, 'utf8');

if (!report.passed) {
  console.error('Playtest QA failed.');
  console.error(markdown);
  process.exit(1);
}

console.log(`Playtest QA passed: ${report.scenarios.length} scenarios, ${report.findings.length} findings.`);
