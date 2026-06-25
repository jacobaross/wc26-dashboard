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
assert(/team-crest/.test(html), 'Live Mode should render logo-style team crests.');
assert(/live-pitch/.test(html), 'Live Mode should include a pitch graphic.');
assert(/pitch-marker/.test(html), 'Live Mode should render field event/pressure markers.');
assert(/live-stat-grid/.test(html), 'Live Mode should include a stat panel.');
assert(/function buildLiveStats/.test(html), 'Live Mode should derive event-feed stats.');
assert(/function pitchViz/.test(html), 'Live Mode should render field/event visualization.');
assert(/data-tab="players"/.test(html), 'Missing Players tab button.');
assert(/id="panel-players"/.test(html), 'Missing Players tab panel.');
assert(/id="player-search"/.test(html), 'Missing player search control.');
assert(/id="players-container"/.test(html), 'Missing players render container.');
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
  const checker = `\n(function(){\n  function standings(group){\n    const table = {};\n    GROUP_TEAMS[group].forEach(t => table[t] = {team:t,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0});\n    MATCHES.filter(m => m.g===group && m.s).forEach(m=>{\n      const H=table[m.h], A=table[m.a];\n      H.p++;A.p++;H.gf+=m.s[0];H.ga+=m.s[1];A.gf+=m.s[1];A.ga+=m.s[0];\n      if(m.s[0]>m.s[1]){H.w++;A.l++;H.pts+=3}\n      else if(m.s[0]<m.s[1]){A.w++;H.l++;A.pts+=3}\n      else{H.d++;A.d++;H.pts++;A.pts++}\n    });\n    return Object.values(table).sort((a,b)=>\n      b.pts-a.pts || (b.gf-b.ga)-(a.gf-a.ga) || b.gf-a.gf || a.team.localeCompare(b.team));\n  }\n  globalThis.__snapshot = {\n    teams: TEAMS, groups: GROUPS, groupTeams: GROUP_TEAMS, matches: MATCHES, odds: ODDS,\n    players: typeof PLAYERS !== 'undefined' ? PLAYERS : null,\n    playerStats: typeof PLAYER_STATS !== 'undefined' ? PLAYER_STATS : null,\n    playerSpotlights: typeof PLAYER_SPOTLIGHTS !== 'undefined' ? PLAYER_SPOTLIGHTS : null,\n    groupA: standings('A'),\n    todayPinned: todayPinnedFromScript,\n    chip: (htmlText.match(/Matchday [^<]+/)||[])[0] || null\n  };\n})();`;
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
  const { teams, groups, groupTeams, matches, odds, players, playerStats, playerSpotlights, groupA } = snapshot;
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
  // Group A final standings after Matchday 3 (Jun 24): Mexico 9, South Africa 4, South Korea 3, Czechia 1.
  const expectedA = [
    ['Mexico', 9, 6],
    ['South Africa', 4, -1],
    ['South Korea', 3, -1],
    ['Czechia', 1, -4]
  ];
  for (let i = 0; i < expectedA.length; i++) {
    const [team, pts, gd] = expectedA[i];
    const row = groupA[i];
    assert(row?.team === team && row?.pts === pts && (row.gf - row.ga) === gd,
      `Group A row ${i + 1} expected ${team} ${pts}pts GD ${gd}, got ${row?.team} ${row?.pts}pts GD ${row ? row.gf - row.ga : 'n/a'}.`);
  }
  assert(Array.isArray(players), 'PLAYERS should be a normalized array.');
  if (Array.isArray(players)) {
    assert(players.length === 1248, `Expected 1,248 rostered players, found ${players.length}.`);
    const ids = new Set();
    const countsByTeam = Object.fromEntries(teamNames.map(name => [name, 0]));
    for (const [idx, p] of players.entries()) {
      assert(p.id, `Player ${idx + 1} is missing id.`);
      if (p.id) {
        assert(!ids.has(p.id), `Duplicate player id ${p.id}.`);
        ids.add(p.id);
      }
      assert(Boolean(teams[p.team]), `Player ${idx + 1} references unknown team ${p.team}.`);
      if (teams[p.team]) countsByTeam[p.team]++;
      assert(groups.includes(p.group), `Player ${idx + 1} has unknown group ${p.group}.`);
      assert(groupTeams[p.group]?.includes(p.team), `Player ${idx + 1} team ${p.team} is not in Group ${p.group}.`);
      assert(p.name && p.pos && Number.isInteger(p.num), `Player ${idx + 1} needs name, pos, and jersey num.`);
    }
    for (const [team, count] of Object.entries(countsByTeam)) {
      assert(count === 26, `${team} should have 26 rostered players, found ${count}.`);
    }
  }
  assert(playerStats && typeof playerStats === 'object', 'PLAYER_STATS should be an object keyed by player id.');
  if (playerStats && Array.isArray(players)) {
    const playerIds = new Set(players.map(p => p.id));
    for (const [id, st] of Object.entries(playerStats)) {
      assert(playerIds.has(id), `PLAYER_STATS references unknown player id ${id}.`);
      for (const key of ['min','g','a','shots','onTarget']) {
        assert(Number.isFinite(st[key]), `PLAYER_STATS ${id}.${key} should be numeric.`);
      }
    }
  }
  assert(playerSpotlights && Object.keys(playerSpotlights).length >= 30, `Expected at least 30 player spotlights, found ${playerSpotlights ? Object.keys(playerSpotlights).length : 0}.`);
  if (playerSpotlights) {
    for (const [id, s] of Object.entries(playerSpotlights)) {
      assert(Array.isArray(players) && players.some(p => p.id === id), `Spotlight references unknown player id ${id}.`);
      assert(s.hook && s.role && s.watch, `Spotlight ${id} needs hook, role, and watch copy.`);
    }
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
  players: snapshot?.players ? snapshot.players.length : null,
  playerStats: snapshot?.playerStats ? Object.keys(snapshot.playerStats).length : null,
  spotlights: snapshot?.playerSpotlights ? Object.keys(snapshot.playerSpotlights).length : null,
  matches: snapshot ? snapshot.matches.length : null,
  played: snapshot ? snapshot.matches.filter(m => m.s).length : null,
  oddsRows: snapshot ? snapshot.odds.length : null,
  todayPinned: snapshot?.todayPinned,
  chip: snapshot?.chip
}, null, 2));
