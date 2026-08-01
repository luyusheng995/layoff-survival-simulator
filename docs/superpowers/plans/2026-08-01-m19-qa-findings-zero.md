# M19 QA Findings Zero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove stale QA findings and make rewarded ad mock playback metadata explicit.

**Architecture:** Keep all ad SDK mock details in `src/game/ads.js`. Keep playtest findings centralized in `src/game/playtest.js`, with markdown rendering able to show an empty finding state.

**Tech Stack:** Node.js ESM, `node:test`, existing QA scripts.

## Global Constraints

- Do not change placement ids or rewards.
- Do not slow developer tests by waiting 30 seconds.
- Do not remove browser smoke or playtest scripts.

---

### Task 1: Rewarded Ad Mock Metadata

**Files:**
- Modify: `src/game/ads.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- `watchRewardedAd(placement)` returns `{ ok, placement, durationSeconds, reward, playbackMode, mockPlaybackMs }`.

- [ ] **Step 1: Add failing test for `playbackMode` and `mockPlaybackMs`.**
- [ ] **Step 2: Run `node --test tests/game.test.js` and confirm expected assertion failure.**
- [ ] **Step 3: Add metadata to `watchRewardedAd`.**
- [ ] **Step 4: Re-run tests and confirm PASS.**

### Task 2: QA Finding Cleanup

**Files:**
- Modify: `src/game/playtest.js`
- Modify: `tests/game.test.js`
- Generate: `docs/qa/m16-playtest-report.md`

**Interfaces:**
- `runPlaytestScenarios().findings` returns `[]` for the current closed-QA state.
- `createPlaytestMarkdown(report)` renders `暂无开放问题。` when findings are empty.

- [ ] **Step 1: Add failing test for empty findings and markdown empty state.**
- [ ] **Step 2: Remove stale findings from `createFindings`.**
- [ ] **Step 3: Re-run `npm run playtest`.**
- [ ] **Step 4: Run full verification and release.**
