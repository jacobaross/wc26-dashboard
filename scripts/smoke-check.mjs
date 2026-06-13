import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const htmlPath = path.join(root, 'public', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const errors = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}
function warn(condition, message) {
  if (!condition) warnings.push(message);
}

assert(!/<script\b[^>]*\bsrc\s*=/.test(html), 'No external JavaScript is allowed.');
assert(!/localStorage|sessionStorage/.test(html), 'Storage APIs are forbidden for this stateless artifact.');
assert(/:focus-visible/.test(html), 'Missing :focus-visible accessibility styles.');
assert(/prefers-reduced-motion/.test(html), 'Missing prefers-reduced-motion accessibility block.');

const urls = [...html.matchAll(/https?:\/\/[^"')\s<>]+/g)].map(m => m[0]);
const allowedUrl = url =>
  url.startsWith('https://fonts.googleapis.com') ||
  url.startsWith('https://fonts.gstatic.com') ||
  url.startsWith('https://api.fifa.com/api/v3/') ||
  url.startsWith('https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/');
assert(urls.every(allowedUrl), `Unexpected external URL(s): ${urls.filter(u => !allowedUrl(u)).join(', ')}`);

assert(/id="live-mode-root"/.test(html), 'Missing Live Mode root above the hero.');
assert(/class="stream-badge/.test(html), 'Missing watch/stream badge markup or renderer.');
assert(/setInterval\(refreshLiveMode,\s*60000\)/.test(html), 'Live Mode should poll every 60 seconds.');
assert(/function shouldKeepPolling/.test(html), 'Missing explicit Live Mode polling stop guard.');
assert(/m\.live\s*=\s*null/.test(html) && /m\.liveError/.test(html), 'Live feed failures should clear stale live state.');
const storylineRefs = [...html.matchAll(/img\/storylines\/[^"']+\.webp/g)].map(m => m[0]);
assert(storylineRefs.length >= 6, `Expected at least 6 local storyline image references, found ${storylineRefs.length}.`);
for (const ref of storylineRefs) {
  assert(fs.existsSync(path.join(root, 'public', ref)), `Missing local storyline image asset: ${ref}`);
}

const scriptMatches = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)];
assert(scriptMatches.length === 1, `Expected exactly one inline script block, found ${scriptMatches.length}.`);
const script = scriptMatches[0]?.[1] ?? '';
const todayPinnedFromScript = (script.match(/const\s+TODAY_DATE\s*=\s*"([^"]+)"/) || script.match(/MATCHES\.filter\(m=>m\.d==="([^"]+)"\)/) || [])[1] || null;
try {
  new vm.Script(script, { filename: 'public/index.html<script>' });
} catch (err) {
  errors.push(`JavaScript syntax error: ${err.message}`);
}

const dataMarker = '/* ================= HELPERS ================= */';
const markerIdx = script.indexOf(dataMarker);
assert(markerIdx > -1, 'Could not find helpers marker after data block.');
let snapshot = null;
if (markerIdx > -1) {
  const dataPart = script.slice(0, markerIdx);
  const checker = `\n(function(){\n  function standings(group){\n    const table = {};\n    GROUP_TEAMS[group].forEach(t => table[t] = {team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});\n    MATCHES.filter(m => m.g===group && m.s).forEach(m=>{\n      const H=table[m.h], A=table[m.a];\n      H.p++;A.p++;H.gf+=m.s[0];H.ga+=m.s[1];A.gf+=m.s[1];A.ga+=m.s[0];\n      if(m.s[0]>m.s[1]){H.w++;A.l++;H.pts+=3}\n      else if(m.s[0]<m.s[1]){A.w++;H.l++;A.pts+=3}\n      else{H.d++;A.d++;H.pts++;A.pts++}\n    });\n    return Object.values(table).sort((a,b)=>\n      b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf || a.team.localeCompare(b.team));\n  }\n  globalThis.__snapshot = {\n    teams: TEAMS, groups: GROUPS, groupTeams: GROUP_TEAMS, matches: MATCHES, odds: ODDS,\n    groupA: standings('A'),\n    todayPinned: todayPinnedFromScript,\n    chip: (htmlText.match(/Matchday [^<]+/)||[])[0] || null\n  };\n})();`;
  try {
    const context = { globalThis: {}, scriptText: script, htmlText: html, todayPinnedFromScript };
    context.globalThis = context;
    vm.runInNewContext(dataPart + checker, context, { filename: 'dashboard-data-check.vm' });
    snapshot = context.__snapshot;
  } catch (err) {
    errors.push(`Data block evaluation failed: ${err.message}`);
  }
}

if (snapshot) {
  const { teams, groups, groupTeams, matches, odds, groupA } = snapshot;
  const teamNames = Object.keys(teams);
  assert(teamNames.length === 48, `Expected 48 teams, found ${teamNames.length}.`);
  assert(Array.isArray(groups) && groups.length === 12, `Expected 12 groups, found ${groups?.length}.`);
  for (const g of groups) {
    const names = groupTeams[g] || [];
    assert(names.length === 4, `Group ${g} should have 4 teams, found ${names.length}.`);
    for (const name of names) {
      assert(Boolean(teams[name]), `Group ${g} references unknown team ${name}.`);
      assert(teams[name]?.g === g, `${name} is listed in Group ${g} but team.g=${teams[name]?.g}.`);
    }
  }
  assert(matches.length === 72, `Expected 72 group-stage fixtures, found ${matches.length}.`);
  for (const [idx, m] of matches.entries()) {
    assert(groups.includes(m.g), `Match ${idx + 1} has unknown group ${m.g}.`);
    assert(Boolean(teams[m.h]), `Match ${idx + 1} unknown home team ${m.h}.`);
    assert(Boolean(teams[m.a]), `Match ${idx + 1} unknown away team ${m.a}.`);
    assert(groupTeams[m.g]?.includes(m.h), `Match ${idx + 1} home team ${m.h} is not in Group ${m.g}.`);
    assert(groupTeams[m.g]?.includes(m.a), `Match ${idx + 1} away team ${m.a} is not in Group ${m.g}.`);
    if (m.s) {
      assert(Array.isArray(m.s) && m.s.length === 2, `Match ${idx + 1} score must be [homeGoals, awayGoals].`);
      assert(m.s.every(n => Number.isInteger(n) && n >= 0), `Match ${idx + 1} score values must be non-negative integers.`);
      warn(!m.t, `Match ${idx + 1} is played but still has kickoff time t=${m.t}.`);
    }
  }
  assert(odds.length === 12, `Expected top-12 odds board, found ${odds.length}.`);
  for (const [idx, o] of odds.entries()) {
    assert(Boolean(teams[o.t]), `Odds row ${idx + 1} references unknown team ${o.t}.`);
    if (idx > 0) assert(o.ip <= odds[idx - 1].ip, `Odds row ${idx + 1} is out of descending probability order.`);
  }
  const expectedA = [
    ['Mexico', 3, 2],
    ['South Korea', 3, 1],
    ['Czechia', 0, -1],
    ['South Africa', 0, -2]
  ];
  for (let i = 0; i < expectedA.length; i++) {
    const [team, pts, gd] = expectedA[i];
    const row = groupA[i];
    assert(row?.team === team && row?.pts === pts && (row.gf - row.ga) === gd,
      `Group A row ${i + 1} expected ${team} ${pts}pts GD ${gd}, got ${row?.team} ${row?.pts}pts GD ${row ? row.gf - row.ga : 'n/a'}.`);
  }
}

if (warnings.length) {
  console.warn('Warnings:');
  for (const message of warnings) console.warn(`- ${message}`);
}
if (errors.length) {
  console.error('Smoke check failed:');
  for (const message of errors) console.error(`- ${message}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  html: path.relative(root, htmlPath),
  teams: snapshot ? Object.keys(snapshot.teams).length : null,
  matches: snapshot ? snapshot.matches.length : null,
  played: snapshot ? snapshot.matches.filter(m => m.s).length : null,
  oddsRows: snapshot ? snapshot.odds.length : null,
  todayPinned: snapshot?.todayPinned,
  chip: snapshot?.chip
}, null, 2));
