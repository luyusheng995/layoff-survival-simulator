import { EVENTS } from '../data/events.js';
import { MAX_DAY } from './constants.js';
import { advanceDay, appendLog, applyEffects } from './state.js';
import { applyTalentToEffects } from './talents.js';
import { getDifficulty } from './difficulty.js';
import { evaluateLayoff, shouldEvaluateLayoff } from './layoffs.js';

function isActive(event, state) {
  return event.minDay <= state.day && event.maxDay >= state.day;
}

function weightedEventWeight(event, state) {
  if (event.type === 'crisis' && state.hidden.landmine >= 80) {
    return event.weight * 2.5 * getDifficulty(state.difficultyId).crisisMultiplier;
  }
  if (event.type === 'crisis') {
    return event.weight * getDifficulty(state.difficultyId).crisisMultiplier;
  }
  return event.weight;
}

export function availableEvents(state) {
  return EVENTS.filter((event) => isActive(event, state));
}

export function getEventStats(events = EVENTS) {
  return events.reduce((stats, event) => {
    stats.total += 1;
    stats[event.type] = (stats[event.type] || 0) + 1;
    return stats;
  }, { total: 0, daily: 0, crisis: 0, opportunity: 0 });
}

export function pickEvent(state, rng = Math.random) {
  const pool = availableEvents(state);
  if (pool.length === 0) {
    throw new Error(`No events available for day ${state.day}`);
  }

  const total = pool.reduce((sum, event) => sum + weightedEventWeight(event, state), 0);
  let cursor = rng() * total;
  for (const event of pool) {
    cursor -= weightedEventWeight(event, state);
    if (cursor <= 0) return event;
  }
  return pool[pool.length - 1];
}

function findChoice(eventId, choiceId) {
  const event = EVENTS.find((item) => item.id === eventId);
  if (!event) throw new Error(`Unknown event: ${eventId}`);
  const choice = event.choices.find((item) => item.id === choiceId);
  if (!choice) throw new Error(`Unknown choice: ${eventId}/${choiceId}`);
  return { event, choice };
}

function resolveLandmineBurst(state) {
  if (state.hidden.landmine < 100) {
    return state;
  }
  const burst = applyEffects(state, { performance: -25, dignity: -15, landmine: -45 });
  return appendLog(burst, '埋雷指数爆了：旧锅回旋，绩效和尊严被当场扣款。');
}

export function applyEventChoice(state, eventId, choiceId) {
  const { event, choice } = findChoice(eventId, choiceId);
  const effects = applyTalentToEffects(state, choice.effects, {
    source: 'event',
    eventType: event.type,
    tags: choice.tags || []
  });
  const effected = applyEffects(state, effects);
  const counted = {
    ...effected,
    metrics: {
      ...effected.metrics,
      eventsResolved: effected.metrics.eventsResolved + 1
    }
  };
  const applied = resolveLandmineBurst(counted);
  const logged = appendLog(applied, `事件「${event.title}」：${choice.feedback}`);
  const evaluated = shouldEvaluateLayoff(logged.day) ? evaluateLayoff(logged) : logged;

  if (evaluated.day >= MAX_DAY) {
    return {
      ...evaluated,
      currentEventId: null
    };
  }
  return advanceDay(evaluated);
}
