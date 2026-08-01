# M15 First Screen Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-screen funnel that highlights the next most relevant rewarded ad and reduces first-minute clutter.

**Architecture:** Add a pure `src/game/funnel.js` helper for stage copy and ad recommendation. Use that helper from `src/main.js` to render a main-column recommended ad card, then adjust CSS hierarchy while preserving existing side-panel controls.

**Tech Stack:** Node.js ESM, `node:test`, vanilla DOM rendering, CSS.

## Global Constraints

- Preserve all existing game mechanics and rewarded ad placement ids.
- Do not add dependencies.
- Tests must be written before production code.
- Recommended ad priority must be revive, skipCrisis, dailyBuff, talentUnlock, endingPreview.
- Mobile must show the recommended ad before the action grid.

---

### Task 1: Funnel Helper

**Files:**
- Create: `src/game/funnel.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createFirstMinuteFunnel(state, context = {})`
- Returns: `{ stage, headline, summary, primaryAd }`
- `primaryAd` shape: `{ id, title, buttonText, reward, reason }` or `null`

- [ ] **Step 1: Write the failing test**

```js
test('first screen funnel recommends daily buff for a fresh run', () => {
  const funnel = createFirstMinuteFunnel(createInitialState());
  assert.equal(funnel.primaryAd.id, 'dailyBuff');
  assert.ok(funnel.headline.includes('第 1 天'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`
Expected: FAIL because `src/game/funnel.js` does not exist.

- [ ] **Step 3: Implement helper**

Create `createFirstMinuteFunnel` and use `canUseRewardedAd` for availability checks.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/game.test.js`
Expected: PASS.

### Task 2: UI Funnel Card

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `createFirstMinuteFunnel(state, adContext())`

- [ ] **Step 1: Render recommended ad card**

Add `renderRecommendedAd()` in `src/main.js` and place it before `renderActions()` in the main column.

- [ ] **Step 2: Style the card and hierarchy**

Add `.funnel-card`, `.funnel-ad-button`, `.hero-memo`, and side-column support styling in `src/styles.css`.

- [ ] **Step 3: Verify**

Run: `node --test`
Run: `npm run release`
Open `http://127.0.0.1:4173/` and confirm the page still serves.
