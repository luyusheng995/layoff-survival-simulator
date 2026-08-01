# M7 Feedback And Share Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible stat feedback, layoff checkpoint guidance, and a stronger ending share card.

**Architecture:** Add pure presentation helpers in `src/game/feedback.js`, extend `src/game/report.js`, then wire both into `src/main.js` and `src/styles.css`. Tests stay in `tests/game.test.js` and exercise pure functions.

**Tech Stack:** Browser JavaScript modules, CSS, Node test runner.

## Global Constraints

- Do not add dependencies.
- Keep mobile layout readable in a single column.
- Avoid adding tutorial text; UI labels should carry the workflow.
- Use TDD for new pure behavior.

---

### Task 1: Feedback Helpers

**Files:**
- Create: `src/game/feedback.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createStatDeltas(beforeState, afterState): Array<{ key, label, before, after, delta, tone, text }>`
- Produces: `getNextCheckpoint(day): { day, label, daysLeft, tone }`

- [ ] **Step 1: Write failing tests**

```js
test('feedback helper summarizes stat deltas with tones', () => {
  const before = createInitialState();
  const after = { ...before, stats: { ...before.stats, performance: 68, hair: 74 }, hidden: { landmine: 8 } };
  const deltas = createStatDeltas(before, after);
  assert.equal(deltas.find((item) => item.key === 'performance').text, '绩效分 +8');
  assert.equal(deltas.find((item) => item.key === 'hair').tone, 'bad');
});
```

- [ ] **Step 2: Run `node --test` and confirm failure**

- [ ] **Step 3: Implement `src/game/feedback.js`**

- [ ] **Step 4: Run `node --test` and confirm pass**

### Task 2: Share Report Upgrade

**Files:**
- Modify: `src/game/report.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `shareHeadline: string`
- Produces: `survivalTier: string`

- [ ] **Step 1: Write failing report test**

- [ ] **Step 2: Implement report fields and include them in `shareText`**

- [ ] **Step 3: Run `node --test` and confirm pass**

### Task 3: UI Wiring

**Files:**
- Modify: `src/main.js`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `createStatDeltas`
- Consumes: `getNextCheckpoint`
- Consumes: `shareHeadline` and `survivalTier`

- [ ] **Step 1: Render checkpoint and feedback strip in the top bar**

- [ ] **Step 2: Capture before/after state around actions, choices, and ad outcomes**

- [ ] **Step 3: Render upgraded share card fields**

- [ ] **Step 4: Run syntax checks and browser smoke**
