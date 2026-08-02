# M26 Layoff Theme Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace off-theme idol/fan UI language and pink visuals with workplace survival naming and a corporate-risk palette.

**Architecture:** Keep the existing `src/main.js` dashboard structure and `src/styles.css` fixed-viewport layout. Only change labels, secondary tab mapping, smoke expectations, palette variables, and QA evidence.

**Tech Stack:** Vanilla JavaScript modules, CSS, Node `node:test`, existing CDP browser smoke script.

## Global Constraints

- Keep the public page URL unchanged.
- Keep page-level vertical scrolling disabled in mobile smoke.
- Preserve existing gameplay hooks: `[data-action]`, `[data-ad]`, `[data-copy-launch]`, `[data-choice]`, `[data-tab]`.
- Do not introduce new runtime dependencies.

---

### Task 1: Theme Regression Test

**Files:**
- Modify: `tests/game.test.js`

**Interfaces:**
- Consumes: current `src/main.js` and `src/styles.css`.
- Produces: a failing test that blocks off-theme vocabulary and pink primary color from returning.

- [ ] **Step 1: Write the failing test**

```js
test('mobile dashboard copy and palette match the layoff survival theme', () => {
  const main = readFileSync('src/main.js', 'utf8');
  const styles = readFileSync('src/styles.css', 'utf8');
  for (const offThemeText of ['养成', '作品', '打榜', '后援', '粉丝', '角色档案']) {
    assert.equal(main.includes(offThemeText), false, offThemeText);
  }
  assert.equal(styles.includes('--pink'), false);
  assert.equal(styles.includes('#f23a85'), false);
  assert.ok(main.includes('工位档案'));
  assert.ok(main.includes('策略'));
  assert.ok(main.includes('补给'));
  assert.ok(main.includes('记录'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`
Expected: FAIL because old labels and pink variables exist.

### Task 2: Copy And Navigation

**Files:**
- Modify: `src/main.js`
- Modify: `scripts/browser-smoke.mjs`

**Interfaces:**
- Consumes: `activeTab`, secondary render functions, browser smoke text checks.
- Produces: four tabs named `home`, `strategy`, `resources`, and `records`.

- [ ] **Step 1: Replace labels**

Change the main card to "工位档案" and the bottom nav to "主页 / 策略 / 补给 / 记录".

- [ ] **Step 2: Remap secondary panels**

Move difficulty and talents under "策略", ads and link sharing under "补给", and logs/endings/launch notes under "记录".

- [ ] **Step 3: Update browser smoke**

Change the role-card smoke text from "角色档案" to "工位档案" and require all four new tab hooks.

### Task 3: Palette Correction

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing class names.
- Produces: a non-pink corporate-risk palette.

- [ ] **Step 1: Replace variables**

Remove `--pink`, `--pink-soft`, `--violet`, `#f23a85`, and the pink/purple gradients.

- [ ] **Step 2: Apply new palette**

Use graphite, muted green, risk red, amber, and off-white workspace background.

- [ ] **Step 3: Fix bottom nav**

Change the bottom nav grid from six equal columns to four equal columns.

### Task 4: Verification And Publish

**Files:**
- Generated/updated: `docs/qa/m17-browser-smoke-report.md`
- Generated/updated: `docs/qa/screenshots/m17-mobile.png`
- Generated/updated: `docs/qa/screenshots/m17-desktop.png`

**Interfaces:**
- Consumes: existing test, playtest, browser smoke, and Pages package scripts.
- Produces: deployed public page with the corrected theme.

- [ ] **Step 1: Run verification**

Run: `node --test`, `npm run playtest`, `npm run browser:smoke`, and `npm run pages:package`.

- [ ] **Step 2: Publish**

Commit changes and publish to GitHub Pages. Use GitHub CLI API fallback only if native git push cannot reach GitHub.
