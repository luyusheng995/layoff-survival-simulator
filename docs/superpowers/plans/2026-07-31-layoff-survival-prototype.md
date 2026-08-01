# Layoff Survival Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable zero-dependency browser prototype of 《大厂裁员生存模拟器》 with the 90-day loop, core stats, event choices, Game Over, simulated rewarded-ad revive, and endings.

**Architecture:** Use plain HTML/CSS/JavaScript ES modules so the project can run without dependency installation. Keep game rules in focused modules under `src/game`, content configuration under `src/data`, rendering and DOM wiring in `src/main.js`, and verification in Node's built-in `node:test` runner.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node.js built-in `node --test`, a tiny local static server in `scripts/server.mjs`.

## Global Constraints

- First playable prototype uses 90 in-game days.
- Each day gives exactly 3 energy points.
- Player actions are fixed to: 加班干活、摸鱼划水、向上管理、抱团站队、副业赚钱.
- Core stats are performance initial 60 max 100, hair initial 80 max 100, dignity initial 70 max 100, savings initial 5000 no upper limit.
- Game Over triggers when performance, hair, dignity, or savings reaches 0 or below.
- Every event choice must change at least two values, counting landmine as a value.
- First prototype implements simulated ads only, not a real ad SDK.
- Death revive can be used once and restores core stats to 50% of their initial/max baseline.
- First screen is the game experience, not a marketing landing page.
- Mobile buttons must be at least 44px high and all interactions must work without hover.

---

## File Structure

- Create `package.json`: scripts for serving and testing without external dependencies.
- Create `index.html`: root page and semantic DOM containers.
- Create `scripts/server.mjs`: static file server for local play.
- Create `src/styles.css`: responsive game UI.
- Create `src/main.js`: app state, rendering, event handlers, modal wiring.
- Create `src/game/constants.js`: stat bounds, max day, action definitions.
- Create `src/game/state.js`: new game creation, stat clamping, stat mutation.
- Create `src/game/actions.js`: action application and daily energy rules.
- Create `src/game/events.js`: event filtering, weighted random selection, choice validation and application.
- Create `src/game/endings.js`: Game Over and final ending logic.
- Create `src/game/ads.js`: simulated rewarded-ad API and ad hook effects.
- Create `src/data/events.js`: initial event library of 30 structured events.
- Create `src/data/endings.js`: 12 ending definitions, with 6 active in prototype flow.
- Create `tests/game.test.js`: unit tests for rules and events.

## Task 1: Project Skeleton And Static Runner

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `scripts/server.mjs`
- Create: `src/styles.css`

**Interfaces:**
- Produces: `npm start` runs a local server at `http://127.0.0.1:4173/`.
- Produces: `index.html` loads `./src/main.js` as an ES module.

- [ ] **Step 1: Create package scripts**

Create `package.json` with:

```json
{
  "name": "layoff-survival-simulator",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node scripts/server.mjs",
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create static server**

Create `scripts/server.mjs` with a Node `http.createServer` static server that serves project files, maps `/` to `index.html`, returns correct content types for `.html`, `.css`, `.js`, `.json`, `.svg`, and listens on `process.env.PORT || 4173`.

- [ ] **Step 3: Create HTML shell**

Create `index.html` with:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>大厂裁员生存模拟器</title>
    <link rel="stylesheet" href="./src/styles.css" />
  </head>
  <body>
    <main id="app" class="app" aria-live="polite"></main>
    <script type="module" src="./src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Create initial responsive CSS**

Create `src/styles.css` with base colors, status grid, action buttons, event card, logs, and modal classes. Buttons use `min-height: 44px`; narrow screens use a two-column stat grid.

- [ ] **Step 5: Run static server smoke check**

Run: `node scripts/server.mjs`

Expected: terminal prints `Layoff simulator running at http://127.0.0.1:4173/`.

## Task 2: Core State And Actions

**Files:**
- Create: `src/game/constants.js`
- Create: `src/game/state.js`
- Create: `src/game/actions.js`
- Create: `tests/game.test.js`

**Interfaces:**
- Produces: `createInitialState(): GameState`
- Produces: `applyAction(state: GameState, actionId: string): GameState`
- Produces: `clampCoreStats(state: GameState): GameState`
- Produces: `ACTION_DEFS: ActionDefinition[]`

