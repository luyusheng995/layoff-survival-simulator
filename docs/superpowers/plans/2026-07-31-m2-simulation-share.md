# M2 Simulation And Share Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic balance simulation and a shareable ending report card.

**Architecture:** Add metrics to state updates, implement pure report and simulation modules, expose simulation through a Node CLI, and render the report inside the existing ending modal.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node.js built-in `node --test`.

## Global Constraints

- Keep the project zero-dependency.
- Simulation must be deterministic for the same seed.
- CLI command must be `npm run simulate -- --runs 1000 --seed 20260731`.
- Share card must not require image or canvas dependencies.
- Ads remain simulated hooks only.

---

## Task 1: Tests For Metrics, Report, And Simulation

**Files:**
- Modify: `tests/game.test.js`

**Interfaces:**
- Expects: `createShareReport(state, ending)`
- Expects: `simulateRuns({ runs, seed })`

- [ ] **Step 1: Add failing tests**

Add tests for:

```js
import { createShareReport } from '../src/game/report.js';
import { simulateRuns } from '../src/game/simulator.js';

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
  assert.ok(report.shareText.includes('大厂裁员生存模拟器'));
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
```

- [ ] **Step 2: Run red test**

Run: `node --test tests/game.test.js`

Expected: FAIL because `report.js`, `simulator.js`, or metrics do not exist.

## Task 2: Implement Metrics And Share Report

**Files:**
- Modify: `src/game/state.js`
- Modify: `src/game/actions.js`
- Modify: `src/game/events.js`
- Modify: `src/game/ads.js`
- Create: `src/game/report.js`

**Interfaces:**
- Produces: `state.metrics`
- Produces: `createShareReport(state, ending)`

- [ ] **Step 1: Add metrics defaults**

`createInitialState` initializes `metrics` with `maxPerformance`, `minHair`, `actionsTaken`, `eventsResolved`, and `adsWatched`.

- [ ] **Step 2: Update metrics on state changes**

`applyEffects` updates max performance and min hair. `applyAction` increments actions. `applyEventChoice` increments events. Ad reward functions increment ads watched.

- [ ] **Step 3: Add report module**

Create `createShareReport(state, ending)` returning ending fields, days survived, max performance, hair lost, final savings, revives used, diagnosis, and share text.

- [ ] **Step 4: Run green test**

Run: `node --test tests/game.test.js`

Expected: PASS except simulator tests until Task 3.

## Task 3: Implement Simulator And CLI

**Files:**
- Create: `src/game/simulator.js`
- Create: `scripts/simulate.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `simulateRuns({ runs, seed })`
- Produces: `npm run simulate -- --runs 1000 --seed 20260731`

- [ ] **Step 1: Add deterministic RNG and policy**

Implement an LCG RNG, action policy, event choice policy, single-run loop, and aggregate summary.

- [ ] **Step 2: Add CLI**

Create `scripts/simulate.mjs` to parse `--runs` and `--seed`, call `simulateRuns`, and print formatted JSON.

- [ ] **Step 3: Add package script**

Add `"simulate": "node scripts/simulate.mjs"` to `package.json`.

- [ ] **Step 4: Run tests and CLI**

Run:

```powershell
node --test
npm run simulate -- --runs 20 --seed 20260731
```

Expected: tests pass and CLI prints JSON with `runs: 20`.

## Task 4: Render Share Card In UI

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `createShareReport`.
- Produces: report card in terminal modal and copy button.

- [ ] **Step 1: Import report module**

Import `createShareReport`.

- [ ] **Step 2: Store terminal ending in modal**

Include ending object in modal data so the share report can render.

- [ ] **Step 3: Render report card**

Render report fields inside modal for both failure and victory endings.

- [ ] **Step 4: Add copy behavior**

Add a `data-copy-report` button using `navigator.clipboard.writeText` when available; otherwise append a log asking the user to copy manually.

- [ ] **Step 5: Style share card**

Add `.share-card`, `.share-grid`, and `.copy-button` styles.

## Task 5: Final Verification

**Files:**
- None unless failures reveal a gap.

**Interfaces:**
- Produces: verified M2 handoff.

- [ ] **Step 1: Run final checks**

Run:

```powershell
npm test
node --check src/main.js
node --check scripts/server.mjs
node --check scripts/simulate.mjs
npm run simulate -- --runs 100 --seed 20260731
```

Expected: all commands exit 0 and simulation prints JSON.
