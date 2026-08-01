# M17 Browser Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a no-dependency browser smoke runner for desktop and mobile first-screen QA.

**Architecture:** Add pure report helpers in `src/game/browser-smoke-report.js` for unit-tested report structure. Add `scripts/browser-smoke.mjs` to launch Edge headless, control it over Chrome DevTools Protocol, run viewport scenarios, save screenshots, and write markdown.

**Tech Stack:** Node.js ESM, Edge headless, Chrome DevTools Protocol, `node:test`.

## Global Constraints

- Do not add npm dependencies.
- Keep browser smoke separate from `npm test`.
- Save screenshots under `docs/qa/screenshots/`.
- Include smoke artifacts in the release zip.

---

### Task 1: Report Helpers

**Files:**
- Create: `src/game/browser-smoke-report.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createBrowserSmokeReport(results, options = {})`
- Produces: `createBrowserSmokeMarkdown(report)`

- [ ] **Step 1: Write failing tests for report summary and markdown.**
- [ ] **Step 2: Run `node --test tests/game.test.js` and confirm module-not-found failure.**
- [ ] **Step 3: Implement report helpers.**
- [ ] **Step 4: Re-run tests and confirm PASS.**

### Task 2: CDP Browser Runner

**Files:**
- Create: `scripts/browser-smoke.mjs`
- Modify: `package.json`
- Modify: `scripts/release.mjs`

**Interfaces:**
- Consumes: `createBrowserSmokeReport(results, options = {})`
- Consumes: `createBrowserSmokeMarkdown(report)`

- [ ] **Step 1: Implement Edge discovery and CDP helpers.**
- [ ] **Step 2: Run desktop and mobile viewport checks.**
- [ ] **Step 3: Save screenshots and markdown report.**
- [ ] **Step 4: Add `browser:smoke` npm script.**
- [ ] **Step 5: Add browser smoke artifacts to release zip.**