- [ ] **Step 1: Write failing tests for initial state and actions**

In `tests/game.test.js`, import from `src/game/state.js` and `src/game/actions.js`. Add tests:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState } from '../src/game/state.js';
import { applyAction } from '../src/game/actions.js';

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/game.test.js`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement constants**

Create `src/game/constants.js` exporting:

```js
export const MAX_DAY = 90;
export const DAILY_ENERGY = 3;
export const STAT_LIMITS = {
  performance: { initial: 60, min: 0, max: 100 },
  hair: { initial: 80, min: 0, max: 100 },
  dignity: { initial: 70, min: 0, max: 100 },
  savings: { initial: 5000, min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY }
};
export const ACTION_DEFS = [
  { id: 'overtime', label: '加班干活', cost: 1, effects: { performance: 8, hair: -6, landmine: -2 } },
  { id: 'slack_off', label: '摸鱼划水', cost: 1, effects: { performance: -5, hair: 5, dignity: 6 } },
  { id: 'manage_up', label: '向上管理', cost: 1, effects: { performance: 6, dignity: -6, landmine: 4 } },
  { id: 'alliance', label: '抱团站队', cost: 1, effects: { dignity: -3, landmine: -8, performance: 2 } },
  { id: 'side_hustle', label: '副业赚钱', cost: 1, effects: { savings: 800, hair: -5, performance: -2 } }
];
```

- [ ] **Step 4: Implement state helpers**

Create `src/game/state.js` with immutable state updates, `createInitialState`, `applyEffects`, `clampCoreStats`, `appendLog`, and `advanceDay`.

- [ ] **Step 5: Implement actions**

Create `src/game/actions.js` that finds an action by id, verifies energy, applies effects, decrements energy by 1, and appends a Chinese feedback log.

- [ ] **Step 6: Run tests to verify pass**

Run: `node --test tests/game.test.js`

Expected: PASS for initial state and action tests.

## Task 3: Events, Endings, And Ad Hooks

**Files:**
- Create: `src/game/events.js`
- Create: `src/game/endings.js`
- Create: `src/game/ads.js`
- Create: `src/data/events.js`
- Create: `src/data/endings.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `EVENTS: GameEvent[]`
- Produces: `pickEvent(state: GameState, rng?: () => number): GameEvent`
- Produces: `applyEventChoice(state: GameState, eventId: string, choiceId: string): GameState`
- Produces: `getFailure(state: GameState): Ending | null`
- Produces: `getFinalEnding(state: GameState): Ending | null`
- Produces: `watchRewardedAd(placement: string): Promise<{ ok: true, placement: string }>`
- Produces: `reviveFromAd(state: GameState): GameState`

- [ ] **Step 1: Add event and ending tests**

Append tests that assert:

```js
import { EVENTS } from '../src/data/events.js';
import { applyEventChoice, pickEvent } from '../src/game/events.js';
import { getFailure, getFinalEnding } from '../src/game/endings.js';
import { reviveFromAd } from '../src/game/ads.js';

test('event library has at least 30 events and every choice changes at least two values', () => {
  assert.ok(EVENTS.length >= 30);
  for (const event of EVENTS) {
    assert.ok(['daily', 'crisis', 'opportunity'].includes(event.type));
    for (const choice of event.choices) {
      assert.ok(Object.keys(choice.effects).length >= 2, `${event.id}/${choice.id}`);
    }
  }
});

test('event choice applies effects and advances to the next day', () => {
  const state = { ...createInitialState(), energy: 0, currentEventId: 'daily_sync_001' };
  const next = applyEventChoice(state, 'daily_sync_001', 'align_harder');
  assert.equal(next.day, 2);
  assert.equal(next.energy, 3);
  assert.notEqual(next.stats.performance, state.stats.performance);
});

test('failure and revive rules work', () => {
  const failed = { ...createInitialState(), stats: { ...createInitialState().stats, dignity: 0 } };
  assert.equal(getFailure(failed).id, 'quit_naked');
  const revived = reviveFromAd(failed);
  assert.equal(revived.revivesUsed, 1);
  assert.ok(revived.stats.performance >= 50);
  assert.ok(revived.stats.hair >= 50);
  assert.ok(revived.stats.dignity >= 50);
});

test('day 90 can produce a final ending', () => {
  const state = { ...createInitialState(), day: 90, stats: { performance: 95, hair: 55, dignity: 45, savings: 28000 } };
  assert.equal(getFinalEnding(state).id, 'reverse_promoted');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/game.test.js`

