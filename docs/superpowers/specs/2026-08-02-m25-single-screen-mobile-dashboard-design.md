# M25 Single Screen Mobile Dashboard Design

## Goal

Turn the public playable page into a mobile-first game dashboard that fits the primary home experience into one viewport without page-level vertical scrolling.

## Approved Direction

Use a visual structure close to the reference image: compact status strip, large character/profile card, current mission card, ability panel, and persistent bottom navigation. Keep the game's layoff-survival theme, but shift the surface from desktop report layout to mobile game UI.

## Layout

- The root page uses `100dvh` and hides page-level overflow.
- `.game-shell` becomes a fixed-height mobile stage with five areas: status, avatar card, mission/action card, ability panel, bottom nav.
- Long-form secondary content moves behind bottom navigation sections instead of appearing below the fold on the home view.
- Desktop remains playable by centering the same phone-like stage rather than returning to the old two-column layout.

## Content Mapping

- Status strip: day, difficulty, money, performance, energy, and risk.
- Character card: game title, player archetype, selected talent/difficulty, headline stats, and launch-copy CTA.
- Mission card: first-run checklist when visible, recommended ad, current event, or "spend energy" prompt.
- Ability panel: five action buttons shown as compact skill tiles with value deltas.
- Bottom nav: home, growth, ads, endings, logs. Non-home tabs use internal panel scrolling only when needed.

## Visual System

- Palette: blush background `#fff5fb`, hot pink `#f23a85`, violet `#8b45ff`, ink `#211a33`, mint `#72f0c8`, sky `#3aa7ff`, amber `#ffc234`.
- Type: system Chinese sans stack with heavy display weights and compact labels.
- Signature: the character card uses an abstract HR badge/avatar mark instead of stock imagery, so the interface feels like this game rather than a generic idol app clone.

## Testing

- Add a browser smoke regression that checks the mobile viewport has no page-level vertical overflow.
- Add checks for the new mobile dashboard anchors: character card, mission card, ability panel, and bottom nav.
- Preserve existing gameplay click smoke: recommended ad, action buttons, event resolution, copy launch link.
