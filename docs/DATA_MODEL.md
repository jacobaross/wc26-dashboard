# DATA_MODEL — Schema Reference & State Snapshot

All state lives in five structures at the top of the `<script>` block in `index.html`.

---

## TEAMS (object, 48 entries)

Keyed by display name (the canonical team id used everywhere — `MATCHES`, `GROUP_TEAMS`, `ODDS` all reference these exact strings).

```js
"Spain": {
  fl: "🇪🇸",                          // flag emoji
  g: "H",                             // group letter
  star: "Lamine Yamal · the phenomenon",  // one star player + epithet
  hist: "17th appearance · champions 2010", // WC pedigree, one line
  odds: "+450 · FAVORITES",           // free-text odds chip, or null
  blurb: "…"                          // 2–4 sentence profile, shown in modal
}
```

Canonical name gotchas: `"United States"` (not USA), `"Bosnia and Herzegovina"` (full), `"Türkiye"` (with diaeresis), `"DR Congo"`, `"Ivory Coast"`, `"Czechia"`, `"South Korea"`. England and Scotland use the subdivision flag emoji sequences — copy them, don't retype.

## PLAYERS / PLAYER_STATS / PLAYER_SPOTLIGHTS

`PLAYERS` is a normalized roster snapshot generated from FIFA's public squads endpoint by `scripts/sync-players.mjs`. It currently contains 1,248 players: 48 teams × 26 players.

```js
{
  id: "390267",        // FIFA IdPlayer string
  name: "Christian Pulisic",
  short: "Christian Pulisic",
  team: "United States", // canonical TEAMS key
  group: "D",
  num: 10,
  pos: "Forward",
  age: 27,             // age on tournament kickoff date
  birth: "1998-09-18",
  h: 177,              // cm, nullable
  w: 69                // kg, nullable
}
```

`PLAYER_STATS` is sparse and keyed by `id`; missing rows render as “Yet to appear.” `PLAYER_SPOTLIGHTS` is the editorial casual-fan layer keyed by `id` with `bucket`, `tag`, `hook`, `role`, and `watch`. See `PLAYER_GUIDE_SPEC.md` for source URLs and refresh rules.

## GROUPS / GROUP_TEAMS

`GROUPS` is the array `["A"…"L"]`. `GROUP_TEAMS` maps each letter to its four team names. Final — these never change.

## MATCHES (array, 72 group-stage fixtures)

```js
{
  d: "Jun 12",            // date string, also used for schedule grouping & "today" filter
  g: "D",                 // group letter
  h: "United States",     // home-listed team
  a: "Paraguay",          // away-listed team
  s: [2,1],               // OPTIONAL — score [h,a]; presence of s == match played
  t: "9:00 PM ET",        // OPTIONAL — kickoff time, only for unplayed matches
  v: "SoFi Stadium, Inglewood",  // venue ("TBC" for some Jun 21–27 games)
  note: "…",              // OPTIONAL — one-line flavor, shown on cards
  api: {fifa:"400021458", stage:"289273", espn:"760417"}, // OPTIONAL public live-data ids
  watch: [{k:"fox", label:"FOX", detail:"English TV · OTA where local"}], // OPTIONAL watch badges
  live: {status:"live", score:[1,0], minute:"38′", headline:"Live now"} // OPTIONAL runtime/embedded live state
}
```

`computeStandings(group)` derives tables from this array: 3/1/0 points, tiebreaks pts → GD → GF → alphabetical. (FIFA's real tiebreak chain continues head-to-head → fair play → lots; not implemented. If two teams ever tie on pts/GD/GF for a qualification-relevant position, the rendered order may be wrong — flag it rather than silently trusting it.)

## ODDS (array, 12 entries, ranked)

```js
{t:"Spain", ml:"+450", ip:18.2, dark:false}
```
Render order = array order. `dark:true` → red dark-horse styling.

## State snapshot at handoff (morning of Fri Jun 12, 2026)

**Played:**
| Date | Match | Score | Notes |
|---|---|---|---|
| Jun 11 | Mexico – South Africa (A) | 2–0 | Estadio Azteca; 3 red cards, a WC single-match record |
| Jun 11 | South Korea – Czechia (A) | 2–1 | Korea came from behind, Guadalajara |

**Group A table:** MEX 3pts (+2), KOR 3pts (+1), CZE 0 (−1), RSA 0 (−2). All other groups 0-0-0-0.

**Today (Jun 12):** Canada–Bosnia 3:00 PM ET (BMO Field), USA–Paraguay 9:00 PM ET (SoFi).

**Odds snapshot (BetMGM/FanDuel/DraftKings consensus, Jun 11–12):**
Spain +450 · France +475 · England +700 · Portugal +800 · Brazil +950 · Argentina +950 · Germany +1400 · Netherlands +2000 · Norway +3000 · Belgium +4000 · Colombia +4000 · Uruguay +6500. USA ~25–1 region and +138 to win Group D.

**Format facts encoded in copy:** 48 teams, 12 groups of 4, top 2 + 8 best third-place to a new Round of 32 (Jun 28 – Jul 3), R16 Jul 4–7, QF Jul 9–11 (Boston/LA/Miami/KC), SF Jul 14–15 (Dallas/Atlanta), 3rd place Jul 18 (Miami), Final Jul 19 (MetLife). Bracket separates Spain and Argentina until the final if both win their groups.
