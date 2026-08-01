import { ENDINGS } from '../data/endings.js';

function ending(id) {
  return ENDINGS.find((item) => item.id === id);
}

export function getFailure(state) {
  if (state.stats.performance <= 0) return ending('fired_performance');
  if (state.stats.hair <= 0) return ending('hair_collapse');
  if (state.stats.dignity <= 0) return ending('quit_naked');
  if (state.stats.savings <= 0) return ending('home_rent');
  return null;
}

export function getFinalEnding(state) {
  const failure = getFailure(state);
  if (failure) return failure;
  const midcycleExit = getMidcycleExit(state);
  if (midcycleExit) return midcycleExit;
  if (state.day < 90) return null;

  if (state.stats.performance >= 90 && state.stats.dignity >= 40 && state.stats.savings >= 20000) {
    return ending('reverse_promoted');
  }
  if (state.stats.savings >= 50000) {
    return ending('side_hustle_escape');
  }
  const softFailure = getSoftFinalFailure(state);
  if (softFailure) return softFailure;
  if (state.stats.performance >= 75 && state.stats.hair >= 40) {
    return ending('year_bonus');
  }
  if (canSilentlySurvive(state)) {
    return ending('silent_survivor');
  }
  return getWeakestFinalEnding(state);
}

function getMidcycleExit(state) {
  if (state.day < 76 || state.day >= 90) return null;
  if (state.stats.savings <= 3000) return ending('home_rent');
  if (state.stats.hair <= 28) return ending('hair_collapse');
  if (state.stats.dignity <= 32) return ending('quit_naked');
  if (state.stats.performance <= 41) return ending('fired_performance');
  if (state.stats.performance <= 56) return ending('n_plus_one');
  if (state.stats.hair <= 34 && state.stats.dignity >= 65) return ending('backpack_freelancer');
  if (state.stats.dignity >= 70 && state.stats.performance >= 58) return ending('internal_transfer');
  return null;
}

function getSoftFinalFailure(state) {
  const minDignity = state.metrics?.minDignity ?? state.stats.dignity;
  if (state.stats.savings <= 10000) return ending('home_rent');
  if (state.stats.dignity <= 55 || minDignity <= 28) return ending('quit_naked');
  if (state.stats.hair <= 28) return ending('hair_collapse');
  if (state.stats.performance <= 45) return ending('fired_performance');
  return null;
}

function canSilentlySurvive(state) {
  return state.stats.performance >= 55
    && state.stats.hair >= 32
    && state.stats.dignity >= 55
    && state.stats.savings >= 10000;
}

function getWeakestFinalEnding(state) {
  const weakness = [
    ['performance', state.stats.performance / 60, 'fired_performance'],
    ['hair', state.stats.hair / 80, 'hair_collapse'],
    ['dignity', state.stats.dignity / 70, 'quit_naked'],
    ['savings', state.stats.savings / 15000, 'home_rent']
  ].sort((a, b) => a[1] - b[1])[0];
  return ending(weakness[2]);
}
