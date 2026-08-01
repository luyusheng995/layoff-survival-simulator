import { applyEffects, appendLog } from './state.js';
import { getDifficulty } from './difficulty.js';

export function shouldEvaluateLayoff(day) {
  return day === 30 || day === 45 || day === 60 || day === 75 || day === 90;
}

export function evaluateLayoff(state) {
  if (!shouldEvaluateLayoff(state.day)) return state;

  const difficulty = getDifficulty(state.difficultyId);
  const risk = calculateRisk(state) * difficulty.evaluationMultiplier;
  const stageMultiplier = stagePressureMultiplier(state.day);
  const pressure = Math.ceil(risk * stageMultiplier);
  const floors = effectFloors(state.day);
  const effects = {
    performance: -Math.max(floors.performance, Math.ceil(pressure * 0.9)),
    dignity: -Math.max(floors.dignity, Math.ceil(pressure * 0.58)) - dignityPressure(state.day),
    hair: -Math.max(floors.hair, Math.ceil(pressure * 0.5)),
    savings: -livingCost(state.day, difficulty.id),
    landmine: -Math.max(floors.landmine, Math.ceil(pressure * 0.32))
  };

  if (risk >= 34 && isMajorCheckpoint(state.day)) {
    effects.savings -= Math.ceil((risk - 24) * 240);
  }

  const evaluated = protectMidcycleFloor(applyEffects(state, effects), state.day);
  return appendLog(evaluated, evaluationMessage(state.day, risk, difficulty.label));
}

function isMajorCheckpoint(day) {
  return day === 30 || day === 60 || day === 90;
}

function effectFloors(day) {
  if (day === 45 || day === 75) {
    return { performance: 0, dignity: 0, hair: 0, landmine: 0 };
  }
  return { performance: 10, dignity: 8, hair: 7, landmine: 10 };
}

function protectMidcycleFloor(state, day) {
  if (day !== 45 && day !== 75) return state;
  const stats = {
    ...state.stats,
    performance: Math.max(1, state.stats.performance),
    hair: Math.max(1, state.stats.hair),
    dignity: Math.max(1, state.stats.dignity),
    savings: Math.max(1, state.stats.savings)
  };
  return {
    ...state,
    stats,
    metrics: {
      ...state.metrics,
      minHair: Math.min(state.metrics?.minHair ?? stats.hair, stats.hair),
      minDignity: Math.min(state.metrics?.minDignity ?? stats.dignity, stats.dignity)
    }
  };
}

function dignityPressure(day) {
  if (day === 30) return 4;
  if (day === 45) return 0;
  if (day === 60) return 7;
  if (day === 75) return 1;
  if (day === 90) return 42;
  return 0;
}

function livingCost(day, difficultyId) {
  const table = {
    normal: { 30: 5000, 45: 0, 60: 5000, 75: 1, 90: 30000 },
    hard: { 30: 7000, 45: 0, 60: 7000, 75: 500, 90: 36000 },
    nightmare: { 30: 9000, 45: 0, 60: 9000, 75: 1000, 90: 45000 }
  };
  return table[difficultyId]?.[day] || table.normal[day] || 0;
}

function stagePressureMultiplier(day) {
  const table = {
    30: 0.25,
    45: 0,
    60: 0.4,
    75: 0.01,
    90: 3
  };
  return table[day] || 0;
}

function calculateRisk(state) {
  let risk = 22;
  risk += Math.max(0, 78 - state.stats.performance) * 1.35;
  risk += Math.max(0, 64 - state.stats.hair) * 0.9;
  risk += Math.max(0, 62 - state.stats.dignity) * 0.75;
  risk += Math.max(0, 10000 - state.stats.savings) / 280;
  risk += state.hidden.landmine * 0.58;
  return risk;
}

function evaluationMessage(day, risk, difficultyLabel) {
  const stageNames = {
    30: '试用期校准',
    45: '影子名单初筛',
    60: '预算冻结校准',
    75: '影子名单复核',
    90: '年终名单校准'
  };
  const stage = stageNames[day] || '临时组织校准';
  if (risk >= 55) return `${stage}：${difficultyLabel}模式下风险爆表，组织开始精准优化你。`;
  if (risk >= 38) return `${stage}：${difficultyLabel}模式下风险偏高，你被扣了一轮生存值。`;
  return `${stage}：${difficultyLabel}模式下勉强过线，但寒气已经传到工位。`;
}
