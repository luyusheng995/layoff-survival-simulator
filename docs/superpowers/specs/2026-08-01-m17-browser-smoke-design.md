# M17 Browser Smoke Design

## Goal

Add a real browser-level smoke check that catches page rendering, clicking, and mobile layout risks before release.

## Design

- Use a dependency-free Chrome DevTools Protocol runner with installed Microsoft Edge.
- Cover two viewports:
  - desktop: 1366x900
  - mobile: 390x844
- For each viewport:
  - Open `http://127.0.0.1:4173/`.
  - Wait until the app renders.
  - Verify first-screen text exists: title, survival brief, recommended ad, action grid.
  - Click the recommended daily buff ad and wait for the simulated rewarded ad to resolve.
  - Click three actions to trigger the first event.
  - Capture a screenshot under `docs/qa/screenshots/`.
- Generate `docs/qa/m17-browser-smoke-report.md`.
- Keep this smoke separate from `npm test` because it depends on a local headless browser.

## Acceptance Criteria

- `npm run browser:smoke` produces a PASS report.
- Desktop and mobile screenshots are written.
- The report records viewport dimensions, checks, console errors, and screenshot paths.
- The release archive includes browser smoke report and screenshots.
- Existing unit tests, playtest, simulation, and release still pass.
