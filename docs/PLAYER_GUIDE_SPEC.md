# WC26 Player Guide Spec

## User request

Jacob wanted a new player tab for all players, their tournament stats, and background — but explicitly for casual World Cup viewers, not football pros.

The product job is:

> “Who should I care about, why, and what am I watching for?”

## Architecture

The public app remains a static, dependency-light single-file dashboard at `public/index.html`.

Player data is embedded as normalized JS objects generated from FIFA public endpoints by:

```bash
npm run sync:players
npm run smoke
```

Runtime does **not** require a player API call for the Players tab. That keeps the directory fast and available even if FIFA’s public API has a bad moment.

## Data sources

- Roster source: `https://api.fifa.com/api/v3/teams/squads/all/17/285023?language=en`
- Tournament stat source: `https://api.fifa.com/api/v3/topseasonplayerstatistics/season/285023/topscorers?language=en&idCompetition=17&count=1000`

The sync script normalizes FIFA display names into the dashboard’s canonical team names:

- `USA` → `United States`
- `Korea Republic` → `South Korea`
- `IR Iran` → `Iran`
- `Congo DR` → `DR Congo`
- `Côte d'Ivoire` → `Ivory Coast`
- `Cabo Verde` → `Cape Verde`

## Embedded data model

### `PLAYERS`

Array of 1,248 rostered players, 26 per team.

```js
{
  id: "390267",              // FIFA IdPlayer, string
  name: "Christian Pulisic", // normalized display name
  short: "Christian Pulisic",
  team: "United States",     // canonical dashboard team key
  group: "D",
  num: 10,
  pos: "Forward",
  age: 27,                    // age on tournament kickoff date
  birth: "1998-09-18",
  h: 177,                     // cm, nullable
  w: 69                       // kg, nullable
}
```

### `PLAYER_STATS`

Object keyed by player id. Sparse: players with no tournament stat row default to zero / “Yet to appear.”

```js
"390267": {
  m: null,
  min: 90,
  starts: null,
  g: 1,
  a: 0,
  shots: 3,
  onTarget: 1
}
```

### `PLAYER_SPOTLIGHTS`

Object keyed by player id. This is the casual-fan layer: editorial context for players who matter beyond raw roster membership.

```js
"390267": {
  bucket: "Hosts to know",
  tag: "🇺🇸 Host star",
  hook: "Captain America, but with actual pressure this time: home World Cup, prime years.",
  role: "Direct winger/attacker who carries the US from cautious to dangerous.",
  watch: "The US attack usually becomes real when Pulisic gets turned toward goal."
}
```

Current buckets:

- Everyone will mention
- Hosts to know
- Last dances
- Young chaos merchants
- Dark horse weapons

## UI behavior

The Players tab has two layers:

1. **Player Guide** — bucketed spotlight cards for casual fans.
2. **Full Roster Directory** — all 1,248 players with search/filter.

Filters:

- Search
- Group
- Team
- Position
- Featured only
- Has scored
- Host nations
- Age 21 or under
- Age 35+

Cards show:

- Team flag/name
- Shirt number
- Player name
- Position + age
- Spotlight tag when available
- Tournament stat chips or “Yet to appear”

Player modal shows:

- Position
- Age
- Tournament stats
- Build when available
- Spotlight hook / role / watch cue if curated
- Team fixtures

## Copy rules

Keep it casual-viewer-first:

- Explain *why the player matters*, not just who they play for.
- Use plain English for tactical ideas.
- Give concrete viewing cues: “watch the next pass,” “watch the run behind,” “watch the back-post cross.”
- Do not invent transfer rumors, injuries, private background, or unverified anecdotes.
- Non-spotlight players should stay factual and quiet.

## Verification

After player data or UI changes:

```bash
node scripts/sync-players.mjs   # only when refreshing roster/stat snapshot
npm run smoke
```

Smoke asserts:

- Players tab and controls exist.
- `PLAYERS` has exactly 1,248 rows.
- Every player references a known dashboard team/group.
- Every player has id, name, position, and shirt number.
- At least 30 spotlight profiles exist and point to valid player ids.
- Existing dashboard invariants still hold.

For UI work, also browser-check:

- Players tab renders spotlight cards.
- Search/filter updates the count and directory.
- A spotlight modal opens and closes with Esc.
- Mobile width around 390px has no body overflow except intentional horizontal tab/bucket rails.
