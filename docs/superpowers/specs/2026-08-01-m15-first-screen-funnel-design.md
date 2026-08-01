# M15 First Screen Funnel Design

## Goal

Make the first minute of play feel more like a clear survival loop and less like a full admin console.

## Design

- Add a focused first-screen funnel helper that summarizes the current run stage and recommends one rewarded ad at a time.
- Put the recommended ad near the action area as a "今日救命广告" card.
- Prioritize ad recommendations by urgency:
  - Game Over failure modal: revive.
  - Active crisis event: skip crisis.
  - Normal first-minute play: daily buff.
  - If daily buff is unavailable: talent unlock, then ending preview.
- Keep the full ad catalog in the side column, but treat it as supporting inventory rather than the primary first-screen conversion surface.
- Preserve all existing controls and game rules.
- Keep the tone in-world: HR broadcast, survival dashboard, and anti-chicken-soup copy.

## Visual Direction

- The topbar becomes a tighter "survival desk" rather than a generic dashboard.
- The signature element is a stamped conversion card: one recommended ad framed as a company survival permit.
- Do not introduce a new one-note palette. Keep the existing calm work-tool palette and add emphasis through border, stamp, and layout hierarchy.
- Mobile keeps the recommended ad before the action grid so the first scroll has a clear call to action.

## Acceptance Criteria

- Unit tests prove a fresh run recommends the daily buff ad.
- Unit tests prove an active crisis recommends skip crisis.
- Unit tests prove a failure modal recommends revive.
- UI renders the recommended ad in the main play column.
- Full test suite passes.
- Release package regenerates successfully.
