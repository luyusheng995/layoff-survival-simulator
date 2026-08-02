# M23 Online Pages Smoke Design

## Goal

Make the browser smoke command work against the deployed GitHub Pages URL as well as the local development server.

## Problem

The current smoke script probes `SMOKE_URL` with Node `fetch` before launching the browser. On this machine, PowerShell and Chromium can access the GitHub Pages URL, but Node `fetch` fails with `ECONNRESET`. Because the script treats any failed preflight as a local server miss, it starts the local server and waits for the remote URL through Node again, timing out before browser assertions run.

## Design

- Keep the existing local behavior for `http://127.0.0.1:4173/`: if the URL is not reachable, start `scripts/server.mjs` and wait for it.
- Treat non-loopback `SMOKE_URL` values as externally hosted targets: skip local server startup and let Chromium navigate directly to the URL.
- Preserve existing viewport checks, screenshot output, and markdown report generation.
- Add a small pure helper for URL classification so the behavior can be tested without launching browsers or relying on network state.

## Validation

- Unit tests cover local loopback URLs, localhost URLs, and remote HTTPS URLs.
- `npm run browser:smoke` continues to pass locally.
- `SMOKE_URL=https://luyusheng995.github.io/layoff-survival-simulator/ npm run browser:smoke` passes against the deployed site.
