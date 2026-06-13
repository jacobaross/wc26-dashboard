# WC26 dashboard project context

This repo hosts Jacob's "Field of 48" World Cup 2026 dashboard.

## App constraints
- The hosted artifact is `public/index.html`: a single-file static dashboard.
- No external JavaScript dependencies in the app. Google Fonts is allowed.
- Tournament state lives in JS data objects near the top of `public/index.html`.
- Update scores by editing `MATCHES` entries, then run `npm run smoke`.
- Never invent scores. Confirm final results from reliable public sources before editing.

## Hosting
- Production URL: `https://wc26.jacobross.com/`.
- GitHub Pages repo URL: `https://jacobaross.github.io/wc26-dashboard/` redirects to the custom domain.
- Custom-domain artifact: `public/CNAME` contains `wc26.jacobross.com`.
- DNS: `wc26.jacobross.com CNAME jacobaross.github.io` at Bluehost (`jacobross.com` nameservers: `ns1.bluehost.com`, `ns2.bluehost.com`).
- Cloudflare Pages config is staged (`wrangler.toml`, deploy scripts), but Cloudflare auth is not available locally yet.

## Docs
- Maintenance docs live under `docs/`.
- `docs/INSTRUCTIONS.md` is the operating manual.
- `docs/DESIGN.md` is the design system; preserve the stadium-at-night visual language.
- `docs/AGENT_BRIEF.md` is the standing context for future Gus/agent work.
- `docs/LIVE_MODE_SPEC.md` captures the current live-mode/mobile/storyline improvement direction.
- `docs/PLAYER_GUIDE_SPEC.md` captures the Players tab data model, sync script, and casual-fan copy rules.

## Future improvement workflow
- Start by checking `git status --short --branch`; do not trample existing uncommitted work.
- For requested improvements, edit locally, run `npm run smoke`, then commit only the intended files.
- If pushing to `main`, remember it publishes publicly through GitHub Pages.
- After deploy, verify `https://wc26.jacobross.com/` over HTTP and check expected content markers.
