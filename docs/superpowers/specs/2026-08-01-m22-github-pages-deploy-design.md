# M22 GitHub Pages Deploy Design

## Goal

Publish the current static game as a playable GitHub Pages site from `main`.

## Deployment Shape

- Use GitHub Actions Pages instead of a manual upload.
- Package a clean static artifact into `.pages-dist`.
- Deploy only runtime assets: `index.html`, `favicon.svg`, `src/`, and `dist/`.
- Keep `tests/`, `release/`, `.github/`, `.git/`, and planning docs out of the public site artifact.

## Validation

- Repository tests assert the Pages workflow exists and uses GitHub Pages actions.
- Repository tests assert the Pages package manifest excludes non-runtime folders.
- Local verification runs the same quality gate as CI plus `npm run pages:package`.

