# AGENT_BRIEF — Standing Task for Hermes

Suggested task definition for whichever agent owns this (Gus/Ops is the natural fit; it's system/content ops, not family/health/gaming/Kirby territory — don't conflate domains).

## Mission

Keep `index.html` ("Field of 48") current through the World Cup final on **Jul 19, 2026**, per INSTRUCTIONS.md, without breaking the design system in DESIGN.md.

## Suggested cadence

- **Daily, after the last match of the day (or next morning):**
  1. Fetch final scores for the day's fixtures from a reliable source (FIFA.com, ESPN, BBC Sport — cross-check two if anything looks surprising, e.g. a giant losing to a debutant).
  2. Update `MATCHES` entries (INSTRUCTIONS §1). Verify standings math for one affected group by hand (§7).
  3. Bump the "today" date filter, matchday chip, and hero copy (§2).
- **Every 3–4 days:** refresh the ODDS array + as-of dates (§3); rotate stale storyline cards (§4).
- **Jun 27 (group stage ends):** propose the Bracket tab build (§5) — this is a feature change, not routine maintenance, so surface the plan before building.

## Boundaries (consistent with house rules)

- Editing the local `index.html` and committing to a repo Jacob designates: routine, no approval needed.
- **Deploying/publishing anywhere public, registering domains, or adding any external service/API: propose first, act on approval.** Same for anything destructive (e.g. rewriting the data layer, removing tabs).
- No betting accounts, no paid data feeds. Odds are scraped/read from public pages and labeled with source + date; the dashboard keeps its "context, not betting advice" disclaimer.
- If storing notes/learnings, do **not** use GBrain or `/Users/jro/brain` (retired). Keep operational notes inside this repo/docs or Hermes skills/memory as appropriate; do not write to Obsidian unless Jacob explicitly asks.
- Follow-ups for Jacob (e.g. "want the bracket tab?") → Apple Reminders, "Jacob's Todos 2026".

## Data integrity guardrails

- Never invent a score. If a result can't be confirmed from a primary source, leave the fixture unplayed and note it.
- Watch the home/away order in `MATCHES` when entering `s:[h,a]` — the #1 way to corrupt standings.
- The standings tiebreaker is simplified (pts → GD → GF). If a real qualification spot hinges on head-to-head or fair play, the table may mis-order — flag to Jacob instead of hand-hacking row order.
- After every edit: open the file, confirm zero console errors, spot-check one group, one modal, one mobile-width render (§7 checklist).

## Definition of done (daily run)

All of yesterday's results entered and verified · today's fixtures show on the Today tab with correct ET times · matchday chip and hero read current · console clean · change committed with a message like `wc26: results Jun 13 (BRA 2-0 MAR, ...)`.

## Escalate to Jacob when

- A structural change is tempting (new tab, new data field, styling overhaul).
- Sources conflict on a result or a match is abandoned/replayed.
- Anything involving publishing, money, or accounts.
