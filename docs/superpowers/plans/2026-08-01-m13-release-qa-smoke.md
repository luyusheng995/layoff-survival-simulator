# M13 Release QA Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic release QA smoke gate and generated checklist.

**Architecture:** Create `src/game/release-checklist.js` with pure checklist builders. Create `scripts/smoke.mjs` to validate exported config and required files, then write `docs/delivery/release-checklist.md`.

**Tech Stack:** Browser JavaScript modules, Node file system APIs, Node test runner.

## Global Constraints

- Do not add dependencies.
- Smoke must run locally without a browser automation library.
- Smoke must fail with non-zero exit when required checks fail.
- Use TDD for checklist behavior.

---

### Task 1: Pure Checklist Builder

**Files:**
- Create: `src/game/release-checklist.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createReleaseChecklist(config, options): { passed, checks }`
- Produces: `createReleaseChecklistMarkdown(result): string`

- [ ] **Step 1: Write failing tests for checklist checks and Markdown.**
- [ ] **Step 2: Run `node --test` and confirm failure.**
- [ ] **Step 3: Implement release checklist builders.**
- [ ] **Step 4: Run `node --test` and confirm pass.**

### Task 2: Smoke Script

**Files:**
- Create: `scripts/smoke.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run smoke`
- Produces: `docs/delivery/release-checklist.md`

- [ ] **Step 1: Add script and package command.**
- [ ] **Step 2: Run `npm run export:config`.**
- [ ] **Step 3: Run `npm run smoke`.**
- [ ] **Step 4: Verify generated checklist and final test suite.**
