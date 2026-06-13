# Agent instructions for WC26 dashboard

This repo hosts Jacob's Field of 48 World Cup 2026 dashboard.

## First stop

Before editing, read:

1. `HERMES.md` — project context and current hosting state.
2. `docs/AGENT_BRIEF.md` — maintenance mission, cadence, and guardrails.
3. `docs/INSTRUCTIONS.md` — how to update scores, dates, odds, and copy.
4. `docs/DESIGN.md` — visual system; preserve the stadium-at-night feel.
5. `docs/HOSTING.md` — deployment/domain details.

## Operating rules

- Production is `https://wc26.jacobross.com/`, served by GitHub Pages.
- The app is a static single-file dashboard at `public/index.html`.
- Run `npm run smoke` after every content or code edit.
- Never invent scores, live data, odds, or broadcast details. Verify from reliable public sources.
- Watch score order: `s:[homeGoals, awayGoals]` follows the `MATCHES` home/away order.
- Keep the app dependency-light: no external JS libraries unless Jacob explicitly approves.
- Pushing `main` publishes publicly through GitHub Pages; only push when Jacob asked for the change or has approved the release.

## Verification before reporting done

- `npm run smoke` passes.
- If deployed, GitHub Pages workflow succeeds.
- Live URL returns HTTP 200 and contains expected dashboard markers.
- For UI work, spot-check desktop and mobile widths.
