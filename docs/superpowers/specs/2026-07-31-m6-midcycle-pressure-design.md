# M6 Midcycle Pressure Design

## Goal

Bring normal-difficulty average survival time closer to the 65-80 day balance target by adding midcycle pressure before the day 90 final audit.

## Recommended Approach

Use the existing layoff evaluation system and add two lighter checkpoints on days 45 and 75. These represent "shadow list review" moments: project cancellation rumors, half-year performance calibration, and manager stack ranking. This keeps the model simple and testable while creating real mid-game danger.

## Rules

- Keep existing major evaluation days: 30, 60, 90.
- Add midcycle evaluation days: 45 and 75.
- Midcycle pressure is lower than day 60 pressure but high enough to punish weak stats and high landmine.
- Day 45 should cost less savings than major monthly checks.
- Day 75 should cost more than day 45 and increase dignity pressure more sharply.
- Difficulty multipliers continue to apply.
- Existing final ending funnel remains unchanged.

## Acceptance Criteria

- `shouldEvaluateLayoff(45)` and `shouldEvaluateLayoff(75)` return true.
- Day 75 pressure is harsher than day 45 for the same weak state.
- Normal 1000-run simulation should target average survival days between 65 and 80 without losing failure variety.
- M6 balance diagnostics use a broader ad-revive band of 15%-40% because compensated early exits shorten runs without always being hard Game Over states.
- Unit tests and syntax checks pass.
