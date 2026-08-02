# M25 Single Screen Mobile Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current long scrolling web layout with a mobile-first single-screen dashboard for the public playable page.

**Architecture:** Keep the existing single `src/main.js` render loop and event handlers, but reshape the HTML into a fixed-height stage with tabbed secondary panels. CSS in `src/styles.css` owns the no-scroll layout, card sizing, responsive constraints, and reference-image-inspired visual system.

**Tech Stack:** Vanilla JavaScript modules, CSS, Node `node:test`, existing CDP browser smoke script.

## Global Constraints

- The public page URL remains `https://luyusheng995.github.io/layoff-survival-simulator/`.
- The root page must not vertically scroll in the 390x844 mobile smoke viewport.
- Gameplay actions, rewarded ad buttons, launch-copy CTA, ending modals, and restart flow must keep their existing `data-*` hooks.
- Long secondary content may scroll inside its own panel, not at the document level.
- No new runtime dependencies.

---

### Task 1: Browser Smoke Contract

**Files:**
- Modify: `tests/game.test.js`
- Modify: `scripts/browser-smoke.mjs`

**Interfaces:**
- Consumes: existing `scripts/browser-smoke.mjs` CDP checks.
- Produces: smoke checks named `移动端无上下滚动`, `角色卡`, `当前任务卡`, `能力面板`, and `底部导航`.

- [ ] **Step 1: Write the failing test**

```js
test('browser smoke enforces the single screen mobile dashboard contract', () => {
  const script = readFileSync('scripts/browser-smoke.mjs', 'utf8');
  assert.ok(script.includes('移动端无上下滚动'));
  assert.ok(script.includes('document.documentElement.scrollHeight <= window.innerHeight + 1'));
  assert.ok(script.includes('角色档案'));
  assert.ok(script.includes('当前任务'));
  assert.ok(script.includes('能力面板'));
  assert.ok(script.includes('data-tab="home"'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`
Expected: FAIL because `scripts/browser-smoke.mjs` does not yet include the single-screen checks.

- [ ] **Step 3: Add smoke checks**

Add mobile-only vertical overflow check and text checks for the new dashboard anchors.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/game.test.js`
Expected: PASS.

### Task 2: Render Mobile Dashboard

**Files:**
- Modify: `src/main.js`

**Interfaces:**
- Consumes: existing state, action, event, ad, launch, onboarding, talent, difficulty, gallery, and log helpers.
- Produces: `renderHomeTab()`, `renderSecondaryTabPanel()`, `renderBottomNav()`, and `activeTab` state.

- [ ] **Step 1: Write minimal implementation after Task 1 is red**

Add `activeTab = 'home'`, render a phone-stage layout, and keep existing click handlers while adding `[data-tab]` handling.

- [ ] **Step 2: Preserve gameplay hooks**

Ensure `[data-ad="dailyBuff"]`, `[data-action]`, `[data-copy-launch]`, `[data-choice]`, `[data-talent]`, `[data-difficulty]`, and modal hooks still exist.

- [ ] **Step 3: Run tests**

Run: `node --test tests/game.test.js`
Expected: PASS.

### Task 3: Single-Screen Styling

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: classes emitted by Task 2.
- Produces: `100dvh` no-scroll body, centered phone stage, fixed bottom nav, compact cards, and internal secondary panel scrolling.

- [ ] **Step 1: Implement CSS**

Set `html`, `body`, `.app`, and `.game-shell` to viewport-constrained layout. Style the dashboard cards with the approved palette and stable dimensions.

- [ ] **Step 2: Run browser smoke**

Run: `npm run browser:smoke`
Expected: PASS with mobile no-scroll check.

### Task 4: Package And Publish

**Files:**
- Generated: `.pages-dist`
- Generated/updated: `docs/qa/m17-browser-smoke-report.md`
- Generated/updated: `docs/qa/screenshots/m17-mobile.png`
- Generated/updated: `docs/qa/screenshots/m17-desktop.png`

**Interfaces:**
- Consumes: existing GitHub Pages packaging and deployment workflow.
- Produces: updated public playable build.

- [ ] **Step 1: Run full verification**

Run: `node --test`, `npm run playtest`, `npm run browser:smoke`, and `npm run pages:package`.
Expected: all pass.

- [ ] **Step 2: Commit and publish**

Commit the code and docs. Push or use the existing GitHub API fallback only if native git push still cannot reach GitHub.
