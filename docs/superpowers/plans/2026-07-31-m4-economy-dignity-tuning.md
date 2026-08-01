# M4 Economy And Dignity Tuning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tune revive, monthly costs, and dignity pressure to diversify failure outcomes.

**Architecture:** Adjust existing ad and layoff modules only, then verify with tests and seeded simulations.

**Tech Stack:** JavaScript ES modules, Node.js built-in `node --test`.

## Global Constraints

- Revive restores core stats to at least 40, savings to at least 2000, adds landmine 18, and costs dignity 8.
- Monthly living costs are applied during 30/60/90 day layoff evaluations.
- Dignity pressure increases by stage.
- Keep zero dependencies.

---

## Task 1: Red Tests

**Files:**
- Modify: `tests/game.test.js`

**Steps:**
- [ ] Update revive expectations to 40 and landmine increase.
- [ ] Add living cost and staged dignity pressure tests.
- [ ] Run `node --test tests/game.test.js` and confirm failure.

## Task 2: Implement M4 Tuning

**Files:**
- Modify: `src/game/ads.js`
- Modify: `src/game/layoffs.js`
- Modify: `balance/balance-alpha.csv`

**Steps:**
- [ ] Change revive formula.
- [ ] Add living cost tables by difficulty and checkpoint.
- [ ] Add fixed stage dignity pressure.
- [ ] Update balance CSV with M4 values.
- [ ] Run `node --test`.

## Task 3: Final Verification

**Steps:**
- [ ] Run `npm test`.
- [ ] Run `node --check src/main.js`.
- [ ] Run `node --check scripts/simulate.mjs`.
- [ ] Run `npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal`.
- [ ] Run HTTP smoke against `http://127.0.0.1:4173/`.
