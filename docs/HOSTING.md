# Hosting

## Current production

- Repo: https://github.com/jacobaross/wc26-dashboard
- Live site: https://jacobaross.github.io/wc26-dashboard/
- Target custom domain: https://wc26.jacobross.com/
- Host: GitHub Pages via `.github/workflows/pages.yml`
- Source artifact: `public/index.html`
- Custom domain artifact: `public/CNAME`

GitHub Pages is the live fallback because Cloudflare auth was not available locally and `jacobross.com` DNS currently resolves to Bluehost nameservers (`ns1.bluehost.com`, `ns2.bluehost.com`), not Cloudflare.

## Preferred long-term setup

Use `wc26.jacobross.com` as the primary public URL.

Two clean paths:

1. **Keep GitHub Pages, add DNS CNAME**
   - Add `wc26.jacobross.com CNAME jacobaross.github.io` at the DNS host.
   - Configure GitHub Pages custom domain to `wc26.jacobross.com`.
   - Lowest moving parts.

2. **Move to Cloudflare Pages**
   - Authenticate Wrangler or provide a Cloudflare API token with Pages edit + relevant zone/DNS permissions.
   - Deploy with `npm run deploy:prod`.
   - Add `wc26.jacobross.com` as the Pages custom domain.
   - Best if the jacobross.com zone is moved to Cloudflare or DNS can delegate/CNAME the subdomain cleanly.

## Verification commands

```bash
npm run smoke
python3 - <<'PY'
import urllib.request
url='https://jacobaross.github.io/wc26-dashboard/'
body=urllib.request.urlopen(url, timeout=20).read().decode('utf-8','replace')
print('Field of 48' in body, 'Matchday 2' in body)
PY
```
