# M20 CI Quality Gate Design

## Goal

Move the current local quality gate into GitHub Actions so every push can rerun core tests, playtest QA, browser smoke, balance simulation, and release packaging.

## Design

- Add `.github/workflows/ci.yml`.
- Trigger CI on `push` and `pull_request` to `main`.
- Use Node.js 24 to match the local runtime.
- Run:
  - `node --test`
  - `npm run playtest`
  - `npm run browser:smoke`
  - `npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal`
  - `npm run release`
- Upload QA reports, screenshots, and release artifacts for inspection.
- Extend browser discovery in `scripts/browser-smoke.mjs` so GitHub-hosted Linux runners can use installed Chrome or Chromium.

## Acceptance Criteria

- Unit tests prove CI workflow exists and includes all quality gate commands.
- Unit tests prove browser smoke discovers Linux Chrome/Chromium candidate paths in addition to Windows Edge.
- Local `node --test`, `npm run browser:smoke`, simulation, and release pass.
- CI workflow is committed and pushed to GitHub.
