import { applyAction } from './actions.js';
import { activateDailyBuff, reviveFromAd, skipCrisisFromAd } from './ads.js';
import { getFinalEnding, getFailure } from './endings.js';
import { applyEventChoice } from './events.js';
import { createFirstMinuteFunnel } from './funnel.js';
import { createShareReport } from './report.js';
import { advanceDay, createInitialState } from './state.js';

export function runPlaytestScenarios() {
  const scenarios = [
    runFirstMinuteScenario(),
    runCrisisSkipScenario(),
    runFailureReviveScenario(),
    runEndingShareScenario()
  ];

  return {
    generatedAt: new Date(0).toISOString(),
    passed: scenarios.every((scenario) => scenario.passed),
    scenarios,
    findings: createFindings()
  };
}

export function createPlaytestMarkdown(report) {
  return [
    '# M16 真实玩家试玩 QA 报告',
    '',
    `整体状态：${report.passed ? 'PASS' : 'FAIL'}`,
    `生成时间：${report.generatedAt}`,
    '',
    '## 试玩路径',
    '',
    '| 路径 | 状态 | 验证点 | 结果摘要 |',
    '| --- | --- | --- | --- |',
    ...report.scenarios.map((scenario) => (
      `| ${scenario.id} | ${scenario.passed ? 'PASS' : 'FAIL'} | ${scenario.goal} | ${scenario.summary} |`
    )),
    '',
    '## 问题清单',
    '',
    '| 优先级 | 类型 | 问题 | 建议 |',
    '| --- | --- | --- | --- |',
    ...report.findings.map((finding) => (
      `| ${finding.priority} | ${finding.type} | ${finding.issue} | ${finding.recommendation} |`
    )),
    '',
    '## 结论',
    '',
    report.passed
      ? '核心试玩路径通过。下一步应优先补浏览器级自动化和首屏重复广告降噪，再继续做投放前优化。'
      : '存在阻断路径，需要先修复 FAIL 场景再进入下一阶段。',
    ''
  ].join('\n');
}

function runFirstMinuteScenario() {
  let state = createInitialState();
  const funnel = createFirstMinuteFunnel(state);
  state = activateDailyBuff(state);
  const beforeSlack = state.stats.performance;
  state = applyAction(state, 'slack_off');
  state = applyAction(state, 'overtime');
  state = applyAction(state, 'side_hustle');
  state = applyEventChoice({ ...state, currentEventId: 'daily_sync_001' }, 'daily_sync_001', 'align_harder');

  return scenario('first_minute', '新手第一分钟能完成广告、行动、事件闭环', [
    funnel.primaryAd?.id === 'dailyBuff',
    state.metrics.adsWatched === 1,
    state.metrics.actionsTaken === 3,
    state.metrics.eventsResolved === 1,
    state.day === 2,
    state.stats.performance >= beforeSlack
  ], `推荐 ${funnel.primaryAd?.id}，完成 3 次行动和 1 次事件，进入第 ${state.day} 天`);
}

function runCrisisSkipScenario() {
  let state = createInitialState();
  const funnel = createFirstMinuteFunnel(state, { activeEventType: 'crisis' });
  state = advanceDay(skipCrisisFromAd({ ...state, currentEventId: 'crisis_outage_001' }));

  return scenario('crisis_skip', '危机事件时推荐跳过负面事件广告', [
    funnel.primaryAd?.id === 'skipCrisis',
    state.skipCrisisUsed === true,
    state.metrics.adsWatched === 1,
    state.metrics.adPlacements.skipCrisis === 1,
    state.day === 2
  ], `推荐 ${funnel.primaryAd?.id}，跳过后进入第 ${state.day} 天`);
}

function runFailureReviveScenario() {
  const failed = {
    ...createInitialState(),
    stats: { performance: 0, hair: 80, dignity: 70, savings: 5000 }
  };
  const funnel = createFirstMinuteFunnel(failed, { modalKind: 'failure' });
  const revived = reviveFromAd(failed);

  return scenario('failure_revive', 'Game Over 时推荐复活广告且恢复可继续状态', [
    getFailure(failed)?.id === 'fired_performance',
    funnel.primaryAd?.id === 'revive',
    getFailure(revived) === null,
    revived.revivesUsed === 1,
    revived.metrics.adPlacements.revive === 1
  ], `失败原因为 ${getFailure(failed)?.id}，复活后绩效 ${revived.stats.performance}`);
}

function runEndingShareScenario() {
  const state = {
    ...createInitialState(),
    day: 90,
    stats: { performance: 95, hair: 55, dignity: 45, savings: 28000 }
  };
  const ending = getFinalEnding(state);
  const report = createShareReport(state, ending);

  return scenario('ending_share', '到达结局后能生成可分享报告', [
    ending?.id === 'reverse_promoted',
    report.shareText.includes('大厂裁员生存模拟器'),
    report.posterCode === 'LAYOFF-REVERSE-PROMOTED-090',
    report.shareBadges.length > 0
  ], `结局 ${ending?.id}，报告编号 ${report.posterCode}`);
}

function scenario(id, goal, checks, summary) {
  return {
    id,
    goal,
    passed: checks.every(Boolean),
    checksPassed: checks.filter(Boolean).length,
    checksTotal: checks.length,
    summary
  };
}

function createFindings() {
  return [
    {
      priority: 'P1',
      type: 'QA 自动化',
      issue: '当前仓库没有浏览器级自动化依赖，M16 只能做 HTTP 与核心逻辑路径验证，无法稳定捕捉视觉重叠、点击遮挡和移动端真实布局问题。',
      recommendation: '下一步补一个轻量浏览器 smoke，例如 Playwright 或 Sites/浏览器截图检查，覆盖桌面与 390px 移动宽度。'
    },
    {
      priority: 'P2',
      type: '广告体验',
      issue: '首屏推荐广告和侧栏广告库存会同时出现同一个广告位，转化意图清楚但有轻微重复感。',
      recommendation: '侧栏保留库存即可，将已推荐广告折叠成“左侧推荐中”状态，减少首屏噪音。'
    },
    {
      priority: 'P2',
      type: '广告模拟',
      issue: '界面文案写 30 秒激励视频，但 mock 播放约 0.45 秒，试玩时会觉得广告结算过快。',
      recommendation: '保留快速 mock，但在开发模式文案里标注“模拟播放”，接入真实 SDK 前再切换到真实时长。'
    }
  ];
}
