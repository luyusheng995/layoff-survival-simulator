import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/game/state.js';
import { applyAction } from '../src/game/actions.js';
import { EVENTS } from '../src/data/events.js';
import { applyEventChoice, getEventStats, pickEvent } from '../src/game/events.js';
import { getFailure, getFinalEnding } from '../src/game/endings.js';
import {
  AD_PLACEMENTS,
  activateDailyBuff,
  canUseRewardedAd,
  reviveFromAd,
  skipCrisisFromAd,
  unlockTalentPreview,
  watchRewardedAd
} from '../src/game/ads.js';
import { TALENTS, applyTalentToEffects } from '../src/game/talents.js';
import { getEndingGallery } from '../src/game/gallery.js';
import { createShareReport } from '../src/game/report.js';
import { simulateRuns } from '../src/game/simulator.js';
import { DIFFICULTIES } from '../src/game/difficulty.js';
import { evaluateLayoff, shouldEvaluateLayoff } from '../src/game/layoffs.js';
import { createStatDeltas, getNextCheckpoint } from '../src/game/feedback.js';
import { createOnboardingBrief } from '../src/game/onboarding.js';
import { createDeliveryMarkdown, createGameConfig } from '../src/game/config-export.js';
import { createReleaseChecklist, createReleaseChecklistMarkdown } from '../src/game/release-checklist.js';
import { createReleaseManifest, createReleaseReadme, createStoredZip } from '../src/game/release-package.js';
import { createFirstMinuteFunnel } from '../src/game/funnel.js';
import { createPlaytestMarkdown, runPlaytestScenarios } from '../src/game/playtest.js';
import { createBrowserSmokeMarkdown, createBrowserSmokeReport } from '../src/game/browser-smoke-report.js';
import { createAdInventoryItems } from '../src/game/ad-inventory.js';

test('initial state matches prototype stat rules', () => {
  const state = createInitialState();
  assert.equal(state.day, 1);
  assert.equal(state.energy, 3);
  assert.equal(state.stats.performance, 60);
  assert.equal(state.stats.hair, 80);
  assert.equal(state.stats.dignity, 70);
  assert.equal(state.stats.savings, 5000);
  assert.equal(state.hidden.landmine, 10);
});

test('actions consume one energy and change the expected stats', () => {
  const state = createInitialState();
  const next = applyAction(state, 'overtime');
  assert.equal(next.energy, 2);
  assert.equal(next.stats.performance, 68);
  assert.equal(next.stats.hair, 74);
});

test('cannot act with zero energy', () => {
  const state = createInitialState();
  const spent = applyAction(applyAction(applyAction(state, 'side_hustle'), 'slack_off'), 'manage_up');
  assert.equal(spent.energy, 0);
  assert.throws(() => applyAction(spent, 'overtime'), /No energy remaining/);
});

test('event library has at least 30 events and every choice changes at least two values', () => {
  assert.ok(EVENTS.length >= 30);
  for (const event of EVENTS) {
    assert.ok(['daily', 'crisis', 'opportunity'].includes(event.type));
    for (const choice of event.choices) {
      assert.ok(Object.keys(choice.effects).length >= 2, `${event.id}/${choice.id}`);
    }
  }
});

test('event library meets M1 category minimums', () => {
  const stats = getEventStats(EVENTS);
  assert.ok(stats.total >= 80);
  assert.ok(stats.daily >= 56);
  assert.ok(stats.crisis >= 16);
  assert.ok(stats.opportunity >= 8);
});

test('event library meets M11 production category minimums', () => {
  const stats = getEventStats(EVENTS);
  assert.ok(stats.total >= 200);
  assert.ok(stats.daily >= 140);
  assert.ok(stats.crisis >= 40);
  assert.ok(stats.opportunity >= 20);
});

