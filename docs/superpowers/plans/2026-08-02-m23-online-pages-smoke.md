# M23 Online Pages Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `npm run browser:smoke` support both local development URLs and deployed GitHub Pages URLs.

**Architecture:** Add a pure URL classification helper to the browser smoke report module. Update the smoke script to start the local server only for loopback targets, leaving remote URLs to Chromium navigation and the existing page assertions.

**Tech Stack:** Node.js 24, built-in test runner, Chromium CDP smoke script.

## Global Constraints

- Do not add npm dependencies.
- Keep local `npm run browser:smoke` behavior unchanged for `http://127.0.0.1:4173/`.
- Do not start `scripts/server.mjs` for remote `SMOKE_URL` values.
- Preserve existing screenshot and markdown report outputs.

---

### Task 1: URL Target Classification

**Files:**
- Modify: `src/game/browser-smoke-report.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `shouldStartLocalSmokeServer(url: string): boolean`

- [x] **Step 1: Write the failing test.**

Add a test that asserts:

```js
assert.equal(shouldStartLocalSmokeServer('http://127.0.0.1:4173/'), true);
assert.equal(shouldStartLocalSmokeServer('http://localhost:4173/'), true);
assert.equal(shouldStartLocalSmokeServer('https://luyusheng995.github.io/layoff-survival-simulator/'), false);
```

- [x] **Step 2: Run `node --test tests/game.test.js` and confirm the new helper export is missing.**

- [x] **Step 3: Implement `shouldStartLocalSmokeServer`.**

Use `new URL(url)` and return true only for `localhost`, `127.0.0.1`, or `[::1]`.

- [x] **Step 4: Re-run `node --test tests/game.test.js` and confirm pass.**

### Task 2: Remote Smoke Flow

**Files:**
- Modify: `scripts/browser-smoke.mjs`

**Interfaces:**
- Consumes: `shouldStartLocalSmokeServer(url: string): boolean`

- [x] **Step 1: Import `shouldStartLocalSmokeServer`.**
- [x] **Step 2: Wrap the local server reachability/startup block in `if (shouldStartLocalSmokeServer(appUrl))`.**
- [x] **Step 3: Run local `npm run browser:smoke` and confirm pass.**
- [x] **Step 4: Run remote `SMOKE_URL=https://luyusheng995.github.io/layoff-survival-simulator/ npm run browser:smoke` and confirm pass.**
- [x] **Step 5: Run `npm test` and confirm pass.**
