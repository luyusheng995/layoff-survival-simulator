export function createPagesPackageManifest() {
  return {
    outputDir: '.pages-dist',
    entries: [
      { from: 'index.html', to: 'index.html', kind: 'file' },
      { from: 'favicon.svg', to: 'favicon.svg', kind: 'file' },
      { from: 'src', to: 'src', kind: 'directory' },
      { from: 'dist', to: 'dist', kind: 'directory' }
    ],
    excludedTopLevelPaths: ['.git', '.github', '.pages-dist', 'balance', 'docs', 'release', 'scripts', 'tests']
  };
}

