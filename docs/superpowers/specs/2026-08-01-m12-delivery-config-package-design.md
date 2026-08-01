# M12 Delivery Config Package Design

## Goal

Produce a delivery package that can be handed to frontend, publishing, or business stakeholders without reading source code.

## Design

- Add a pure export module that assembles the game configuration from existing source data.
- Export both:
  - machine-readable JSON for frontend/config integration
  - human-readable Markdown for delivery review
- Include gameplay loop, core stats, actions, events, endings, ad placements, difficulty settings, and balance targets.
- Add an npm script so the package can be regenerated after future content changes.

## Acceptance Criteria

- Unit tests verify the exported config contains current production counts.
- Unit tests verify the Markdown includes the key delivery sections.
- `npm run export:config` writes:
  - `dist/game-config.json`
  - `docs/delivery/game-config.md`
- Existing tests, syntax checks, simulation, and local HTTP checks still pass.
