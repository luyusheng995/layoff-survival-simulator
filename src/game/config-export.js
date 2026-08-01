import { EVENTS } from '../data/events.js';
import { ENDINGS } from '../data/endings.js';
import { AD_PLACEMENTS } from './ads.js';
import { ACTION_DEFS, DAILY_ENERGY, MAX_DAY, STAT_LIMITS } from './constants.js';
import { DIFFICULTIES } from './difficulty.js';
import { getEventStats } from './events.js';

export function createGameConfig(options = {}) {
  const version = options.version || '0.1.0';
  const eventStats = getEventStats(EVENTS);
  return {
    schemaVersion: 1,
    version,
    title: '大厂裁员生存模拟器',
    positioning: {
      genre: '职场情绪向文字生存游戏',
      monetization: '纯激励视频广告',
      targetLoop: '每天分配 3 点精力，在 90 天裁员潮内生存、早退或反向晋升'
    },
    gameplay: {
      maxDay: MAX_DAY,
      dailyEnergy: DAILY_ENERGY,
      actionTypes: ACTION_DEFS.map((action) => action.id),
      failureStats: ['performance', 'hair', 'dignity', 'savings']
    },
    stats: normalizeStatLimits(STAT_LIMITS),
    actions: ACTION_DEFS,
    difficulties: DIFFICULTIES,
    events: EVENTS,
    eventStats,
    endings: ENDINGS,
    adPlacements: AD_PLACEMENTS,
    balanceTargets: {
      averageDays: '65-80',
      reviveRate: '0.15-0.40',
      failureRate: '0.10-0.35',
      failureVariety: '>=3 hard-failure ending types'
    }
  };
}

export function createDeliveryMarkdown(config) {
  return [
    '# 大厂裁员生存模拟器配置交付文档',
    '',
    `版本：${config.version}`,
    '',
    '## 核心玩法',
    '',
    `- 赛道定位：${config.positioning.genre}`,
    `- 商业化：${config.positioning.monetization}`,
    `- 周期：${config.gameplay.maxDay} 天`,
    `- 每日精力：${config.gameplay.dailyEnergy} 点`,
    `- 行动类型：${config.actions.map((action) => action.label).join('、')}`,
    '',
    '## 核心数值',
    '',
    '| 数值 | 初始值 | 下限 | 上限 |',
    '| --- | ---: | ---: | ---: |',
    ...Object.entries(config.stats).map(([key, stat]) => `| ${key} | ${stat.initial} | ${formatLimit(stat.min)} | ${formatLimit(stat.max)} |`),
    '',
    '## 事件库',
    '',
    `总计 ${config.eventStats.total} 条：日常 ${config.eventStats.daily} 条、危机 ${config.eventStats.crisis} 条、机遇 ${config.eventStats.opportunity} 条。`,
    '',
    '## 广告点位',
    '',
    ...config.adPlacements.map((placement) => `- ${placement.title}（${placement.id}）：${placement.reward}`),
    '',
    '## 结局体系',
    '',
    `共 ${config.endings.length} 种结局。`,
    ...config.endings.map((ending) => `- ${ending.title}（${ending.id}）：${ending.condition}`),
    '',
    '## 难度配置',
    '',
    ...config.difficulties.map((difficulty) => `- ${difficulty.label}：裁员评估 x${difficulty.evaluationMultiplier}，危机权重 x${difficulty.crisisMultiplier}`),
    '',
    '## 平衡目标',
    '',
    ...Object.entries(config.balanceTargets).map(([key, value]) => `- ${key}: ${value}`),
    ''
  ].join('\n');
}

function normalizeStatLimits(limits) {
  return Object.fromEntries(
    Object.entries(limits).map(([key, value]) => [
      key,
      {
        initial: value.initial,
        min: Number.isFinite(value.min) ? value.min : null,
        max: Number.isFinite(value.max) ? value.max : null
      }
    ])
  );
}

function formatLimit(value) {
  return value === null ? '无限' : value;
}
