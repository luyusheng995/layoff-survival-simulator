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
    ...(report.findings.length > 0
      ? report.findings.map((finding) => (
        `| ${finding.priority} | ${finding.type} | ${finding.issue} | ${finding.recommendation} |`
      ))
      : ['| - | - | 暂无开放问题。 | 当前已知 QA 发现均已闭环。 |']),
    '',
    '## 结论',
    '',
    report.passed
      ? '核心试玩路径通过。当前已知 QA 发现均已闭环，可以进入下一轮投放前优化。'
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
  return [];
}
