# M12 Delivery Config Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a complete game configuration package for handoff and publishing.

**Architecture:** Create `src/game/config-export.js` with pure config/Markdown builders. Create `scripts/export-config.mjs` to write JSON and Markdown artifacts. Add `export:config` to `package.json`.

**Tech Stack:** Browser JavaScript modules, Node file system APIs, Node test runner.

## Global Constraints

- Do not duplicate source config manually in the export.
- Generated JSON must be stable and frontend-readable.
- Generated Markdown must be concise but complete.
- Use TDD for config export behavior.

---

### Task 1: Pure Export Builders

**Files:**
- Create: `src/game/config-export.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createGameConfig(options): object`
- Produces: `createDeliveryMarkdown(config): string`

- [ ] **Step 1: Write failing tests for config counts and Markdown sections.**
- [ ] **Step 2: Run `node --test` and confirm failure.**
- [ ] **Step 3: Implement pure export builders.**
- [ ] **Step 4: Run `node --test` and confirm pass.**

### Task 2: Artifact Export Script

**Files:**
- Create: `scripts/export-config.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run export:config`
- Produces: `dist/game-config.json`
- Produces: `docs/delivery/game-config.md`

- [ ] **Step 1: Add script and package command.**
- [ ] **Step 2: Run export command.**
- [ ] **Step 3: Verify JSON and Markdown artifacts exist and match counts.**
