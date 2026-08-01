# M3 Balance Pressure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add layoff evaluations, difficulty settings, and simulation target diagnostics so the game produces meaningful failure pressure.

**Architecture:** Add pure difficulty and layoff evaluation modules, wire evaluation into event day advancement, expose difficulty in state/UI/simulator, and extend simulator summaries with target diagnostics.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Node.js built-in `node --test`.

## Global Constraints

- Keep zero dependencies.
- Difficulty IDs are exactly `normal`, `hard`, and `nightmare`.
- Layoff evaluations trigger on days 30, 60, and 90 after event choice resolution.
- Simulator summary includes `failureRate` and `targetStatus`.
- Normal difficulty should produce at least one failure or revive in deterministic smoke simulation.

---

## Task 1: Red Tests

**Files:**
- Modify: `tests/game.test.js`

**Interfaces:**
- Expects: `DIFFICULTIES`
- Expects: `evaluateLayoff(state)`
- Expects: `shouldEvaluateLayoff(day)`

- [ ] **Step 1: Add failing tests**

Add tests for difficulty list, layoff evaluation penalties, hard greater than normal, and simulator diagnostics.

- [ ] **Step 2: Run red test**

Run: `node --test tests/game.test.js`

Expected: FAIL because difficulty/evaluation exports do not exist.

## Task 2: Difficulty And Layoff Evaluation

**Files:**
- Create: `src/game/difficulty.js`
- Create: `src/game/layoffs.js`
- Modify: `src/game/state.js`
- Modify: `src/game/events.js`

**Interfaces:**
- Produces: `DIFFICULTIES`
- Produces: `getDifficulty(id)`
- Produces: `shouldEvaluateLayoff(day)`
- Produces: `evaluateLayoff(state)`

- [ ] **Step 1: Implement difficulties**

Create three difficulty configs with evaluation and crisis multipliers.

- [ ] **Step 2: Store difficulty in state**

`createInitialState({ difficultyId })` stores `difficultyId`, defaulting to `normal`.

- [ ] **Step 3: Implement layoff evaluation**

Calculate risk from low stats and landmine, apply penalties to at least performance and dignity, and append a log.

- [ ] **Step 4: Wire event flow**

After event choice and before day advance, run evaluation when current day is 30/60/90.

## Task 3: Simulator Diagnostics

**Files:**
- Modify: `src/game/simulator.js`
- Modify: `scripts/simulate.mjs`

**Interfaces:**
- `simulateRuns({ runs, seed, difficultyId })`

- [ ] **Step 1: Pass difficulty to state**

Allow simulator CLI to accept `--difficulty normal|hard|nightmare`.

- [ ] **Step 2: Add failure rate**

Summary includes failures / runs.

- [ ] **Step 3: Add target status**

Summary includes pass/fail booleans for averageDays, reviveRate, failureRate, and failureVariety.

## Task 4: UI Difficulty Picker

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `DIFFICULTIES`.

- [ ] **Step 1: Import difficulties**

Show difficulty label in top bar.

- [ ] **Step 2: Add difficulty panel**

Selecting a difficulty restarts the run with that difficulty.

- [ ] **Step 3: Style difficulty controls**

Use compact cards matching the talent panel.

## Task 5: Final Verification

**Files:**
- None unless tests reveal gaps.

- [ ] **Step 1: Run final checks**

Run `npm test`, `node --check`, `npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal`, and HTTP smoke.
