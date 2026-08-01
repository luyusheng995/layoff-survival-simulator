# M18 Ad Noise Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove duplicate clickable ad CTAs from the first screen while preserving the full ad inventory.

**Architecture:** Add `src/game/ad-inventory.js` as a pure view-model helper. Update `src/main.js` to consume that helper, render featured inventory as a disabled explanatory card, and update browser smoke to assert a single clickable daily buff CTA.

**Tech Stack:** Node.js ESM, vanilla DOM rendering, Edge/CDP browser smoke, `node:test`.

## Global Constraints

- Do not change rewarded ad placement ids.
- Do not remove the side ad inventory.
- Do not add dependencies.
- Keep `watchRewardedAd` mock fast.

---

### Task 1: Side Inventory Helper

**Files:**
- Create: `src/game/ad-inventory.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createAdInventoryItems(state, context = {}, options = {})`
- Returns items with `{ id, title, buttonText, reward, watched, available, featured, actionable, statusText }`

- [ ] **Step 1: Write failing tests for featured and actionable inventory items.**
- [ ] **Step 2: Run `node --test tests/game.test.js` and confirm module-not-found failure.**
- [ ] **Step 3: Implement helper using `AD_PLACEMENTS` and `canUseRewardedAd`.**
- [ ] **Step 4: Re-run tests and confirm PASS.**

### Task 2: UI and Browser Smoke

**Files:**
- Modify: `src/main.js`
- Modify: `scripts/browser-smoke.mjs`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `createAdInventoryItems(state, adContext(), { featuredAdId })`

- [ ] **Step 1: Replace side ad rendering with inventory helper.**
- [ ] **Step 2: Render featured item without `data-ad`.**
- [ ] **Step 3: Update browser smoke to assert one clickable daily buff CTA.**
- [ ] **Step 4: Run `npm run browser:smoke`, `node --test`, and `npm run release`.**
