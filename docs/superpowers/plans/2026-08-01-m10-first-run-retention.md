# M10 First Run Retention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dismissible first-run checklist that guides players through the core loop.

**Architecture:** Create `src/game/onboarding.js` as a pure checklist generator, test it in `tests/game.test.js`, then render and persist dismiss state in `src/main.js` with styles in `src/styles.css`.

**Tech Stack:** Browser JavaScript modules, CSS, Node test runner.

## Global Constraints

- Do not add dependencies.
- Keep onboarding optional and dismissible.
- Keep copy in-world and concise.
- Use TDD for checklist logic.

---

### Task 1: Onboarding Checklist Logic

**Files:**
- Create: `src/game/onboarding.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createOnboardingBrief(state, options): { visible, title, progress, tasks }`

- [ ] **Step 1: Write failing tests for fresh and progressed states.**
- [ ] **Step 2: Run `node --test` and confirm failure.**
- [ ] **Step 3: Implement the checklist generator.**
- [ ] **Step 4: Run `node --test` and confirm pass.**

### Task 2: UI Rendering And Persistence

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `createOnboardingBrief`

- [ ] **Step 1: Load and save onboarding dismiss state through local storage.**
- [ ] **Step 2: Render the checklist near the action panel.**
- [ ] **Step 3: Add a dismiss button and click handler.**
- [ ] **Step 4: Add compact mobile styles.**
- [ ] **Step 5: Run tests, syntax checks, HTTP checks, and static smoke checks.**
