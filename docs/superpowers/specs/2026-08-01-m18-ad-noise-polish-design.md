# M18 Ad Noise Polish Design

## Goal

Reduce first-screen ad repetition so the recommended rewarded ad feels like one clear CTA, while the side column remains a secondary inventory view.

## Design

- Add a pure ad inventory helper that marks the currently recommended ad as `featured`.
- Featured side inventory items must be non-actionable and explain that the ad is already recommended on the left.
- Keep non-featured ad inventory buttons actionable when available.
- Update ad copy to say "模拟 30 秒激励视频" where the development mock is described.
- Add a browser smoke assertion that only one clickable daily buff CTA exists on the first screen.

## Acceptance Criteria

- Unit tests prove the recommended daily buff is marked featured and non-actionable in side inventory.
- Unit tests prove non-featured available ads remain actionable.
- Browser smoke proves desktop and mobile still pass and that only one daily buff CTA is clickable.
- Release package regenerates successfully.
