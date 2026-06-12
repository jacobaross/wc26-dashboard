# DESIGN — "Field of 48" Design System

Concept: **a stadium at night**. Floodlit pitch green, chalk-white line markings as structure, scoreboard typography, trophy gold. Edits should feel like they came from the same designer.

## Tokens (CSS variables in `:root`)

| Token | Value | Use |
|---|---|---|
| `--pitch` | `#0B3D2E` | Page background (with two faint radial glows: gold top-right, red bottom-left) |
| `--pitch-deep` | `#072B20` | Topbar, inputs, recessed surfaces |
| `--pitch-card` | `#0E4636` | All cards/tables |
| `--chalk` | `#F7F4EC` | Primary text — warm white, like pitch chalk |
| `--chalk-dim` | `#B9CFC4` | Secondary text |
| `--gold` | `#E8B541` | THE accent: scores, points, active tab, qualification marks, favorites |
| `--red` | `#E2543E` | Sparingly: live/today indicators, dark horses, the Final |
| `--line` / `--line-strong` | chalk @ 16% / 34% | Borders and pitch-marking rules |

Rule of thumb: gold = the prize/leaders, red = urgency/underdogs. Never introduce a third accent.

## Typography

- **Anton** (display): all headings, scores, points, big numbers. Always uppercase, `font-weight:400` (Anton has one weight — never fake-bold it), slight letter-spacing.
- **Archivo** (body/UI): everything else. Labels are small caps style: ~0.62–0.72rem, `letter-spacing:.14–.24em`, uppercase, dim color.

## Signature elements (protect these)

1. **Pitch markings as structure.** Section headers are a "touchline": flex row of `h2` + 2px rule with a center-spot dot (`.sect .rule::after`). The hero has a center circle + halfway line (`::before`/`::after`). Any new section uses `.sect`.
2. **Scoreboard tables.** Standings use Anton numerals, gold points column, and a 3px inset gold bar on qualifying rows (`tr.qpos td.tname`).
3. **Broadcast chrome.** Sticky topbar with pulsing live dot + matchday chip; pill tabs, gold when active.

## Component patterns (reuse, don't reinvent)

- `.match` cards: meta row → two team rows with right-aligned Anton score → venue → optional italic gold note.
- `.story` / `.story.alt` cards: gold or red top border, Anton heading with leading emoji, dim body.
- `.odd-row`: rank / team / probability bar / moneyline grid; bars animate width on tab open (1s ease).
- Modal: gradient panel, flag at 3.2rem, facts grid, gold section labels.

## Motion & accessibility floor

- Animations: card hover lift (translateY −3px), panel fade-rise on tab switch, odds bars, live-dot pulse. That's the full budget — don't add more.
- `prefers-reduced-motion: reduce` kills all of it; keep that block last in the CSS.
- Keep: `:focus-visible` gold outline, Esc/overlay modal close, focus return to invoking element, `aria-selected` on tabs, mobile breakpoint at 640px (hides odds bars and hero pitch markings).

## Copy voice

Confident broadcast-desk tone with wit, never sarcasm about teams' fans. Concrete over hype: name players, scores, streaks, odds. Storyline headings: emoji + 2–4 word title. Notes on matches: one factual clause. No exclamation-point pileups.
