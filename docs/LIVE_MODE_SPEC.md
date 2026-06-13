# WC26 Live Mode Upgrade Spec

## User request

Jacob wants the dashboard to feel alive during matches:

1. Homepage switches into **Live Mode** during games, above the hero, with a big above-the-fold scoreboard. One game spans full width; two games render side by side on desktop and stack on mobile.
2. Live Mode updates every minute, starts/stops cleanly, and shows final score plus a deterministic game synthesis after full time.
3. Today tab upcoming matches show where to stream/watch, optimized for a no-cable viewer.
4. Storyline cards include companion visuals for energy.
5. Mobile layout must be first-class.

## Architecture decision

This remains a static GitHub Pages app with no external JavaScript dependencies. The app may fetch public JSON endpoints directly from the browser:

- Primary live data: FIFA public API (`api.fifa.com`) for schedule, scores, match status, clock, and timelines.
- Fallback/enrichment: ESPN public site API (`site.api.espn.com`) for score/status/broadcasts/summary.

No paid feeds, accounts, API keys, betting data, or hidden client secrets.

## Data model additions

`MATCHES` entries may include:

```js
api:{fifa:"400021449",stage:"289273",espn:"760416"},
watch:[
  {k:"fox",label:"FOX",detail:"English TV · OTA where local"},
  {k:"peacock",label:"Peacock",detail:"Spanish stream"}
],
live:{
  status:"live"|"ht"|"ft",
  score:[homeGoals,awayGoals],
  minute:"38′",
  headline:"Canada pushing for a winner",
  events:["21′ Bosnia goal — Jovo Lukić", "78′ Canada goal — Cyle Larin"],
  recap:"Canada and Bosnia split the points in Toronto...",
  source:"FIFA"
}
```

Rules:

- Never put in-progress scores in `s`; standings only consume `s` after final verification.
- `live` may be fetched at runtime or embedded by the maintainer.
- `watch` is display-only and can be shown on Today/live cards.

## Live Mode behavior

- Hidden when there are no active/recently-final matches.
- Appears before `.hero` and physically pushes the hero down.
- Starts a 60-second polling loop only when live/pre-match API-enabled matches exist.
- Stops polling when no live/pre-match matches remain.
- Supports one-card and two-card layouts.
- Uses `aria-live="polite"` for score/status updates.
- Fallback: if APIs fail, embedded schedule still renders and live UI stays hidden rather than showing stale/invented scores.

## Live Mode visual layer

The live card should feel like a broadcast command center for casual fans:

- **Logo-style team crests** are generated in CSS from the local flag emoji plus a 3-letter country code. These are not official federation logos, and that is intentional: no hotlinked marks/assets.
- **Pitch graphic** renders with CSS only: field stripes, halfway line, center circle, boxes, pressure ball marker, and recent key event pins.
- **Stats panel** uses the FIFA timeline event feed when available. Current rows are Goals, Shots, Fouls, and Cards. Label the note clearly so casual viewers understand these are event-feed stats, not a betting/pro analytics feed.
- **Fan note** explains what the visual means in plain English; avoid unexplained xG/PPDA/stathead jargon.
- If timeline stats are unavailable, show the visual shell and a note that stats will populate from the public feed. Do not invent possession/shots.

## Streaming/no-cable display

Use text/logo-style badges, not hotlinked official logos:

- `FOX`: English TV, free OTA where local.
- `FS1` / `FOX One`: paid/cable or paid streaming.
- `Tubi`: free only for confirmed simulcasts.
- `Telemundo`: Spanish TV, free OTA where local.
- `Universo`: paid/cable Spanish.
- `Peacock`: paid Spanish stream.

If availability is uncertain, omit the badge or use broad verified broadcast data from ESPN/FIFA/NBC/Fox sources.

## Storyline imagery

Use local, optimized WebP companion visuals under `public/img/storylines/`. Avoid external image URLs so the app stays portable and smoke-safe. Current assets are generated photo-style editorial images with no official logos or real-person likeness dependency.

## Mobile acceptance criteria

- Under `640px`: live cards, match cards, story cards, groups, teams, format, venues, and timeline stack to one column.
- Tabs scroll horizontally instead of wrapping into a huge topbar.
- Badges wrap cleanly and remain tappable/readable.
- Hero stats become a 2-column grid.
- Tables/modal/schedule rows avoid horizontal overflow except standings table inside its card when necessary.
- `prefers-reduced-motion`, `:focus-visible`, modal close/Esc behavior, and tab ARIA stay intact.

## Verification

- `npm run smoke`
- Node syntax check of inline script via smoke
- Desktop screenshot/HTTP verification after deploy
- Mobile-width screenshot or browser render around 390px
- Spot-check: Today cards show watch badges; Live Mode root is present; story cards show local images; no external JS; no unexpected external URLs except allowed fonts/FIFA/ESPN data endpoints.
