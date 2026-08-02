# M27 First Day UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the mobile dashboard around the first-day operation loop so new players understand how to spend 3 energy and progress days.

**Architecture:** Keep the existing vanilla JS render loop in `src/main.js`, but replace the crowded home composition with focused components: `renderSurvivalSummary()`, `renderEnergyGuide()`, and a roomier `renderActions()`. Keep secondary tabs in `renderSecondaryTabPanel()` but wrap each tab with a single page header and simpler section styling.

**Tech Stack:** Vanilla JavaScript modules, CSS, Node `node:test`, existing CDP browser smoke script.

## Global Constraints

- The public page URL remains unchanged.
- Mobile viewport must keep no page-level vertical scrolling.
- Gameplay hooks must stay intact: `[data-action]`, `[data-ad]`, `[data-choice]`, `[data-copy-launch]`, `[data-tab]`.
- Home page must explicitly explain: 3 daily energy, action spends 1 energy, energy empty triggers a company event, event resolution advances the day.
- No new runtime dependencies.

---

### Task 1: First-Day Operation Test

**Files:**
- Modify: `tests/game.test.js`
- Modify: `scripts/browser-smoke.mjs`

**Interfaces:**
- Consumes: current browser smoke contract.
- Produces: checks for `今日精力`, `消耗 1 精力`, `精力用完`, `.energy-dot`, and no home-main `能力面板` title.

- [ ] **Step 1: Write the failing test**

```js
test('home dashboard teaches the daily energy operation loop', () => {
  const main = readFileSync('src/main.js', 'utf8');
  const smoke = readFileSync('scripts/browser-smoke.mjs', 'utf8');
  assert.ok(main.includes('今日精力'));
  assert.ok(main.includes('消耗 1 精力'));
  assert.ok(main.includes('精力用完'));
  assert.ok(main.includes('energy-dot'));
  assert.equal(main.includes('<h2>能力面板</h2>'), false);
  assert.ok(smoke.includes('今日精力'));
  assert.ok(smoke.includes('消耗 1 精力'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`
Expected: FAIL because the current UI still centers on the old ability-panel label and lacks energy dots.

### Task 2: Home Components

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Produces: `renderSurvivalSummary()`, `renderEnergyGuide()`, updated `renderActions()`, and updated `renderHomeTab()`.

- [ ] **Step 1: Replace the large work-profile card**

Render a compact `survival-summary` instead of the large `character-card` on home.

- [ ] **Step 2: Add the energy guide**

Render `今日精力 ${state.energy}/3`, three `.energy-dot` markers, and operation copy.

- [ ] **Step 3: Make action cards self-explanatory**

Every action button shows `消耗 1 精力` and keeps the existing `data-action` hook.

### Task 3: Layout And Density CSS

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: classes from Task 2.
- Produces: roomy two-column actions, compact survival strip, and less boxed secondary tabs.

- [ ] **Step 1: Update home grid**

Use rows for status, summary, energy guide, action grid, survival strip, and nav.

- [ ] **Step 2: Restyle actions**

Use two columns, larger hit areas, and fewer tiny stats per card.

- [ ] **Step 3: Restyle secondary tabs**

Use one header per tab and lighter section cards.

### Task 4: Verify And Publish

**Files:**
- Generated/updated: `docs/qa/m17-browser-smoke-report.md`
- Generated/updated: `docs/qa/screenshots/m17-mobile.png`
- Generated/updated: `docs/qa/screenshots/m17-desktop.png`

**Interfaces:**
- Consumes: `node --test`, `npm run playtest`, `npm run browser:smoke`, `npm run pages:package`.
- Produces: deployed public playable page.

- [ ] **Step 1: Run verification**

Run all verification commands and inspect the mobile screenshot.

- [ ] **Step 2: Publish**

Commit and publish. Use the GitHub CLI API fallback only if normal git push remains blocked by stale remote refs or network issues.
