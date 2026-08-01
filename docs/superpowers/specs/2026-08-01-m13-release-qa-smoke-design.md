# M13 Release QA Smoke Design

## Goal

Create a lightweight release QA gate so the project can be handed off with a clear pass/fail checklist.

## Design

- Add a pure release checklist builder that evaluates the exported game config.
- Add a smoke script that:
  - regenerates the delivery config
  - validates core counts and required files
  - writes a Markdown QA checklist
  - exits non-zero if a required check fails
- Keep the smoke check local and deterministic, without requiring a browser automation dependency.

## Acceptance Criteria

- Unit tests verify required release checks are present and pass for current config.
- `npm run smoke` produces `docs/delivery/release-checklist.md`.
- Smoke output reports all checks passed.
- Existing tests, syntax checks, simulation, export, and HTTP checks still pass.
