import { STAT_LIMITS } from './constants.js';
import { appendLog, clampCoreStats } from './state.js';

export const AD_PLACEMENTS = [
  {
    id: 'revive',
    title: '死亡复活',
    buttonText: '看 30 秒广告复活',
    reward: '恢复核心数值到安全线，继续打工',
    durationSeconds: 30
  },
  {
    id: 'dailyBuff',
    title: '每日 Buff',
    buttonText: '今日摸鱼不被抓',
    reward: '当天摸鱼不扣绩效',
    durationSeconds: 30
  },
  {
    id: 'talentUnlock',
    title: '天赋解锁',
    buttonText: '解锁初始天赋',
    reward: '开放 3 个开局天赋',
    durationSeconds: 30
  },
  {
    id: 'endingPreview',
    title: '查看结局',
    buttonText: '预览隐藏结局条件',
    reward: '显示未解锁结局条件',
    durationSeconds: 30
  },
  {
    id: 'skipCrisis',
    title: '跳过负面事件',
    buttonText: '跳过这口锅',
    reward: '规避当前危机事件惩罚',
    durationSeconds: 30
  }
];

export function getAdPlacement(placementId) {
  const placement = AD_PLACEMENTS.find((item) => item.id === placementId);
  if (!placement) {
    throw new Error(`Unknown ad placement: ${placementId}`);
  }
  return placement;
}

export function canUseRewardedAd(state, placementId, context = {}) {
  const placement = getAdPlacement(placementId);
  if (context.busyAd) return unavailable(placement, '广告播放中');
  if (placementId === 'revive') {
    if (state.revivesUsed >= 1) return unavailable(placement, '本局复活次数已用完');
    if (context.modalKind && context.modalKind !== 'failure') return unavailable(placement, '只有 Game Over 时可复活');
  }
  if (placementId === 'dailyBuff' && state.dailyBuffs?.slackSafe) {
    return unavailable(placement, '今日 Buff 已生效');
  }
  if (placementId === 'talentUnlock' && state.talentsUnlocked) {
    return unavailable(placement, '天赋已解锁');
  }
  if (placementId === 'endingPreview' && state.endingPreviewUnlocked) {
    return unavailable(placement, '结局提示已解锁');
  }
  if (placementId === 'skipCrisis') {
    if (state.skipCrisisUsed) return unavailable(placement, '本局已用过跳过危机');
    if (context.activeEventType !== 'crisis') return unavailable(placement, '危机事件出现时可用');
  }
  return { ok: true, placement, reason: '可观看' };
}

export function watchRewardedAd(placement) {
  return new Promise((resolve) => {
    const metadata = getAdPlacement(placement);
    globalThis.setTimeout(() => resolve({
      ok: true,
      placement,
      durationSeconds: metadata.durationSeconds,
      reward: metadata.reward
    }), 450);
  });
}

export function reviveFromAd(state) {
  if (state.revivesUsed >= 1) {
    throw new Error('Revive already used');
  }

  return appendLog(
    clampCoreStats({
      ...state,
      stats: {
        performance: Math.max(state.stats.performance, 40),
        hair: Math.max(state.stats.hair, 40),
        dignity: Math.max(state.stats.dignity, 40) - 8,
        savings: Math.max(state.stats.savings, 2000)
      },
      hidden: {
        ...state.hidden,
        landmine: state.hidden.landmine + 18
      },
      metrics: {
        ...recordAdMetrics(state, 'revive')
      },
      revivesUsed: state.revivesUsed + 1
    }),
    '你看完 30 秒广告，带着 40% 状态回到工位，但组织已经盯上你。'
  );
}

export function activateDailyBuff(state) {
  return appendLog({
    ...state,
    metrics: recordAdMetrics(state, 'dailyBuff'),
    dailyBuffs: {
      ...state.dailyBuffs,
      slackSafe: true
    }
  }, '今日 Buff：摸鱼不被抓。摄像头也开始尊重打工人。');
}

export function unlockTalentPreview(state) {
  return appendLog({
    ...state,
    metrics: recordAdMetrics(state, 'talentUnlock'),
    talentsUnlocked: true
  }, '天赋预览已解锁：家里有矿、甩锅宗师、PPT 之神。');
}

export function unlockEndingPreview(state) {
  return appendLog({
    ...state,
    metrics: recordAdMetrics(state, 'endingPreview'),
    endingPreviewUnlocked: true
  }, '隐藏结局条件预览已解锁：高绩效、够存款、尊严别掉光。');
}

export function skipCrisisFromAd(state) {
  if (state.skipCrisisUsed) {
    throw new Error('Skip crisis already used');
  }
  return appendLog({
    ...state,
    metrics: recordAdMetrics(state, 'skipCrisis'),
    skipCrisisUsed: true,
    currentEventId: null
  }, '你看完广告，危机事件被系统温柔地折叠了。');
}

function unavailable(placement, reason) {
  return { ok: false, placement, reason };
}

function recordAdMetrics(state, placementId) {
  const previous = state.metrics?.adPlacements || {};
  return {
    ...state.metrics,
    adsWatched: (state.metrics?.adsWatched || 0) + 1,
    adPlacements: {
      ...previous,
      [placementId]: (previous[placementId] || 0) + 1
    },
    lastAdPlacement: placementId
  };
}
