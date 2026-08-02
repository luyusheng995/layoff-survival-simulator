# M24 Launch Share Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public play link, copy-link affordance, and lightweight update log to the deployed game.

**Architecture:** Create a small pure launch metadata module for URL, notes, and share text. Render that metadata in `main.js` using the existing panel/event-handler style, then extend browser smoke to assert the launch controls exist.

**Tech Stack:** Node.js 24, built-in test runner, vanilla JS, CSS, Chromium CDP smoke script.

## Global Constraints

- Do not add npm dependencies.
- Keep the game first screen focused on play; the launch strip must be compact.
- Keep existing local and online browser smoke commands passing.
- Use the public URL `https://luyusheng995.github.io/layoff-survival-simulator/`.

---

### Task 1: Launch Metadata Contract

**Files:**
- Create: `src/game/launch.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `PUBLIC_PLAY_URL: string`
- Produces: `getLaunchNotes(): Array<{ version: string, label: string, detail: string }>`
- Produces: `createLaunchShareText(url?: string): string`

- [x] **Step 1: Write failing tests for URL, notes, and share text.**
- [x] **Step 2: Run `node --test tests/game.test.js` and confirm `launch.js` is missing.**
- [x] **Step 3: Implement `src/game/launch.js`.**
- [x] **Step 4: Re-run `node --test tests/game.test.js` and confirm pass.**

### Task 2: Launch UI

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`
- Modify: `scripts/browser-smoke.mjs`
- Modify: `README.md`
- Modify: `tests/game.test.js`

**Interfaces:**
- Consumes: `PUBLIC_PLAY_URL`, `getLaunchNotes`, `createLaunchShareText`

- [x] **Step 1: Add README public play URL test.**
- [x] **Step 2: Add browser smoke assertion for the launch strip and copy-link button.**
- [x] **Step 3: Render launch strip below the topbar and update log in the side column.**
- [x] **Step 4: Add `copyLaunchLink()` and route `[data-copy-launch]` clicks.**
- [x] **Step 5: Add compact styles for launch strip and update log.**
- [x] **Step 6: Add the public play URL to README.**
- [x] **Step 7: Run `npm test`, local `npm run browser:smoke`, and online Pages smoke.**
