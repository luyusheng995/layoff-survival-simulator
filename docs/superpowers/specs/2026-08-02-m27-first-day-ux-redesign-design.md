# M27 First Day UX Redesign Design

## Goal

Make the game understandable for first-time players and reduce visual crowding across all tabs.

## Approved Direction

The home page should explain the core loop at a glance: each day starts with 3 energy, every action spends 1 energy, spending all energy triggers a company event, and resolving the event advances to the next day.

## Page Structure

### Home

- Top status: day/time, money, layoff risk, and share link only.
- Main card: "今日精力" with a large `3/3` counter and three energy dots.
- Instruction line: "点击一个行动，消耗 1 精力。精力用完后，公司事件会自动出现。"
- Action area: five action buttons in roomy two-column cards. Each button explicitly says "消耗 1 精力".
- Compact survival strip: only five small indicators at the bottom, with lighter visual weight than the action area.
- When an event is active, hide the action grid and give the current event card more room.

### Strategy

- One page header that says this page changes the next run.
- Show difficulty cards first and talent cards second.
- Remove duplicated explanatory text where the card title already explains the action.

### Resources

- One page header that explains ad rewards are optional.
- Show the recommended/available rewards as a clean list.
- Move the public share link into a quiet utility row.

### Records

- One page header.
- Use grouped sections for latest log, endings, launch notes, and feedback instead of stacking many equally heavy cards.

## Visual Direction

- Keep the graphite/green/red layoff-survival palette.
- Use larger whitespace and fewer boxed areas.
- Card priority: primary action card > event card > secondary page sections.
- Avoid nesting cards inside cards.

## Testing

- Add a regression test for the first-day operation copy and energy-dot UI hooks.
- Update browser smoke to check "今日精力", "消耗 1 精力", and "精力用完".
- Preserve mobile no page-level vertical scrolling and click smoke.
