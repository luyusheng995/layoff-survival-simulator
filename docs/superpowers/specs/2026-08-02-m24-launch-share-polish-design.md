# M24 Launch Share Polish Design

## Goal

Turn the now-public GitHub Pages build into a more shareable playable release.

## Product Shape

- Add the live play URL to README so visitors can immediately open the game.
- Add a compact launch strip near the top of the game shell with:
  - the public Pages URL,
  - a copy-link button,
  - a short version note for the current public alpha.
- Add a small update log panel in the side column so the live game communicates that this is an active playable build.

## UI Direction

Keep the current HR memo/work desk visual language. The new strip should feel like a stamped internal launch memo: useful, compact, and slightly absurd, not like a marketing hero. It should not push the daily action flow below the fold more than necessary on mobile.

## Data Flow

- Add a pure `launch` helper module that owns the public URL, release note entries, and share text.
- `main.js` renders launch metadata from that helper.
- The copy button writes the share URL text to `navigator.clipboard` and logs success/fallback messages through the existing log system.

## Validation

- Unit tests cover the public URL, release notes, and share copy text.
- Browser smoke checks the launch strip and copy-link button exist.
- README includes the public playable URL.
- Local and online browser smoke both pass after the UI change.
