# M1 Alpha Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the playable prototype with initial talents, an ending gallery, an 80+ event library, and a balance CSV.

**Architecture:** Keep the zero-dependency ES module structure. Add focused game modules for talents and gallery persistence, keep content in `src/data`, and expose everything through `src/main.js`.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node.js built-in `node --test`, CSV for balance data.

## Global Constraints

- Keep the project zero-dependency and runnable with `node scripts/server.mjs`.
- Event count must be at least 80.
- Event category minimums: daily at least 56, crisis at least 16, opportunity at least 8.
- Every event choice must change at least two values, counting `landmine`.
- Initial talents are `rich_family`, `blame_master`, and `ppt_god`.
- The ending gallery must expose all 12 endings.
- Unlocked ending IDs must persist through `localStorage` when available.
- Ads remain simulated hooks only.

---

## Task 1: Talents And Gallery Rule Tests

**Files:**
- Modify: `tests/game.test.js`

**Interfaces:**
- Expects: `TALENTS`
- Expects: `createInitialState({ selectedTalentId })`
- Expects: `applyTalentToEffects(state, effects, context)`
- Expects: `getEndingGallery(unlockedIds, previewUnlocked)`
- Expects: `getEventStats(EVENTS)`

- [ ] **Step 1: Add failing tests**

Add tests asserting:

```js
import { TALENTS, applyTalentToEffects } from '../src/game/talents.js';
import { getEndingGallery } from '../src/game/gallery.js';
import { getEventStats } from '../src/game/events.js';

test('event library meets M1 category minimums', () => {
  const stats = getEventStats(EVENTS);
  assert.ok(stats.total >= 80);
  assert.ok(stats.daily >= 56);
  assert.ok(stats.crisis >= 16);
  assert.ok(stats.opportunity >= 8);
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
```

- [ ] **Step 2: Run red test**

Run: `node --test tests/game.test.js`

Expected: FAIL because modules or functions do not exist.

## Task 2: Implement Talents, Gallery, Event Stats

**Files:**
- Create: `src/game/talents.js`
- Create: `src/game/gallery.js`
- Modify: `src/game/state.js`
- Modify: `src/game/actions.js`
- Modify: `src/game/events.js`
- Modify: `src/data/endings.js`

**Interfaces:**
- Produces: `TALENTS`
- Produces: `applyTalentToInitialStats(talentId, stats)`
- Produces: `applyTalentToEffects(state, effects, context)`
- Produces: `getEndingGallery(unlockedIds, previewUnlocked)`
- Produces: `getEventStats(events)`

- [ ] **Step 1: Add talent module**

Create `src/game/talents.js` with three talent definitions and effect modifiers:

- `rich_family`: initial savings becomes `15000`.
- `blame_master`: positive `landmine` effects are reduced by 50%, rounded down.
- `ppt_god`: `manage_up` action and choices tagged `ppt` or `reporting` gain `performance +3`.

- [ ] **Step 2: Wire state and effects**

Update `createInitialState(options = {})` to store `selectedTalentId`, apply initial stat modifier, and preserve the existing default behavior when no options are passed.

- [ ] **Step 3: Wire actions and events**

Run every action and event choice effect through `applyTalentToEffects`.

- [ ] **Step 4: Add gallery module**

Create `src/game/gallery.js` to map the 12 endings into locked/unlocked UI data using `condition` fields from ending config.

- [ ] **Step 5: Add ending conditions**

Add a `condition` string to all entries in `src/data/endings.js`.

- [ ] **Step 6: Add event stats**

Export `getEventStats(events = EVENTS)` from `src/game/events.js`.

- [ ] **Step 7: Run green test**

Run: `node --test tests/game.test.js`

Expected: PASS except event count tests until Task 3 expands events.

## Task 3: Expand Events To 80+

**Files:**
- Modify: `src/data/events.js`

**Interfaces:**
- Consumes: existing `EVENTS` shape.
- Produces: at least 80 event objects.

- [ ] **Step 1: Add 50+ new events**

Append enough events to reach at least 80 total. Keep classification minimums: daily at least 56, crisis at least 16, opportunity at least 8.

- [ ] **Step 2: Run event tests**

Run: `node --test tests/game.test.js`

Expected: PASS for event minimums and every choice having at least two effects.

## Task 4: UI For Talents And Ending Gallery

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `TALENTS`, `getEndingGallery`, and ending persistence helpers local to `main.js`.
- Produces: usable talent selection and ending gallery UI.

- [ ] **Step 1: Import M1 modules**

Import `TALENTS` and `getEndingGallery` in `src/main.js`.

- [ ] **Step 2: Add localStorage helpers**

Add `loadUnlockedEndings`, `saveUnlockedEnding`, and `safeStorage` helpers. On terminal ending, persist the ending ID.

- [ ] **Step 3: Render talent panel**

Render a talent panel above ads. Before watching talent unlock ad, show locked talent choices. After ad, allow selecting one talent and restarting with it.

- [ ] **Step 4: Render ending gallery**

Render all 12 endings in a compact gallery. Show locked/unlocked status and conditions when preview is unlocked.

- [ ] **Step 5: Style M1 panels**

Add CSS for `.talent-grid`, `.talent-card`, `.ending-gallery`, and `.ending-item`.

## Task 5: Balance CSV And Verification

**Files:**
- Create: `balance/balance-alpha.csv`

**Interfaces:**
- Produces: human-readable balance source material.

- [ ] **Step 1: Create CSV**

Create `balance/balance-alpha.csv` with sections for actions, talents, ads, ending conditions, and event distribution.

- [ ] **Step 2: Run final checks**

Run:

```powershell
npm test
node --check src/main.js
node --check scripts/server.mjs
```

Expected: all commands exit 0.
