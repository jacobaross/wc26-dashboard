# Field of 48 — World Cup 2026 Dashboard

Single-file, zero-dependency HTML dashboard for the 2026 FIFA World Cup (USA / Canada / Mexico, Jun 11 – Jul 19, 2026). Built by Claude for Jacob on **Jun 12, 2026**; data is accurate through the morning of that date.

## Package contents

| File | Purpose |
|---|---|
| `public/index.html` | The entire app. No build step, no external JS. Open in any browser. |
| `INSTRUCTIONS.md` | Operating manual: how to update results, odds, standings, and extend features. The primary doc for the maintaining agent. |
| `DATA_MODEL.md` | Schema reference for the embedded JS data (TEAMS, MATCHES, ODDS, etc.) plus a state snapshot as of Jun 12. |
| `DESIGN.md` | Design system: tokens, typography, signature elements, and rules so future edits stay on-brand. |
| `AGENT_BRIEF.md` | Suggested standing task definition for Hermes (update cadence, sources, approval boundaries, done-criteria). |
| `HOSTING.md` | Live URL, hosting decisions, and Cloudflare/custom-domain migration notes. |

## Quick start

```bash
open public/index.html     # macOS — that's it
# or serve it:
python3 -m http.server 8080
```

External dependencies: only Google Fonts (Anton + Archivo) via CDN. The page degrades gracefully to system fonts offline.

## Maintenance model in one sentence

All tournament state lives in plain JS objects near the top of the `<script>` block in `index.html`; standings, fixtures, and team profiles re-render automatically from that data — so "updating the dashboard" means editing a few array entries, never touching markup or CSS.

## Known gaps as of handoff

- Match results entered only through Jun 11 (Mexico 2–0 RSA, KOR 2–1 CZE). Jun 12 games (CAN–BIH, USA–PAR) were unplayed at handoff time.
- Venues marked `TBC` for Jun 21–27 fixtures: dates and pairings are confirmed, host cities were not embedded. Low priority; cosmetic.
- Odds board is a static snapshot (BetMGM/FanDuel/DraftKings, Jun 11–12). See INSTRUCTIONS.md §3 for the update routine.
- No knockout bracket view yet — flagged as the top candidate feature once the Round of 32 is set (Jun 28). See INSTRUCTIONS.md §5.
