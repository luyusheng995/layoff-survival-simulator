# M22 GitHub Pages Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the current static game as a playable GitHub Pages site from `main`.

**Architecture:** Add a tiny Pages packaging module that describes the runtime-only static artifact. Add a GitHub Actions workflow that packages `.pages-dist` and deploys it with GitHub Pages actions after the regular release gate passes.

**Tech Stack:** GitHub Actions, GitHub Pages, Node.js 24, built-in test runner.

## Global Constraints

- Do not add npm dependencies.
- Do not upload `tests/`, `release/`, `.git/`, or planning docs to Pages.
- Keep `main` as the deployment source.
- Keep the existing CI workflow unchanged unless Pages requires a separate gate.

---

### Task 1: Pages Package Contract

**Files:**
- Modify: `tests/game.test.js`
- Create: `src/game/pages-package.js`
- Create: `scripts/package-pages.mjs`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `createPagesPackageManifest(): { outputDir: string, entries: Array<{ from: string, to: string, kind: 'file' | 'directory' }>, excludedTopLevelPaths: string[] }`
- Produces: `npm run pages:package`, which writes `.pages-dist`.

- [x] **Step 1: Add failing tests for the Pages package manifest and npm script.**
- [x] **Step 2: Run `node --test tests/game.test.js` and confirm the module/script is missing.**
- [x] **Step 3: Implement `src/game/pages-package.js` and `scripts/package-pages.mjs`.**
- [x] **Step 4: Add `pages:package` to `package.json` and `.pages-dist/` to `.gitignore`.**
- [x] **Step 5: Run `node --test tests/game.test.js` and `npm run pages:package`.**

### Task 2: GitHub Pages Workflow

**Files:**
- Create: `.github/workflows/pages.yml`
- Modify: `tests/game.test.js`

**Interfaces:**
- Workflow contains `npm run pages:package`, `actions/upload-pages-artifact`, and `actions/deploy-pages`.
- Workflow has `pages: write` and `id-token: write` permissions.

- [x] **Step 1: Add failing workflow contract test.**
- [x] **Step 2: Run tests and confirm `.github/workflows/pages.yml` is missing.**
- [x] **Step 3: Add Pages workflow.**
- [ ] **Step 4: Run full verification, commit, push, and check the Pages deployment URL.**
