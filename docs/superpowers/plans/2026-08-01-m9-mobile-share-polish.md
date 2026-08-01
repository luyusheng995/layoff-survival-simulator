# M9 Mobile Share Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve mobile readability and screenshot-share packaging for ending reports.

**Architecture:** Extend `src/game/report.js` with pure report metadata, test it in `tests/game.test.js`, then wire screenshot mode and responsive styling through `src/main.js` and `src/styles.css`.

**Tech Stack:** Browser JavaScript modules, CSS, Node test runner.

## Global Constraints

- Do not add dependencies.
- Do not implement real image export in M9.
- Keep mobile controls tap-friendly.
- Use TDD for report metadata.

---

### Task 1: Screenshot Report Metadata

**Files:**
- Modify: `src/game/report.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `posterCode: string`
- Produces: `shareBadges: string[]`

- [ ] **Step 1: Write failing tests for `posterCode` and `shareBadges`.**
- [ ] **Step 2: Run `node --test` and confirm failure.**
- [ ] **Step 3: Implement deterministic report code and badges.**
- [ ] **Step 4: Run `node --test` and confirm pass.**

### Task 2: Screenshot Mode UI

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `posterCode`
- Consumes: `shareBadges`

- [ ] **Step 1: Add screenshot-mode state and toggle button.**
- [ ] **Step 2: Render badges and poster code in the share card.**
- [ ] **Step 3: Add responsive CSS for screenshot mode and mobile first screen.**
- [ ] **Step 4: Run tests, syntax checks, HTTP checks, and static smoke checks.**
