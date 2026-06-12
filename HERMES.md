# WC26 dashboard project context

This repo hosts Jacob's "Field of 48" World Cup 2026 dashboard.

## App constraints
- The hosted artifact is `public/index.html`: a single-file static dashboard.
- No external JavaScript dependencies in the app. Google Fonts is allowed.
- Tournament state lives in JS data objects near the top of `public/index.html`.
- Update scores by editing `MATCHES` entries, then run `npm run smoke`.
- Never invent scores. Confirm final results from reliable public sources before editing.

## Hosting
- Current production: GitHub Pages at `https://jacobaross.github.io/wc26-dashboard/`.
- Cloudflare Pages config is staged (`wrangler.toml`, deploy scripts), but Cloudflare auth is not available locally yet.
- Preferred long-term domain: `wc26.jacobross.com`; see `docs/HOSTING.md`.

## Docs
- Maintenance docs live under `docs/`.
- `docs/INSTRUCTIONS.md` is the operating manual.
- `docs/DESIGN.md` is the design system; preserve the stadium-at-night visual language.
