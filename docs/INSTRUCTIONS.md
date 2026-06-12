# INSTRUCTIONS — Operating the Dashboard

Everything below refers to `index.html`. All edits happen inside the single `<script>` block; the data objects are at the top, clearly labeled with `/* ===== DATA ===== */`.

---

## 1. Recording a match result (the most common task)

Find the fixture in the `MATCHES` array and add an `s` (score) field. Optionally update/remove the kickoff time `t` and add a `note`.

Before (scheduled):
```js
{d:"Jun 12",g:"D",h:"United States",a:"Paraguay",t:"9:00 PM ET",v:"SoFi Stadium, Inglewood",note:"USMNT opener · free on Fox & Tubi"},
```

After (played, e.g. a 2–1 USA win):
```js
{d:"Jun 12",g:"D",h:"United States",a:"Paraguay",s:[2,1],v:"SoFi Stadium, Inglewood",note:"Pulisic opens the home World Cup with a brace"},
```

Rules:
- `s` is always `[homeGoals, awayGoals]` matching `h` and `a` order. Double-check which team is listed as `h` — getting this backwards corrupts the standings.
- Remove `t` once played (it renders as the "upcoming" label).
- `note` is optional flavor; keep it under ~70 chars, factual, one clause.

That's the entire job. Standings (Groups tab), result cards (Today tab), schedule rows, and every team's fixture list in the modal all recompute from `MATCHES` on page load. Never edit the standings tables directly — they don't exist in markup.

## 2. Keeping the "Today" tab current

Three things are date-pinned and need a touch each day:

1. **Today's matches filter** — in the render section, find:
   ```js
   MATCHES.filter(m=>m.d==="Jun 12")
   ```
   Bump the date string daily (format: `"Jun 13"`, matching the `d` values in MATCHES).
2. **Matchday chip** in the header: `Matchday 2 · Fri, June 12, 2026` — bump both.
3. **Hero copy** — the `kicker` ("Day 2 of 39") and the lede paragraph reference recent results. Refresh every few days so it never reads stale. Keep the lede ≤ 2 sentences, present tense, concrete (name actual results, not vibes).

Also date-pinned, lower cadence: the Groups tab tag ("Live · Jun 12"), the Odds tab tag and footer line.

## 3. Updating odds

`ODDS` array, top 12 only by design (board gets noisy beyond that):
```js
{t:"Spain",ml:"+450",ip:18.2},
```
- `ml` = American moneyline string; `ip` = implied probability = `100/(odds+100)*100`, one decimal.
- `dark:true` flags the red "dark horse" styling (currently entries 9–12).
- Re-sort the array descending by `ip` after edits — rank numbers render from array order.
- Source preference: BetMGM or FanDuel consensus; note the as-of date in the Odds tab tag and the `.fine` disclaimer line.
- Team odds chips also live in `TEAMS[name].odds` (a free-text string). Keep the headline teams (Spain, France, England, Portugal, Brazil, Argentina, Germany, Netherlands, Norway, Belgium, Colombia, Uruguay, USA) in sync with the board.

## 4. Eliminations, qualifications, storylines

- When a team mathematically qualifies for / is eliminated from the Round of 32, append it to that team's `blurb` and consider a `note` on the deciding match. There is no dedicated "status" field yet — adding one (`status:"through"|"out"` with a small chip on team cards) is a clean, contained enhancement.
- Storyline cards (Today tab) and Dark Horse cards (Odds tab) are static HTML — six and four cards respectively. Rotate them as the tournament evolves. Keep the alternating `story` / `story alt` classes (gold/red top borders).

## 5. Planned feature: knockout bracket (post–Jun 27)

Once the group stage ends, add a **Bracket** tab:
- Follow the existing pattern: a `<button class="tab" data-tab="bracket">` in the nav + a `<section class="panel" id="panel-bracket">`. The `showTab()` function needs no changes — it's driven by `data-tab` / panel id naming.
- Render from a new `BRACKET` data structure rather than hardcoding; R32 pairings depend on which groups the eight third-place qualifiers come from, so don't pre-build pairings.
- Style guidance in DESIGN.md (use scoreboard tables / match-card components; don't invent new visual language).

## 6. Hard constraints — do not break these

- **Single file.** No build tooling, no frameworks, no extra files. The artifact's whole value is that it opens anywhere.
- **No external JS dependencies.** Google Fonts is the only allowed external resource.
- **Escape all data-driven strings.** Anything rendered from data goes through the `esc()` helper (already in place). Match notes and blurbs are injected HTML-adjacent — keep using it.
- **No localStorage / sessionStorage.** The page must stay stateless (it's also rendered in sandboxed previews where storage APIs fail).
- **Don't edit standings, fixture lists, or team cards in markup** — they are all generated. Markup edits are only for static copy (hero, storylines, format/venue cards).
- **Accessibility floor:** keep `:focus-visible` styles, modal Esc/overlay close, `aria-selected` on tabs, and the `prefers-reduced-motion` block intact.

## 7. Verification checklist after any edit

1. Open the file; check the browser console is clean (a malformed MATCHES entry, e.g. trailing comma inside an object or unescaped quote in a note, is the most likely breakage).
2. Groups tab: spot-check one updated group's points and goal difference by hand.
3. Click a team involved in the updated match → modal fixture list shows the score with the right W/L/D tag.
4. Tab through the nav with keyboard; open and Esc-close a modal.
5. Resize to ~380px width — nothing overflows.
