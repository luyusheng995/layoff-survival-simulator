# M6 Midcycle Pressure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add midcycle layoff checkpoints that reduce average run length while keeping ending variety.

**Architecture:** Extend the existing `src/game/layoffs.js` checkpoint table rather than introducing a new pressure system. Keep tests in `tests/game.test.js` and use the existing simulator as the balance verification harness.

**Tech Stack:** Browser JavaScript modules, Node test runner, local simulator CLI.

## Global Constraints

- Do not add dependencies.
- Keep checkpoint logic deterministic.
- Preserve existing day 30, 60, and 90 behavior shape.
- Use TDD: write failing tests before production changes.

---

### Task 1: Midcycle Checkpoints

**Files:**
- Modify: `tests/game.test.js`
- Modify: `src/game/layoffs.js`

**Interfaces:**
- Consumes: `shouldEvaluateLayoff(day: number): boolean`
- Consumes: `evaluateLayoff(state): state`
- Produces: day 45 and day 75 as valid layoff evaluation checkpoints

- [ ] **Step 1: Write the failing tests**

```js
test('midcycle layoff evaluations trigger on shadow list days', () => {
  assert.equal(shouldEvaluateLayoff(45), true);
  assert.equal(shouldEvaluateLayoff(75), true);
  assert.equal(shouldEvaluateLayoff(46), false);
});

test('day 75 midcycle evaluation is harsher than day 45', () => {
  const weakState = {
    ...createInitialState({ difficultyId: 'normal' }),
    hidden: { landmine: 58 },
    stats: { performance: 58, hair: 44, dignity: 46, savings: 9000 }
  };
  const day45 = evaluateLayoff({ ...weakState, day: 45 });
  const day75 = evaluateLayoff({ ...weakState, day: 75 });
  assert.ok(day75.stats.performance < day45.stats.performance);
  assert.ok(day75.stats.dignity < day45.stats.dignity);
  assert.ok(day75.stats.savings < day45.stats.savings);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL because days 45 and 75 are not evaluation checkpoints.

- [ ] **Step 3: Implement minimal code**

Add days 45 and 75 to `shouldEvaluateLayoff`, extend the stage multiplier, dignity pressure, and living cost tables.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS.

### Task 2: Balance Verification

**Files:**
- Modify if needed: `src/game/layoffs.js`

**Interfaces:**
- Consumes: `npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal`
- Produces: average survival days in or near 65-80, revive rate between 0.15 and 0.4, hard failure rate between 0.1 and 0.35, at least three failure endings

- [ ] **Step 1: Run simulation**

Run: `npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal`
Expected: Inspect `averageDays`, `reviveRate`, `failureRate`, and `failureVariety`.

- [ ] **Step 2: Tune only checkpoint constants if needed**

Adjust only stage multipliers, dignity pressure, or living cost values in `src/game/layoffs.js`.

- [ ] **Step 3: Run final verification**

Run: `node --test`
Run: `node --check src/main.js`
Run: `node --check scripts/server.mjs`
Run: `node --check scripts/simulate.mjs`
Run: `npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal`
