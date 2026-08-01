# M7 Feedback And Share Design

## Goal

Make the prototype feel more playable and shareable by improving immediate stat feedback, layoff checkpoint awareness, and ending report card content.

## Design

- Add a small feedback module that compares the previous and next state and returns human-readable stat deltas.
- Show a compact "本轮变动" strip below the stat cards after actions, event choices, or rewarded-ad outcomes.
- Show the next layoff checkpoint in the top bar: 30, 45, 60, 75, or 90. Label 45/75 as shadow-list reviews and 30/60/90 as formal calibration.
- Upgrade the ending report with a short share headline and a survival tier so the modal reads more like a social screenshot.
- Keep the current layout structure, but restyle the report card with a stamped, office-document feel.

## Visual Direction

- Palette: `#f5f7fb` worksheet background, `#ffffff` panels, `#18202f` ink, `#136f63` operational green, `#b42318` red stamp, `#f2c94c` warning highlight.
- Typography: system Chinese sans-serif for readability; heavier display weight only for title, stat values, and report headline.
- Signature element: a red "HR REVIEW" style stamp on the share card, visually framing endings as internal documents leaked to social feeds.

## Acceptance Criteria

- Unit tests cover stat delta generation.
- Unit tests cover checkpoint copy for midcycle and final checkpoints.
- Unit tests cover enhanced share report fields.
- The browser UI renders stat delta feedback and checkpoint guidance.
- The ending modal report card includes the new share headline and survival tier.