test('event library ids are unique at production scale', () => {
  const ids = EVENTS.map((event) => event.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('weighted picker can return a valid event for the current day', () => {
  const state = createInitialState();
  const event = pickEvent(state, () => 0);
  assert.ok(event.id);
  assert.ok(event.minDay <= state.day);
  assert.ok(event.maxDay >= state.day);
});

test('event choice applies effects and advances to the next day', () => {
  const state = { ...createInitialState(), energy: 0, currentEventId: 'daily_sync_001' };
  const next = applyEventChoice(state, 'daily_sync_001', 'align_harder');
  assert.equal(next.day, 2);
  assert.equal(next.energy, 3);
  assert.notEqual(next.stats.performance, state.stats.performance);
});

test('failure and revive rules work', () => {
  const base = createInitialState();
  const failed = { ...base, stats: { ...base.stats, dignity: 0 } };
  assert.equal(getFailure(failed).id, 'quit_naked');
  const revived = reviveFromAd(failed);
  assert.equal(revived.revivesUsed, 1);
  assert.ok(revived.stats.performance >= 40);
  assert.ok(revived.stats.hair >= 40);
  assert.ok(revived.stats.dignity >= 32);
  assert.ok(revived.hidden.landmine > failed.hidden.landmine);
});

test('rewarded ad catalog exposes all five monetization placements', () => {
  assert.deepEqual(AD_PLACEMENTS.map((placement) => placement.id), [
    'revive',
    'dailyBuff',
    'talentUnlock',
    'endingPreview',
    'skipCrisis'
  ]);
  for (const placement of AD_PLACEMENTS) {
    assert.equal(placement.durationSeconds, 30);
    assert.ok(placement.reward.length > 0);
  }
});

test('rewarded ads record placement-level metrics', () => {
  let state = createInitialState();
  state = activateDailyBuff(state);
  state = unlockTalentPreview(state);
  assert.equal(state.metrics.adsWatched, 2);
  assert.equal(state.metrics.adPlacements.dailyBuff, 1);
  assert.equal(state.metrics.adPlacements.talentUnlock, 1);
  assert.equal(state.metrics.lastAdPlacement, 'talentUnlock');
});

test('skip crisis rewarded ad availability depends on crisis context and one-use limit', () => {
  const state = createInitialState();
  assert.equal(canUseRewardedAd(state, 'skipCrisis', { activeEventType: 'daily' }).ok, false);
  assert.equal(canUseRewardedAd(state, 'skipCrisis', { activeEventType: 'crisis' }).ok, true);
  const used = skipCrisisFromAd(state);
  const availability = canUseRewardedAd(used, 'skipCrisis', { activeEventType: 'crisis' });
  assert.equal(availability.ok, false);
  assert.ok(availability.reason.includes('本局已用'));
});

test('mock rewarded ad returns placement metadata', async () => {
  const result = await watchRewardedAd('dailyBuff');
  assert.equal(result.ok, true);
  assert.equal(result.placement, 'dailyBuff');
  assert.equal(result.durationSeconds, 30);
  assert.equal(result.playbackMode, 'mock');
  assert.equal(result.mockPlaybackMs, 450);
  assert.ok(result.reward.includes('摸鱼'));
});

test('talents expose the three rewarded unlock choices', () => {
  assert.deepEqual(TALENTS.map((talent) => talent.id), ['rich_family', 'blame_master', 'ppt_god']);
});

test('rich family talent changes initial savings', () => {
  const state = createInitialState({ selectedTalentId: 'rich_family' });
  assert.equal(state.selectedTalentId, 'rich_family');
  assert.equal(state.stats.savings, 15000);
});

test('blame master reduces positive landmine effects', () => {
  const state = createInitialState({ selectedTalentId: 'blame_master' });
  const effects = applyTalentToEffects(state, { performance: -4, landmine: 12 }, { source: 'event' });
  assert.equal(effects.landmine, 6);
});

test('ending gallery includes all endings and reveals preview conditions', () => {
  const gallery = getEndingGallery(['reverse_promoted'], true);
  assert.equal(gallery.length, 12);
  const unlocked = gallery.find((item) => item.id === 'reverse_promoted');
  const locked = gallery.find((item) => item.id === 'ppt_partner');
  assert.equal(unlocked.unlocked, true);
  assert.equal(locked.unlocked, false);
  assert.ok(locked.condition.length > 0);
});

test('day 90 can produce a final ending', () => {
  const state = {
    ...createInitialState(),
    day: 90,
    stats: { performance: 95, hair: 55, dignity: 45, savings: 28000 }
  };
  assert.equal(getFinalEnding(state).id, 'reverse_promoted');
});

test('state metrics track actions events and ads', () => {
  let state = createInitialState();
  state = applyAction(state, 'overtime');
  state = { ...state, energy: 0, currentEventId: 'daily_sync_001' };
  state = applyEventChoice(state, 'daily_sync_001', 'align_harder');
  state = reviveFromAd({ ...state, stats: { ...state.stats, performance: 0 } });
  assert.equal(state.metrics.actionsTaken, 1);
  assert.equal(state.metrics.eventsResolved, 1);
  assert.equal(state.metrics.adsWatched, 1);
  assert.ok(state.metrics.maxPerformance >= 68);
});

test('state metrics track the lowest dignity reached', () => {
  let state = createInitialState();
  state = applyAction(state, 'manage_up');
  state = applyAction(state, 'manage_up');
  assert.equal(state.metrics.minDignity, 58);
});

test('day 90 low dignity becomes a naked quit instead of silent survival', () => {
  const base = createInitialState();
  const state = {
    ...base,
    day: 90,
    stats: { performance: 70, hair: 50, dignity: 52, savings: 16000 },
    metrics: { ...base.metrics, minDignity: 42 }
  };
  assert.equal(getFinalEnding(state).id, 'quit_naked');
});

test('day 90 weak savings becomes rent failure instead of silent survival', () => {
  const state = {
    ...createInitialState(),
    day: 90,
    stats: { performance: 70, hair: 50, dignity: 78, savings: 9000 }
  };
  assert.equal(getFinalEnding(state).id, 'home_rent');
});

test('day 90 stable unspectacular stats still become silent survivor', () => {
  const state = {
    ...createInitialState(),
    day: 90,
    stats: { performance: 66, hair: 48, dignity: 70, savings: 18000 }
  };
  assert.equal(getFinalEnding(state).id, 'silent_survivor');
});

test('day 75 weak state can resolve into a compensated early exit', () => {
  const state = {
    ...createInitialState(),
    day: 76,
    stats: { performance: 52, hair: 36, dignity: 72, savings: 14000 }
  };
  assert.equal(getFinalEnding(state).id, 'n_plus_one');
});

test('share report summarizes an ending-ready state', () => {
  const state = {
    ...createInitialState(),
    day: 42,
    revivesUsed: 1,
    stats: { performance: 82, hair: 47, dignity: 39, savings: 18888 },
    metrics: { maxPerformance: 96, minHair: 47, actionsTaken: 90, eventsResolved: 30, adsWatched: 2 }
  };
  const report = createShareReport(state, { id: 'year_bonus', title: '撑到年底拿年终奖', description: '奖金到账。' });
  assert.equal(report.endingTitle, '撑到年底拿年终奖');
  assert.equal(report.daysSurvived, 42);
  assert.equal(report.maxPerformance, 96);
  assert.equal(report.hairLost, 33);
  assert.equal(report.survivalTier, '中场苟住');
  assert.ok(report.shareHeadline.includes('撑过 42 天'));
  assert.equal(report.posterCode, 'LAYOFF-YEAR-BONUS-042');
  assert.ok(report.shareBadges.includes('中场苟住'));
  assert.ok(report.shareBadges.includes('广告续命 x1'));
  assert.ok(report.shareText.includes('大厂裁员生存模拟器'));
  assert.ok(report.shareText.includes('生存评级：中场苟住'));
  assert.ok(report.shareText.includes('报告编号：LAYOFF-YEAR-BONUS-042'));
});

test('share report badges describe strong and painful run traits', () => {
  const state = {
    ...createInitialState(),
    day: 90,
    revivesUsed: 0,
    stats: { performance: 96, hair: 38, dignity: 88, savings: 52000 },
    metrics: { maxPerformance: 100, minHair: 38, actionsTaken: 150, eventsResolved: 60, adsWatched: 0 }
  };
  const report = createShareReport(state, { id: 'side_hustle_escape', title: '副业上岸体面离场', description: '副业救命。' });
  assert.equal(report.posterCode, 'LAYOFF-SIDE-HUSTLE-ESCAPE-090');
  assert.ok(report.shareBadges.includes('年底幸存'));
  assert.ok(report.shareBadges.includes('副业上岸'));
  assert.ok(report.shareBadges.includes('掉发 42 根'));
});

test('feedback helper summarizes stat deltas with tones', () => {
  const before = createInitialState();
  const after = {
    ...before,
    stats: { ...before.stats, performance: 68, hair: 74 },
    hidden: { landmine: 8 }
  };
  const deltas = createStatDeltas(before, after);
  assert.equal(deltas.find((item) => item.key === 'performance').text, '绩效分 +8');
  assert.equal(deltas.find((item) => item.key === 'performance').tone, 'good');
  assert.equal(deltas.find((item) => item.key === 'hair').text, '发量值 -6');
  assert.equal(deltas.find((item) => item.key === 'hair').tone, 'bad');
  assert.equal(deltas.find((item) => item.key === 'landmine').text, '埋雷指数 -2');
});

test('feedback helper describes next layoff checkpoint', () => {
  assert.deepEqual(getNextCheckpoint(44), {
    day: 45,
    label: '影子名单初筛',
    daysLeft: 1,
    tone: 'warning'
  });
  assert.deepEqual(getNextCheckpoint(76), {
    day: 90,
    label: '年终名单校准',
    daysLeft: 14,
    tone: 'danger'
  });
});

test('onboarding brief starts with first-run checklist incomplete', () => {
  const brief = createOnboardingBrief(createInitialState(), { unlockedEndingCount: 0 });
  assert.equal(brief.visible, true);
  assert.equal(brief.progress.completed, 0);
  assert.equal(brief.progress.total, 4);
  assert.equal(brief.tasks[0].id, 'first_action');
  assert.equal(brief.tasks[0].completed, false);
});

test('onboarding brief tracks progressed first-run milestones', () => {
  const state = {
    ...createInitialState(),
    metrics: {
      maxPerformance: 80,
      minHair: 70,
      minDignity: 70,
      actionsTaken: 2,
      eventsResolved: 1,
      adsWatched: 1,
      adPlacements: { dailyBuff: 1 },
      lastAdPlacement: 'dailyBuff'
    }
  };
  const brief = createOnboardingBrief(state, { unlockedEndingCount: 1 });
  assert.equal(brief.progress.completed, 4);
  assert.deepEqual(brief.tasks.map((task) => task.completed), [true, true, true, true]);
});

test('dismissed onboarding brief stays hidden', () => {
  const brief = createOnboardingBrief(createInitialState(), { dismissed: true, unlockedEndingCount: 0 });
  assert.equal(brief.visible, false);
});

test('delivery config exports production gameplay counts', () => {
  const config = createGameConfig({ version: 'test-version' });
  assert.equal(config.version, 'test-version');
  assert.equal(config.gameplay.maxDay, 90);
  assert.equal(config.gameplay.dailyEnergy, 3);
  assert.equal(config.stats.performance.initial, 60);
  assert.equal(config.actions.length, 5);
  assert.equal(config.eventStats.total, 200);
  assert.equal(config.eventStats.daily, 140);
  assert.equal(config.eventStats.crisis, 40);
  assert.equal(config.eventStats.opportunity, 20);
  assert.equal(config.endings.length, 12);
  assert.equal(config.adPlacements.length, 5);
});

test('delivery markdown includes handoff sections', () => {
  const markdown = createDeliveryMarkdown(createGameConfig({ version: 'test-version' }));
  assert.ok(markdown.includes('# 大厂裁员生存模拟器配置交付文档'));
  assert.ok(markdown.includes('## 核心玩法'));
  assert.ok(markdown.includes('## 事件库'));
  assert.ok(markdown.includes('总计 200 条'));
  assert.ok(markdown.includes('## 广告点位'));
  assert.ok(markdown.includes('## 结局体系'));
});

test('release checklist passes for current delivery config', () => {
  const result = createReleaseChecklist(createGameConfig({ version: 'test-version' }), {
    requiredFiles: ['index.html', 'package.json']
  });
  assert.equal(result.passed, true);
  assert.ok(result.checks.length >= 6);
  assert.ok(result.checks.every((check) => check.passed));
});

test('release checklist markdown includes pass fail summary', () => {
  const markdown = createReleaseChecklistMarkdown(createReleaseChecklist(createGameConfig()));
  assert.ok(markdown.includes('# 发行前 QA Smoke 清单'));
  assert.ok(markdown.includes('整体状态：PASS'));
  assert.ok(markdown.includes('事件库规模'));
  assert.ok(markdown.includes('广告点位'));
});

test('release manifest captures versioned package inventory', () => {
  const manifest = createReleaseManifest(createGameConfig({ version: 'test-version' }), {
    generatedAt: '2026-08-01T00:00:00.000Z',
    files: [
      { path: 'index.html', bytes: 1200 },
      { path: 'src/main.js', bytes: 3000 },
      { path: 'dist/game-config.json', bytes: 9000 },
      { path: 'docs/delivery/game-config.md', bytes: 2000 },
      { path: 'docs/delivery/release-checklist.md', bytes: 1000 }
    ]
  });

  assert.equal(manifest.packageName, 'layoff-survival-simulator-vtest-version');
  assert.equal(manifest.version, 'test-version');
  assert.equal(manifest.eventCount, 200);
  assert.equal(manifest.endingCount, 12);
  assert.equal(manifest.adPlacementCount, 5);
  assert.ok(manifest.files.some((file) => file.path === 'index.html'));
});

test('release readme summarizes archive contents for handoff', () => {
  const manifest = createReleaseManifest(createGameConfig({ version: 'test-version' }), {
    generatedAt: '2026-08-01T00:00:00.000Z',
    archiveName: 'layoff-survival-simulator-vtest-version.zip',
    files: [{ path: 'index.html', bytes: 1200 }]
  });
  const readme = createReleaseReadme(manifest);

  assert.ok(readme.includes('# 大厂裁员生存模拟器 Release'));
  assert.ok(readme.includes('layoff-survival-simulator-vtest-version.zip'));
  assert.ok(readme.includes('事件数：200'));
});

test('stored zip writer creates a valid zip envelope', () => {
  const zip = createStoredZip([
    { path: 'hello.txt', content: Buffer.from('hello') },
    { path: 'nested/world.txt', content: Buffer.from('world') }
  ]);

  assert.equal(zip.subarray(0, 4).toString('hex'), '504b0304');
  assert.equal(zip.subarray(zip.length - 22, zip.length - 18).toString('hex'), '504b0506');
});

test('first screen funnel recommends daily buff for a fresh run', () => {
  const funnel = createFirstMinuteFunnel(createInitialState());
  assert.equal(funnel.stage, 'first_minute');
  assert.equal(funnel.primaryAd.id, 'dailyBuff');
  assert.ok(funnel.headline.includes('第 1 天'));
  assert.ok(funnel.primaryAd.reason.includes('摸鱼'));
});

test('first screen funnel recommends crisis skip during active crisis', () => {
  const funnel = createFirstMinuteFunnel(createInitialState(), { activeEventType: 'crisis' });
  assert.equal(funnel.stage, 'crisis');
  assert.equal(funnel.primaryAd.id, 'skipCrisis');
  assert.ok(funnel.primaryAd.reason.includes('危机'));
});

test('first screen funnel recommends revive during failure modal', () => {
  const failed = { ...createInitialState(), stats: { performance: 0, hair: 80, dignity: 70, savings: 5000 } };
  const funnel = createFirstMinuteFunnel(failed, { modalKind: 'failure' });
  assert.equal(funnel.stage, 'game_over');
  assert.equal(funnel.primaryAd.id, 'revive');
  assert.ok(funnel.primaryAd.reason.includes('复活'));
});

test('playtest scenarios cover first minute crisis revive and ending paths', () => {
  const report = runPlaytestScenarios();
  assert.equal(report.passed, true);
  assert.deepEqual(report.scenarios.map((scenario) => scenario.id), [
    'first_minute',
    'crisis_skip',
    'failure_revive',
    'ending_share'
  ]);
  assert.ok(report.scenarios.every((scenario) => scenario.passed));
  assert.equal(report.findings.length, 0);
});

test('playtest markdown renders scenario and finding summary', () => {
  const markdown = createPlaytestMarkdown(runPlaytestScenarios());
  assert.ok(markdown.includes('# M16 真实玩家试玩 QA 报告'));
  assert.ok(markdown.includes('## 试玩路径'));
  assert.ok(markdown.includes('first_minute'));
  assert.ok(markdown.includes('## 问题清单'));
  assert.ok(markdown.includes('暂无开放问题。'));
});

test('browser smoke report summarizes desktop and mobile results', () => {
  const report = createBrowserSmokeReport([
    {
      id: 'desktop',
      viewport: { width: 1366, height: 900 },
      passed: true,
      checks: [{ label: '首屏标题', passed: true }],
      consoleErrors: [],
      screenshot: 'docs/qa/screenshots/desktop.png'
    },
    {
      id: 'mobile',
      viewport: { width: 390, height: 844 },
      passed: true,
      checks: [{ label: '推荐广告', passed: true }],
      consoleErrors: [],
      screenshot: 'docs/qa/screenshots/mobile.png'
    }
  ]);

  assert.equal(report.passed, true);
  assert.equal(report.results.length, 2);
  assert.equal(report.results[0].viewport.width, 1366);
  assert.equal(report.totalChecks, 2);
  assert.equal(report.failedChecks, 0);
});

test('browser smoke markdown includes screenshots and viewport summary', () => {
  const markdown = createBrowserSmokeMarkdown(createBrowserSmokeReport([
    {
      id: 'mobile',
      viewport: { width: 390, height: 844 },
      passed: true,
      checks: [{ label: '行动按钮可点击', passed: true }],
      consoleErrors: [],
      screenshot: 'docs/qa/screenshots/mobile.png'
    }
  ]));

  assert.ok(markdown.includes('# M17 浏览器级 Smoke 报告'));
  assert.ok(markdown.includes('整体状态：PASS'));
  assert.ok(markdown.includes('390x844'));
  assert.ok(markdown.includes('docs/qa/screenshots/mobile.png'));
});

test('ad inventory marks the featured recommendation as non-actionable', () => {
  const items = createAdInventoryItems(createInitialState(), {}, { featuredAdId: 'dailyBuff' });
  const featured = items.find((item) => item.id === 'dailyBuff');
  assert.equal(featured.featured, true);
  assert.equal(featured.actionable, false);
  assert.equal(featured.available, true);
  assert.ok(featured.statusText.includes('左侧推荐'));
});

test('ad inventory keeps available non-featured ads actionable', () => {
  const items = createAdInventoryItems(createInitialState(), {}, { featuredAdId: 'dailyBuff' });
  const talent = items.find((item) => item.id === 'talentUnlock');
  assert.equal(talent.featured, false);
  assert.equal(talent.actionable, true);
  assert.equal(talent.available, true);
  assert.ok(talent.statusText.includes('开放'));
});

test('simulation is deterministic for the same seed', () => {
  const first = simulateRuns({ runs: 25, seed: 12345 });
  const second = simulateRuns({ runs: 25, seed: 12345 });
  assert.deepEqual(first, second);
  assert.equal(first.runs, 25);
  assert.ok(first.averageDays > 0);
  assert.ok(Object.keys(first.endingCounts).length > 0);
  assert.ok(first.reviveRate >= 0);
});

test('difficulty config exposes the three M3 modes', () => {
  assert.deepEqual(DIFFICULTIES.map((difficulty) => difficulty.id), ['normal', 'hard', 'nightmare']);
});

test('layoff evaluation triggers on 30 day checkpoints and changes multiple stats', () => {
  assert.equal(shouldEvaluateLayoff(30), true);
  assert.equal(shouldEvaluateLayoff(31), false);
  const state = {
    ...createInitialState(),
    day: 30,
    hidden: { landmine: 75 },
    stats: { performance: 45, hair: 38, dignity: 42, savings: 1800 }
  };
  const next = evaluateLayoff(state);
  const changed = Object.keys(state.stats).filter((key) => next.stats[key] !== state.stats[key]);
  assert.ok(changed.length >= 2);
  assert.ok(next.hidden.landmine < state.hidden.landmine);
});

test('midcycle layoff evaluations trigger on shadow list days', () => {
  assert.equal(shouldEvaluateLayoff(45), true);
  assert.equal(shouldEvaluateLayoff(75), true);
  assert.equal(shouldEvaluateLayoff(46), false);
});

test('day 75 midcycle evaluation is harsher than day 45', () => {
  const weakState = {
    ...createInitialState({ difficultyId: 'normal' }),
    hidden: { landmine: 58 },
    stats: { performance: 58, hair: 44, dignity: 46, savings: 9000 }
  };
  const day45 = evaluateLayoff({ ...weakState, day: 45 });
  const day75 = evaluateLayoff({ ...weakState, day: 75 });
  assert.ok(day75.stats.performance < day45.stats.performance);
  assert.ok(day75.stats.dignity < day45.stats.dignity);
  assert.ok(day75.stats.savings < day45.stats.savings);
});

test('midcycle shadow list evaluation cannot directly zero core stats', () => {
  const state = {
    ...createInitialState({ difficultyId: 'normal' }),
    day: 75,
    hidden: { landmine: 100 },
    stats: { performance: 2, hair: 2, dignity: 2, savings: 100 }
  };
  const next = evaluateLayoff(state);
  assert.ok(next.stats.performance >= 1);
  assert.ok(next.stats.hair >= 1);
  assert.ok(next.stats.dignity >= 1);
  assert.ok(next.stats.savings >= 1);
});

test('hard difficulty layoff evaluation is harsher than normal', () => {
  const normal = evaluateLayoff({
    ...createInitialState({ difficultyId: 'normal' }),
    day: 30,
    hidden: { landmine: 40 },
    stats: { performance: 72, hair: 70, dignity: 70, savings: 12000 }
  });
  const hard = evaluateLayoff({
    ...createInitialState({ difficultyId: 'hard' }),
    day: 30,
    hidden: { landmine: 40 },
    stats: { performance: 72, hair: 70, dignity: 70, savings: 12000 }
  });
  assert.ok(hard.stats.performance < normal.stats.performance);
});

test('layoff evaluation applies living costs by checkpoint', () => {
  const state = {
    ...createInitialState({ difficultyId: 'normal' }),
    day: 30,
    hidden: { landmine: 10 },
    stats: { performance: 90, hair: 90, dignity: 90, savings: 20000 }
  };
  const next = evaluateLayoff(state);
  assert.ok(next.stats.savings <= 15000);
});

test('later layoff evaluation applies stronger dignity pressure', () => {
  const day30 = evaluateLayoff({
    ...createInitialState({ difficultyId: 'normal' }),
    day: 30,
    hidden: { landmine: 10 },
    stats: { performance: 90, hair: 90, dignity: 90, savings: 30000 }
  });
  const day60 = evaluateLayoff({
    ...createInitialState({ difficultyId: 'normal' }),
    day: 60,
    hidden: { landmine: 10 },
    stats: { performance: 90, hair: 90, dignity: 90, savings: 30000 }
  });
  assert.ok(day60.stats.dignity < day30.stats.dignity);
});

test('simulation summary includes M3 balance diagnostics', () => {
  const summary = simulateRuns({ runs: 100, seed: 20260731, difficultyId: 'normal' });
  assert.ok('failureRate' in summary);
  assert.equal(typeof summary.targetStatus.averageDays, 'boolean');
  assert.equal(typeof summary.targetStatus.reviveRate, 'boolean');
  assert.equal(typeof summary.targetStatus.failureRate, 'boolean');
  assert.equal(typeof summary.targetStatus.failureVariety, 'boolean');
  assert.ok(summary.reviveRate > 0 || summary.failureRate > 0);
});

test('normal simulation hits M6 balance targets', () => {
  const summary = simulateRuns({ runs: 1000, seed: 20260731, difficultyId: 'normal' });
  assert.equal(summary.targetStatus.averageDays, true);
  assert.equal(summary.targetStatus.reviveRate, true);
  assert.equal(summary.targetStatus.failureRate, true);
  assert.equal(summary.targetStatus.failureVariety, true);
});
