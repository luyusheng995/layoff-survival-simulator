# M10 First Run Retention Design

## Goal

Help first-time players understand the core loop quickly without a heavy tutorial screen.

## Design

- Add a compact "入职待办" panel during the first run.
- Present four checklist beats:
  - Spend the first energy point.
  - Resolve the first company event.
  - Watch one rewarded video.
  - Unlock the first ending.
- Let players dismiss the panel and persist that choice in local storage.
- Keep the copy in-world, as if it is an onboarding checklist from HR, not a generic instruction manual.
- Keep the panel near the action area so it supports the first few clicks without blocking play.

## Acceptance Criteria

- Unit tests cover checklist progress from a fresh state.
- Unit tests cover completed checklist items after actions/events/ads/endings.
- UI renders the onboarding panel when not dismissed.
- UI supports dismissing the panel.
- Mobile layout keeps the onboarding panel compact.
