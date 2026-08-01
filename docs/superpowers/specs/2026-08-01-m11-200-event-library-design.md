# M11 200 Event Library Design

## Goal

Reach the delivery requirement of at least 200 structured random events while preserving the intended 70/20/10 category mix.

## Design

- Keep the existing `EVENTS` export and event schema unchanged.
- Expand with generated topic pools:
  - 140 daily events minimum.
  - 40 crisis events minimum.
  - 20 opportunity events minimum.
- Preserve current event choice rules:
  - Daily events have 2 choices.
  - Crisis events have 3 choices.
  - Opportunity events have 2 or more choices.
  - Every choice changes at least 2 values.
- Use unique IDs for all generated events.
- Keep copy dense with workplace jokes, internet-company jargon, and anti-inspirational feedback.

## Acceptance Criteria

- Tests prove total event count is at least 200.
- Tests prove category counts are at least 140 daily, 40 crisis, and 20 opportunity.
- Tests prove every event ID is unique.
- Existing gameplay tests and simulation still pass.
