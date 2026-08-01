import { ACTION_DEFS } from './constants.js';
import { applyAction } from './actions.js';
import { createInitialState } from './state.js';
import { pickEvent, applyEventChoice } from './events.js';
import { getFailure, getFinalEnding } from './endings.js';
import { reviveFromAd } from './ads.js';

export function createRng(seed = 1) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

export function simulateRuns({ runs = 1000, seed = 20260731, difficultyId = 'normal' } = {}) {
  const rng = createRng(seed);
  const outcomes = [];
  for (let i = 0; i < runs; i += 1) {
    outcomes.push(simulateOneRun(rng, difficultyId));
  }
  return summarize(outcomes, runs, difficultyId);
}

function simulateOneRun(rng, difficultyId) {
  let state = createInitialState({ difficultyId });
  let ending = null;
  let revived = false;

  while (!ending) {
    while (state.energy > 0) {
      state = applyAction(state, chooseAction(state, rng));
    }

    const event = pickEvent(state, rng);
    const choice = chooseChoice(event, state);
    state = applyEventChoice({ ...state, currentEventId: event.id }, event.id, choice.id);

    const failure = getFailure(state);
    if (failure && !revived) {
      state = reviveFromAd(state);
      revived = true;
    } else if (failure) {
      ending = failure;
    } else {
      ending = getFinalEnding(state);
    }
  }

  return { state, ending, revived };
}

function chooseAction(state, rng) {
  if (state.stats.performance < 42) return 'overtime';
  if (state.stats.hair < 36 || state.stats.dignity < 34) return 'slack_off';
  if (state.stats.savings < 2600) return 'side_hustle';
  if (state.hidden.landmine > 62) return 'alliance';
  const pool = ['overtime', 'manage_up', 'alliance', 'side_hustle', 'slack_off'];
  return pool[Math.floor(rng() * pool.length)];
}

function chooseChoice(event, state) {
  return [...event.choices].sort((a, b) => scoreChoice(b, state) - scoreChoice(a, state))[0];
}

function scoreChoice(choice, state) {
  let score = 0;
  for (const [key, value] of Object.entries(choice.effects)) {
    if (key === 'performance') score += value * (state.stats.performance < 45 ? 2.2 : 1);
    if (key === 'hair') score += value * (state.stats.hair < 45 ? 2.4 : 1);
    if (key === 'dignity') score += value * (state.stats.dignity < 45 ? 2.1 : 1);
    if (key === 'savings') score += value / 700;
    if (key === 'landmine') score -= value * (state.hidden.landmine > 55 ? 1.6 : 0.8);
  }
  return score;
}

function summarize(outcomes, runs, difficultyId) {
  const totals = {
    performance: 0,
    hair: 0,
    dignity: 0,
    savings: 0
  };
  const endingCounts = {};
  const failureCounts = {};
  let totalDays = 0;
  let revives = 0;
  let failures = 0;

  for (const outcome of outcomes) {
    totalDays += Math.min(outcome.state.day, 90);
    revives += outcome.revived ? 1 : 0;
    endingCounts[outcome.ending.id] = (endingCounts[outcome.ending.id] || 0) + 1;
    if (['fired_performance', 'hair_collapse', 'quit_naked', 'home_rent'].includes(outcome.ending.id)) {
      failureCounts[outcome.ending.id] = (failureCounts[outcome.ending.id] || 0) + 1;
      failures += 1;
    }
    for (const key of Object.keys(totals)) {
      totals[key] += outcome.state.stats[key];
    }
  }

  const averageDays = round(totalDays / runs);
  const reviveRate = round(revives / runs);
  const failureRate = round(failures / runs);
  return {
    runs,
    difficultyId,
    averageDays,
    reviveRate,
    failureRate,
    endingCounts,
    failureCounts,
    averageFinalStats: {
      performance: round(totals.performance / runs),
      hair: round(totals.hair / runs),
      dignity: round(totals.dignity / runs),
      savings: round(totals.savings / runs)
    },
    targetStatus: targetStatus({ averageDays, reviveRate, failureRate, failureCounts })
  };
}

function targetStatus({ averageDays, reviveRate, failureRate, failureCounts }) {
  const failureVariety = Object.keys(failureCounts).length;
  return {
    averageDays: averageDays >= 65 && averageDays <= 80,
    reviveRate: reviveRate >= 0.15 && reviveRate <= 0.4,
    failureRate: failureRate >= 0.1 && failureRate <= 0.35,
    failureVariety: failureVariety >= 3
  };
}

function round(value) {
  return Math.round(value * 100) / 100;
}

export function actionLabels() {
  return ACTION_DEFS.map((action) => action.label);
}
