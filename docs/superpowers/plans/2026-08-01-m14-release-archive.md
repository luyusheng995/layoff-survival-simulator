# M14 Release Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repeatable release packaging flow that produces a versioned archive, manifest, and handoff README for the current playable web build.

**Architecture:** Keep packaging logic in a focused pure module under `src/game/release-package.js`, then expose it through `scripts/release.mjs`. The script runs after config export and smoke, gathers the static app files, writes a deterministic stored ZIP, and records the exact file inventory.

**Tech Stack:** Node.js ESM, `node:test`, built-in `node:fs/promises`, no new dependencies.

## Global Constraints

- Do not introduce third-party packages for zip creation.
- Keep release artifacts under `release/`.
- Release package must include the playable HTML, source modules, generated config, and delivery docs.
- Tests must be written before production code.
- Existing gameplay, event, balance, and smoke tests must remain green.

---

### Task 1: Release Manifest and Archive Helpers

**Files:**
- Create: `src/game/release-package.js`
- Modify: `tests/game.test.js`

**Interfaces:**
- Produces: `createReleaseManifest(config, options)`
- Produces: `createReleaseReadme(manifest)`
- Produces: `createStoredZip(entries)`

- [ ] **Step 1: Write the failing test**

```js
test('release manifest captures versioned package inventory', () => {
  const manifest = createReleaseManifest(createGameConfig({ version: 'test-version' }), {
    generatedAt: '2026-08-01T00:00:00.000Z',
    files: [
      { path: 'index.html', bytes: 1200 },
      { path: 'src/main.js', bytes: 3000 },
      { path: 'dist/game-config.json', bytes: 9000 },
      { path: 'docs/delivery/game-config.md', bytes: 2000 },
      { path: 'docs/delivery/release-checklist.md', bytes: 1000 }
    ]
  });

  assert.equal(manifest.packageName, 'layoff-survival-simulator-vtest-version');
  assert.equal(manifest.version, 'test-version');
  assert.equal(manifest.eventCount, 200);
  assert.equal(manifest.endingCount, 12);
  assert.equal(manifest.adPlacementCount, 5);
  assert.ok(manifest.files.some((file) => file.path === 'index.html'));
});

test('stored zip writer creates a valid zip envelope', () => {
  const zip = createStoredZip([
    { path: 'hello.txt', content: Buffer.from('hello') },
    { path: 'nested/world.txt', content: Buffer.from('world') }
  ]);

  assert.equal(zip.subarray(0, 4).toString('hex'), '504b0304');
  assert.equal(zip.subarray(zip.length - 22, zip.length - 18).toString('hex'), '504b0506');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`
Expected: FAIL because `src/game/release-package.js` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/game/release-package.js` with deterministic manifest creation, README rendering, CRC32 calculation, and a stored ZIP writer.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/game.test.js`
Expected: PASS.

### Task 2: Release Script and Package Command

**Files:**
- Create: `scripts/release.mjs`
- Modify: `package.json`
- Generate: `release/layoff-survival-simulator-v0.1.0.zip`
- Generate: `release/layoff-survival-simulator-v0.1.0-manifest.json`
- Generate: `release/README.md`

**Interfaces:**
- Consumes: `createReleaseManifest(config, options)`
- Consumes: `createReleaseReadme(manifest)`
- Consumes: `createStoredZip(entries)`

- [ ] **Step 1: Write the failing test**

```js
test('release readme summarizes archive contents for handoff', () => {
  const manifest = createReleaseManifest(createGameConfig({ version: 'test-version' }), {
    generatedAt: '2026-08-01T00:00:00.000Z',
    archiveName: 'layoff-survival-simulator-vtest-version.zip',
    files: [{ path: 'index.html', bytes: 1200 }]
  });
  const readme = createReleaseReadme(manifest);

  assert.ok(readme.includes('# 大厂裁员生存模拟器 Release'));
  assert.ok(readme.includes('layoff-survival-simulator-vtest-version.zip'));
  assert.ok(readme.includes('事件数：200'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`
Expected: FAIL because `createReleaseReadme` is missing.

- [ ] **Step 3: Write minimal implementation**

Add `createReleaseReadme`, then create `scripts/release.mjs` and add `"release": "node scripts/release.mjs"` to `package.json`.

- [ ] **Step 4: Run release command**

Run: `npm run export:config`
Run: `npm run smoke`
Run: `npm run release`
Expected: release archive, manifest, and README are generated.

- [ ] **Step 5: Run full verification**

Run: `node --test`
Run: `npm run simulate -- --runs 1000 --seed 20260731 --difficulty normal`
Run: `npm run release`
Expected: all pass.
