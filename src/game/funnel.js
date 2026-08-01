import { canUseRewardedAd } from './ads.js';

const AD_PRIORITY = ['revive', 'skipCrisis', 'dailyBuff', 'talentUnlock', 'endingPreview'];

const AD_REASONS = {
  revive: '已经 Game Over，先用一次复活把工位抢回来。',
  skipCrisis: '危机事件正在冒烟，这次广告可以直接跳过这口锅。',
  dailyBuff: '开局先买今日摸鱼保险，摸鱼不扣绩效，第一分钟更顺手。',
  talentUnlock: '解锁初始天赋，下一局少走一点真实职场弯路。',
  endingPreview: '提前看隐藏结局条件，知道自己是在冲年终奖还是冲离职报告。'
};

export function createFirstMinuteFunnel(state, context = {}) {
  const stage = getStage(state, context);
  const primaryAd = getPrimaryAd(state, context);

  return {
    stage,
    headline: createHeadline(state, stage),
    summary: createSummary(state, stage),
    primaryAd
  };
}

function getStage(state, context) {
  if (context.modalKind === 'failure') return 'game_over';
  if (context.activeEventType === 'crisis') return 'crisis';
  if ((state.metrics?.actionsTaken || 0) === 0) return 'first_minute';
  if (state.energy > 0) return 'workday';
  return 'after_work';
}

function getPrimaryAd(state, context) {
  for (const placementId of AD_PRIORITY) {
    if (placementId === 'revive' && context.modalKind !== 'failure') continue;
    if (placementId === 'skipCrisis' && context.activeEventType !== 'crisis') continue;
    const availability = canUseRewardedAd(state, placementId, context);
    if (availability.ok) {
      return {
        id: availability.placement.id,
        title: availability.placement.title,
        buttonText: availability.placement.buttonText,
        reward: availability.placement.reward,
        reason: AD_REASONS[placementId]
      };
    }
  }
  return null;
}

function createHeadline(state, stage) {
  const headlines = {
    game_over: `第 ${state.day} 天，名单已经落到你头上`,
    crisis: `第 ${state.day} 天，危机正在找背锅人`,
    first_minute: `第 ${state.day} 天，先保住今天的工牌`,
    workday: `第 ${state.day} 天，今天还有精力可分配`,
    after_work: `第 ${state.day} 天，等公司播报结算`
  };
  return headlines[stage];
}

function createSummary(state, stage) {
  const summaries = {
    game_over: '别急着删群。复活只有一次，能不能撑到年终奖就看这口气。',
    crisis: '线上、老板、HR、项目会轮流刷新。能跳过一口锅，就少掉一截绩效。',
    first_minute: '每天只有 3 点精力，先做选择，再等公司把真实意图发成播报。',
    workday: `还剩 ${state.energy} 点精力。加班涨绩效，摸鱼回血，副业补存款，每个选择都要付代价。`,
    after_work: '精力花完后，公司播报会刷新一个事件，真正的压力从会后开始。'
  };
  return summaries[stage];
}
