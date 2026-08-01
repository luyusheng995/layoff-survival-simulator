# M5 Ending Funnel Design

## Goal

Reduce over-broad `silent_survivor` endings by treating day 90 as a final layoff-cycle audit. A player who technically reaches day 90 but has weak core stats should resolve into a thematically sharper failure ending instead of the neutral fallback.

## Behavior Changes

- Track `minDignity` in state metrics so temporary dignity collapse can influence final endings.
- Keep hard failures unchanged: any core stat at zero still triggers immediate Game Over.
- Preserve top positive finales first:
  - `reverse_promoted`
  - `side_hustle_escape`
- Add soft final failure checks after top positive finales:
  - low savings becomes `home_rent`
  - low current or historical dignity becomes `quit_naked`
  - low hair becomes `hair_collapse`
  - low performance becomes `fired_performance`
- Keep `year_bonus` as a healthy-enough success result.
- Make `silent_survivor` require a minimum acceptable floor across all four core stats.
- If no named ending applies, map the weakest final stat to the matching failure ending.

## Acceptance Criteria

- Tests prove that final-day low dignity resolves to `quit_naked` even above zero.
- Tests prove that final-day low savings resolves to `home_rent` instead of `silent_survivor`.
- Tests prove that `silent_survivor` still exists for stable but unspectacular states.
- Tests prove that `minDignity` is tracked by state metrics.
- Simulation shows less dominance by `silent_survivor` and at least three failure ending types on normal difficulty.
