import { simulateRuns } from '../src/game/simulator.js';

function argValue(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || index === process.argv.length - 1) return fallback;
  return Number(process.argv[index + 1]);
}

function stringArgValue(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1 || index === process.argv.length - 1) return fallback;
  return process.argv[index + 1];
}

const runs = argValue('runs', 1000);
const seed = argValue('seed', 20260731);
const difficultyId = stringArgValue('difficulty', 'normal');
const summary = simulateRuns({ runs, seed, difficultyId });
console.log(JSON.stringify(summary, null, 2));
