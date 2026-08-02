import { ACTION_DEFS } from './constants.js';
import { appendLog, applyEffects } from './state.js';
import { applyTalentToEffects } from './talents.js';

export function getAction(actionId) {
  const action = ACTION_DEFS.find((item) => item.id === actionId);
  if (!action) {
    throw new Error(`Unknown action: ${actionId}`);
  }
  return action;
}

function effectsForState(state, action) {
  if (action.id !== 'slack_off' || !state.dailyBuffs.slackSafe) {
    return action.effects;
  }
  return {
    ...action.effects,
    performance: 0
  };
}

export function applyAction(state, actionId) {
  if (state.energy <= 0) {
    throw new Error('No energy remaining');
  }

  const action = getAction(actionId);
  const previousCount = state.metrics?.actionCounts?.[action.id] || 0;
  const actionStreak = state.metrics?.lastActionId === action.id
    ? (state.metrics?.actionStreak || 0) + 1
    : 1;
  const effects = applyTalentToEffects(state, effectsForState(state, action), {
    source: 'action',
    actionId: action.id
  });
  const applied = applyEffects(state, effects);
  const next = {
    ...applied,
    metrics: {
      ...applied.metrics,
      actionsTaken: applied.metrics.actionsTaken + 1,
      actionCounts: {
        ...(applied.metrics.actionCounts || {}),
        [action.id]: previousCount + 1
      },
      lastActionId: action.id,
      actionStreak
    },
    energy: applied.energy - action.cost
  };

  let buffText = action.id === 'slack_off' && state.dailyBuffs.slackSafe
    ? '广告 Buff 生效，今天摸鱼没扣绩效。'
    : action.hint;

  if (action.id === 'slack_off' && actionStreak >= 3) {
    buffText = '你解锁了「厕所隔间战略会议」：短暂回血，但工位开始传你的神话。';
  }

  return appendLog(next, `你选择了「${action.label}」：${buffText}`);
}