Expected: FAIL because event, ending, and ad modules do not exist.

- [ ] **Step 3: Implement 30 events**

Create `src/data/events.js` exporting `EVENTS`. Include 21 daily, 6 crisis, and 3 opportunity events. Use dense workplace satire. Every event has `id`, `type`, `title`, `body`, `weight`, `minDay`, `maxDay`, and `choices`.

- [ ] **Step 4: Implement event engine**

Create `src/game/events.js` with filtering by day, crisis weighting when `landmine >= 80`, deterministic weighted pick with injectable `rng`, choice lookup, effect application, landmine burst, and daily advance after choice.

- [ ] **Step 5: Implement endings**

Create `src/data/endings.js` with 12 endings. Create `src/game/endings.js` with failure checks and final ending priority.

- [ ] **Step 6: Implement ad hooks**

Create `src/game/ads.js` with `watchRewardedAd` resolving after a short timeout, `reviveFromAd` enforcing one revive, and helpers for daily buff and skip crisis.

- [ ] **Step 7: Run tests to verify pass**

Run: `node --test tests/game.test.js`

Expected: PASS for all rule tests.

## Task 4: Browser UI And Playable Flow

**Files:**
- Create: `src/main.js`
- Modify: `src/styles.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: all modules from Tasks 2 and 3.
- Produces: playable browser UI with no build step.

- [ ] **Step 1: Implement render state**

Create `src/main.js` with module-level `let state = createInitialState(); let activeEvent = null; let modal = null;`. Render into `#app` using template strings and DOM event listeners.

- [ ] **Step 2: Implement status and action UI**

Render day, energy, performance, hair, dignity, savings, and a hidden-risk label. Render 5 action buttons. Disable action buttons when `state.energy === 0` or modal is active.

- [ ] **Step 3: Implement event UI**

When energy reaches 0, pick an event and display its choices. Clicking a choice applies effects, advances the day, checks failure or final ending, and re-renders.

- [ ] **Step 4: Implement ad buttons**

Add visible simulated ad controls for daily buff, skip crisis, ending preview, talent unlock placeholder, and Game Over revive. Buttons call functions from `ads.js` and show clear log feedback.

- [ ] **Step 5: Implement modal flow**

Show Game Over and ending modals with title, description, restart button, and revive button when allowed.

- [ ] **Step 6: Polish responsive CSS**

Finalize `src/styles.css` so status tiles, event card, action grid, logs, and modal are readable on 375px mobile and desktop.

- [ ] **Step 7: Manual smoke check**

Run: `node scripts/server.mjs`

Open: `http://127.0.0.1:4173/`

Expected: A new game appears, actions consume energy, an event appears after 3 actions, choices advance days, Game Over can revive once, and restart works.

## Task 5: Final Verification And Delivery Notes

**Files:**
- Modify: `docs/superpowers/specs/2026-07-31-layoff-survival-prototype-design.md` only if implementation reality diverges.

**Interfaces:**
- Consumes: completed prototype.
- Produces: verified local run instructions.

- [ ] **Step 1: Run unit tests**

Run: `node --test`

Expected: all tests pass.

- [ ] **Step 2: Run server smoke command**

Run: `node scripts/server.mjs`

Expected: prints local URL. Stop the server after confirming it starts.

- [ ] **Step 3: Check file inventory**

Run: `Get-ChildItem -Recurse -File | Select-Object FullName`

Expected: project contains docs, index, scripts, src, data, and tests files.

- [ ] **Step 4: Report limitations**

Final notes must say:

- Real ad SDK is not connected; ads are simulated hooks.
- Event library is prototype-sized at 30+ events, not the final 200.
- Excel export is deferred to the next asset-production milestone.
