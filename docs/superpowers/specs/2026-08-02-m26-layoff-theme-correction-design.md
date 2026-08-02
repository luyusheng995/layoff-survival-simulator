# M26 Layoff Theme Correction Design

## Goal

Correct the single-screen dashboard so it reads as "big-tech layoff survival" instead of idol growth or fan support.

## Approved Direction

The user rejected bottom-nav labels like "养成", "作品", "打榜", and "后援", and rejected the pink palette as mismatched for a layoff survival game. The UI should keep the compact single-screen structure but use workplace survival language and a restrained corporate-risk palette.

## Content Changes

- Change "角色档案" to "工位档案".
- Use four bottom tabs only: "主页", "策略", "补给", "记录".
- Map secondary content by purpose:
  - "策略": difficulty and talent setup.
  - "补给": ad rewards and public play link.
  - "记录": logs, ending gallery, launch notes, and latest feedback.
- Remove idol/entertainment terms from the main UI: "养成", "作品", "打榜", "后援", "粉丝".

## Visual Changes

- Remove the pink/purple primary palette.
- Use office and layoff-risk colors: off-white workspace background, graphite cards, muted green survival accents, red risk accents, and amber warning accents.
- Keep the phone-like fixed viewport and no page-level vertical scrolling.

## Testing

- Add a regression test that fails if off-theme words return to `src/main.js`.
- Add a regression test that fails if the old pink variable or hot pink hex returns to `src/styles.css`.
- Keep browser smoke checks for no page-level vertical overflow and gameplay clickability.
