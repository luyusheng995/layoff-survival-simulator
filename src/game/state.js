import { DAILY_ENERGY, STAT_LIMITS } from './constants.js';
import { applyTalentToInitialStats } from './talents.js';

export function createInitialState(options = {}) {
  const selectedTalentId = options.selectedTalentId || null;
  const difficultyId = options.difficultyId || 'normal';
  const initialStats = applyTalentToInitialStats(selectedTalentId, {
    performance: STAT_LIMITS.performance.initial,
    hair: STAT_LIMITS.hair.initial,
    dignity: STAT_LIMITS.dignity.initial,
    savings: STAT_LIMITS.savings.initial
  });

  return {
    day: 1,
    energy: DAILY_ENERGY,
    stats: initialStats,
    hidden: {
      landmine: 10
    },
    difficultyId,
    metrics: {
      maxPerformance: initialStats.performance,
      minHair: initialStats.hair,
      minDignity: initialStats.dignity,
      actionsTaken: 0,
      actionCounts: {},
      lastActionId: null,
      actionStreak: 0,
      eventsResolved: 0,
      adsWatched: 0,
      adPlacements: {},
      lastAdPlacement: null
    },
    selectedTalentId,
    logs: ['入职第 1 天：工牌还热，裁员名单还冷。'],
    revivesUsed: 0,
    skipCrisisUsed: false,
    dailyBuffs: {
      slackSafe: false
    },
    talentsUnlocked: false,
    endingPreviewUnlocked: false,
    currentEventId: null
  };
}

export function clampCoreStats(state) {
  const stats = { ...state.stats };
  for (const [key, limit] of Object.entries(STAT_LIMITS)) {
    stats[key] = Math.max(limit.min, Math.min(limit.max, stats[key]));
  }
  const metrics = {
    ...state.metrics,
    maxPerformance: Math.max(state.metrics?.maxPerformance ?? stats.performance, stats.performance),
    minHair: Math.min(state.metrics?.minHair ?? stats.hair, stats.hair),
    minDignity: Math.min(state.metrics?.minDignity ?? stats.dignity, stats.dignity)
  };
  return {
    ...state,
    stats,
    metrics,
    hidden: {
      ...state.hidden,
      landmine: Math.max(0, Math.min(100, state.hidden.landmine))
    }
  };
}

export function appendLog(state, message) {
  return {
    ...state,
    logs: [message, ...state.logs].slice(0, 5)
  };
}

export function applyEffects(state, effects) {
  const next = {
    ...state,
    stats: { ...state.stats },
    hidden: { ...state.hidden },
    metrics: { ...state.metrics },
    dailyBuffs: { ...state.dailyBuffs }
  };

  for (const [key, amount] of Object.entries(effects)) {
    if (key in next.stats) {
      next.stats[key] += amount;
    } else if (key === 'landmine') {
      next.hidden.landmine += amount;
    }
  }

  return clampCoreStats(next);
}

export function advanceDay(state) {
  return {
    ...state,
    day: state.day + 1,
    energy: DAILY_ENERGY,
    dailyBuffs: {
      ...state.dailyBuffs,
      slackSafe: false
    },
    currentEventId: null
  };
}
