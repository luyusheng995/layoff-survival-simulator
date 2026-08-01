# M8 Rewarded Ad Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the rewarded-video monetization loop with placement config, availability checks, per-placement metrics, and UI feedback.

**Architecture:** Extend `src/game/ads.js` as the single source of truth for ad placement metadata and reward availability. Store ad usage counts in `state.metrics.adPlacements`, render those counts in `src/main.js`, and keep all behavior covered by `tests/game.test.js`.

**Tech Stack:** Browser JavaScript modules, CSS, Node test runner.

## Global Constraints

- Do not integrate a real ad SDK in M8.
- Keep `watchRewardedAd` deterministic and fast for tests.
- Preserve existing reward effects.
- Use TDD for pure ad behavior.

---

### Task 1: Placement Catalog And Metrics

**Files:**
- Modify: `src/game/ads.js`
- Modify: `src/game/state.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `AD_PLACEMENTS`
- Produces: `canUseRewardedAd(state, placementId, context)`
- Produces: placement counts at `state.metrics.adPlacements[placementId]`

- [ ] **Step 1: Write failing tests for placement catalog, availability, and metrics**
- [ ] **Step 2: Run `node --test` and confirm failure**
- [ ] **Step 3: Implement catalog, availability, and metric recording**
- [ ] **Step 4: Run `node --test` and confirm pass**

### Task 2: UI Reward Loop

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `AD_PLACEMENTS`
- Consumes: `canUseRewardedAd`
- Consumes: `watchRewardedAd`

- [ ] **Step 1: Render each placement with title, reward, status, and usage count**
- [ ] **Step 2: Disable unavailable placements with visible reasons**
- [ ] **Step 3: Show a modal-style ad playback overlay while `busyAd` is set**
- [ ] **Step 4: Run syntax, HTTP, and static smoke checks**
