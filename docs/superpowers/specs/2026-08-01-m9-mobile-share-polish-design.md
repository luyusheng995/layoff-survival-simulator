# M9 Mobile Share Polish Design

## Goal

Improve mobile playability and make ending reports easier to screenshot and share without adding screenshot-generation dependencies.

## Design

- Extend `createShareReport` with screenshot-friendly fields:
  - `posterCode`: deterministic short report code.
  - `shareBadges`: 2-4 short badges that summarize the run.
- Add a screenshot mode toggle in the ending modal.
- In screenshot mode, visually focus on the share card and reduce surrounding chrome.
- On small screens, keep stat tiles in two columns, reduce title scale, and make action/event controls easier to scan.
- Keep the existing HTML/CSS architecture and avoid canvas or image-export libraries.

## Acceptance Criteria

- Unit tests prove `posterCode` is deterministic.
- Unit tests prove `shareBadges` include survival tier and run-specific badges.
- The ending modal renders a screenshot-mode toggle.
- The share card renders badges and report code.
- Mobile CSS preserves two-column stat tiles while keeping actions single-column.
