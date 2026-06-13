import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const htmlPath = path.join(root, 'public', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const script = (html.match(/<script[^>]*>([\s\S]*?)<\/script>/i) || [])[1];
if (!script) throw new Error('Could not find inline script in public/index.html');
const dataMarker = '/* ================= HELPERS ================= */';
const markerIdx = script.indexOf(dataMarker);
if (markerIdx < 0) throw new Error('Could not find data/helpers marker');
const dataPart = script.slice(0, markerIdx);
const context = { globalThis: {} };
context.globalThis = context;
vm.runInNewContext(dataPart + `\n(function(){globalThis.__data={TEAMS,GROUP_TEAMS};})();`, context, { filename: 'index-data.vm' });
const { TEAMS, GROUP_TEAMS } = context.__data;

const SQUADS_URL = 'https://api.fifa.com/api/v3/teams/squads/all/17/285023?language=en';
const STATS_URL = 'https://api.fifa.com/api/v3/topseasonplayerstatistics/season/285023/topscorers?language=en&idCompetition=17&count=1000';
const SNAPSHOT_AS_OF = '2026-06-12';
const AGE_ON = new Date('2026-06-11T12:00:00Z');

const TEAM_NAME_MAP = {
  USA: 'United States',
  'Korea Republic': 'South Korea',
  'IR Iran': 'Iran',
  'Congo DR': 'DR Congo',
  'Côte d\'Ivoire': 'Ivory Coast',
  'Cabo Verde': 'Cape Verde'
};

const POSITION_BY_CODE = {
  0: 'Goalkeeper',
  1: 'Defender',
  2: 'Midfielder',
  3: 'Forward'
};

const SPOTLIGHT_SEEDS = [
  {find:'Lionel MESSI', team:'Argentina', bucket:'Everyone will mention', hook:'The defending champion and the final boss of football nostalgia.', role:'A roaming creator now: less sprinting, more surgical passing and late runs into danger.', watch:'When Argentina slows the game down, look for the next pass after Messi receives it — that is usually where the trap is.', tag:'🐐 Last dance'},
  {find:'CRISTIANO RONALDO', team:'Portugal', bucket:'Everyone will mention', hook:'The record-setting farewell tour with a title-caliber Portugal around him.', role:'Box striker, gravity machine, penalty-area obsession.', watch:'Portugal will build moves to deliver one clean cross or cutback to him. Count how often defenders look over their shoulder.', tag:'🐐 Final chapter'},
  {find:'Kylian MBAPPE', team:'France', bucket:'Everyone will mention', hook:'The closest thing this tournament has to a cheat code.', role:'Left-side rocket who turns one bad defensive step into a goal.', watch:'If a fullback gives him open grass, the play is already in trouble.', tag:'⚡ Superstar'},
  {find:'Erling HAALAND', team:'Norway', bucket:'Everyone will mention', hook:'The purest goal machine in the field, finally on the World Cup stage.', role:'Penalty-box terminator: few touches, maximum damage.', watch:'He can look uninvolved for 20 minutes and still decide the match with one run.', tag:'🧨 Goal machine'},
  {find:'Lamine YAMAL', team:'Spain', bucket:'Everyone will mention', hook:'Teenage winger, grown-man composure, and Spain’s electric edge.', role:'Right-wing creator who dribbles inside and bends the game toward his left foot.', watch:'When Spain recycle possession to him, watch whether the defense doubles him — that opens the midfield.', tag:'⚡ Wonderkid'},
  {find:'Jude BELLINGHAM', team:'England', bucket:'Everyone will mention', hook:'England’s modern superstar: midfielder, scorer, emotional weather system.', role:'Arrives late in the box and turns midfield control into goals.', watch:'If England look flat, he is usually the one trying to tilt the field by force.', tag:'👑 Main character'},
  {find:'Harry KANE', team:'England', bucket:'Everyone will mention', hook:'England’s captain and one of the cleanest finishers alive.', role:'Striker who drops deep like a quarterback, then still arrives to score.', watch:'When Kane leaves the box, someone fast is probably running beyond him.', tag:'🎯 Finisher'},
  {find:'VINICIUS JUNIOR', team:'Brazil', bucket:'Everyone will mention', hook:'Brazil’s chaos button: speed, swagger, and instant panic for defenders.', role:'Left-wing attacker who wants isolation and open space.', watch:'If Brazil can get him one-on-one, the entire stadium will feel it.', tag:'🇧🇷 Chaos wing'},
  {find:'Christian PULISIC', team:'United States', bucket:'Hosts to know', hook:'Captain America, but with actual pressure this time: home World Cup, prime years.', role:'Direct winger/attacker who carries the US from cautious to dangerous.', watch:'The US attack usually becomes real when Pulisic gets turned toward goal.', tag:'🇺🇸 Host star'},
  {find:'Giovanni REYNA', team:'United States', bucket:'Hosts to know', hook:'The US creator with the highest “wait, he can do that?” factor.', role:'Central/inside attacker who sees passes before they exist.', watch:'If he gets time between the lines, runners should start sprinting.', tag:'🎻 Playmaker'},
  {find:'Weston McKENNIE', team:'United States', bucket:'Hosts to know', hook:'The US midfield chaos agent: tackles, headers, late runs, vibes.', role:'Box-to-box midfielder who makes games messy in useful ways.', watch:'On set pieces and back-post crosses, he is a real scoring threat.', tag:'💪 Engine'},
  {find:'Tyler ADAMS', team:'United States', bucket:'Hosts to know', hook:'The American midfield seatbelt.', role:'Defensive midfielder who cleans up danger before casual viewers notice it.', watch:'If the US look organized, Adams is probably why.', tag:'🧱 Stabilizer'},
  {find:'Alphonso DAVIES', team:'Canada', bucket:'Hosts to know', hook:'Canada’s world-class sprinter in cleats.', role:'Left-sided blur who can defend deep and explode into attack.', watch:'Every Canada counterattack gets scarier if Davies has open space.', tag:'🇨🇦 Jetpack'},
  {find:'Jonathan DAVID', team:'Canada', bucket:'Hosts to know', hook:'Canada’s most reliable route from good performance to actual goals.', role:'Smart striker who finds pockets and finishes cleanly.', watch:'He is not always loud, but he is often in the right place before the ball arrives.', tag:'🎯 Quiet killer'},
  {find:'Cyle LARIN', team:'Canada', bucket:'Hosts to know', hook:'Already wrote himself into Canada’s home-tournament story.', role:'Center forward who gives Canada a target and a poacher’s finish.', watch:'When Canada need a goal, crosses and second balls bend toward him.', tag:'🍁 Big moment'},
  {find:'Guillermo OCHOA', team:'Mexico', bucket:'Hosts to know', hook:'The World Cup seems legally required to include an Ochoa miracle game.', role:'Veteran goalkeeper with tournament aura and ridiculous reflex highlights.', watch:'If Mexico are under siege, the camera will find him — often after a save.', tag:'🧤 Folk hero'},
  {find:'Gilberto MORA', team:'Mexico', bucket:'Young chaos merchants', hook:'The 17-year-old host-nation phenom, which is exactly as fun as it sounds.', role:'Attacking midfielder with fearlessness baked in.', watch:'Teenagers play without knowing what they are supposed to be afraid of. That is the appeal.', tag:'🧒 Breakout watch'},
  {find:'Santiago GIMENEZ', team:'Mexico', bucket:'Hosts to know', hook:'Mexico’s cleanest center-forward path to knockout goals.', role:'Penalty-box striker who wants service early and often.', watch:'If Mexico’s wide players are crossing low, Giménez is the intended ending.', tag:'🇲🇽 No. 9'},
  {find:'SON Heungmin', team:'South Korea', bucket:'Last dances', hook:'Korea’s captain, superstar, and emotional heartbeat.', role:'Forward who can finish with either foot and punish space behind defenders.', watch:'When Korea break forward, Son is both the outlet and the destination.', tag:'🇰🇷 Captain'},
  {find:'Luka MODRIC', team:'Croatia', bucket:'Last dances', hook:'The tiny midfield wizard who refuses to let Croatia become normal.', role:'Tempo controller: receives under pressure, escapes, makes the right pass.', watch:'Watch how rarely he looks rushed. That is the trick.', tag:'🎩 Maestro'},
  {find:'Kevin DE BRUYNE', team:'Belgium', bucket:'Last dances', hook:'Belgium’s golden-generation conductor taking one more swing.', role:'Chance-creation cannon: early crosses, through balls, shots from the edge.', watch:'If he has his head up near the right half-space, danger is loading.', tag:'🎯 Creator'},
  {find:'MOHAMED SALAH', team:'Egypt', bucket:'Everyone will mention', hook:'Egypt’s king finally gets another global stage.', role:'Right-sided scorer who turns half-chances into high drama.', watch:'Egypt do not need many attacks if Salah gets the right one.', tag:'👑 The king'},
  {find:'NEYMAR JR', team:'Brazil', bucket:'Last dances', hook:'Still the tournament’s great wild card: genius, drama, and uncertainty in one package.', role:'Creator/forward who attracts defenders and unlocks combinations.', watch:'If he starts drawing fouls, Brazil’s rhythm changes around him.', tag:'🎭 Wild card'},
  {find:'RAPHINHA', team:'Brazil', bucket:'Everyone will mention', hook:'Brazil’s direct, relentless right-sided problem.', role:'Winger who presses, shoots early, and attacks the back post.', watch:'His best games feel like he is playing at a slightly angrier speed.', tag:'🔥 Pressure'},
  {find:'Jamal MUSIALA', team:'Germany', bucket:'Young chaos merchants', hook:'Germany’s joy machine after two straight World Cup faceplants.', role:'Dribbler between the lines who makes defenders open their hips.', watch:'When Musiala receives on the half-turn, Germany suddenly look modern.', tag:'🪄 Dribbler'},
  {find:'Florian WIRTZ', team:'Germany', bucket:'Young chaos merchants', hook:'The passer who can make Germany feel inevitable again.', role:'Creative midfielder who links quick combinations around the box.', watch:'He is the player turning safe possession into the final pass.', tag:'🧠 Connector'},
  {find:'PEDRI', team:'Spain', bucket:'Everyone will mention', hook:'Spain’s metronome: the calm inside all that passing.', role:'Midfielder who controls rhythm and finds tiny gaps.', watch:'He rarely makes the obvious pass if a better one appears half a second later.', tag:'🎼 Rhythm'},
  {find:'Federico VALVERDE', team:'Uruguay', bucket:'Dark horse weapons', hook:'Uruguay’s turbo engine, long-range cannon, and emotional accelerant.', role:'Box-to-box midfielder with elite ball-striking and recovery speed.', watch:'If Uruguay need the game to get meaner and faster, he is built for that.', tag:'🚀 Engine'},
  {find:'Darwin NUNEZ', team:'Uruguay', bucket:'Dark horse weapons', hook:'Chaos, speed, misses, goals — sometimes all in the same five minutes.', role:'Vertical striker who stretches defenses until something snaps.', watch:'Do not judge him by one touch. Judge him by whether defenders look comfortable. They usually do not.', tag:'🌪️ Chaos'},
  {find:'Martin ODEGAARD', team:'Norway', bucket:'Dark horse weapons', hook:'The supply line for Haaland and Norway’s actual steering wheel.', role:'Left-footed creator who controls tempo from the right half-space.', watch:'If Ødegaard has time, Haaland starts making nightmare runs.', tag:'🎻 Supplier'},
  {find:'Alexander Isak', team:'Sweden', bucket:'Dark horse weapons', hook:'Tall striker, silky feet, and no obvious panic button.', role:'Forward who can run channels or create his own shot.', watch:'He looks elegant right before doing something rude to a center-back.', tag:'🧊 Cool finisher'},
  {find:'Viktor GYOKERES', team:'Sweden', bucket:'Dark horse weapons', hook:'The other half of Sweden’s terrifying striker problem.', role:'Power runner who bullies space and finishes through contact.', watch:'If he gets shoulder-to-shoulder with a defender, the defender may already be losing.', tag:'🐂 Power'},
  {find:'Romelu LUKAKU', team:'Belgium', bucket:'Last dances', hook:'Belgium’s old wrecking ball still matters because goals are goals.', role:'Target striker who pins defenders and finishes close to goal.', watch:'Belgium will look for him when they need simple violence in the box.', tag:'🧱 Target'},
  {find:'Jeremy DOKU', team:'Belgium', bucket:'Young chaos merchants', hook:'A winger whose first touch can turn a match into a track meet.', role:'One-on-one dribbler who forces help defenders to abandon shape.', watch:'If Doku beats the first man, the second defender becomes the real story.', tag:'💨 Dribbler'},
  {find:'Achraf HAKIMI', team:'Morocco', bucket:'Dark horse weapons', hook:'Morocco’s right-sided superhighway.', role:'Attacking fullback who adds speed, crossing, and set-piece bite.', watch:'Morocco’s biggest moments often start with Hakimi arriving like a winger.', tag:'🛣️ Fullback'},
  {find:'Brahim DIAZ', team:'Morocco', bucket:'Dark horse weapons', hook:'Morocco’s extra layer of invention after the 2022 semifinal run.', role:'Slippery attacker who operates between midfield and the penalty area.', watch:'When defenses collapse on Hakimi, Brahim can appear in the pocket behind them.', tag:'✨ Inventor'},
  {find:'Luis DIAZ', team:'Colombia', bucket:'Dark horse weapons', hook:'Colombia’s prime-years winger and the reason nobody wants that draw.', role:'Left-sided attacker who presses, dribbles, and attacks the far post.', watch:'If Colombia win Group K, Díaz is probably central to the movie.', tag:'🇨🇴 Spark'},
  {find:'James RODRIGUEZ', team:'Colombia', bucket:'Last dances', hook:'The 2014 World Cup darling is still conducting one last symphony.', role:'Creative midfielder with set-piece delivery and final-pass imagination.', watch:'He may not sprint past people, but dead balls and diagonals still bend around him.', tag:'🎼 Throwback'},
  {find:'Scott McTominay', team:'Scotland', bucket:'Dark horse weapons', hook:'Scotland’s late-arriving goal threat from midfield.', role:'Big midfielder who crashes the box like a striker.', watch:'On cutbacks and second balls, he becomes much more dangerous than his position label suggests.', tag:'🏴 Runner'},
  {find:'Edin DZEKO', team:'Bosnia and Herzegovina', bucket:'Last dances', hook:'Forty years old and still the reference point for Bosnia’s attack.', role:'Veteran striker who uses positioning and timing more than speed.', watch:'If Bosnia need calm in the box, Džeko is the adult in the room.', tag:'🧓 Veteran'},
  {find:'Takefusa KUBO', team:'Japan', bucket:'Young chaos merchants', hook:'Japan’s technical spark in a team that already scared giants in 2022.', role:'Right-sided creator with quick feet and quicker decisions.', watch:'Japan’s attacks are most fun when Kubo receives between the lines.', tag:'🇯🇵 Spark'},
  {find:'Bukayo SAKA', team:'England', bucket:'Young chaos merchants', hook:'England’s reliable wide threat, somehow still young and already essential.', role:'Right winger who combines strength, balance, and smart final balls.', watch:'If England isolate him against a fullback, help is coming — and that opens space elsewhere.', tag:'🏹 Wide threat'},
  {find:'BRUNO FERNANDES', team:'Portugal', bucket:'Everyone will mention', hook:'Portugal’s risk-taker, chance-maker, and shot-from-nowhere merchant.', role:'Attacking midfielder who accepts turnovers because the upside is a dagger.', watch:'If Bruno is finding Ronaldo early, Portugal are in business.', tag:'🎲 Creator'},
  {find:'VITINHA', team:'Portugal', bucket:'Everyone will mention', hook:'Portugal’s control room behind the highlight names.', role:'Midfielder who keeps possession moving and chooses the match’s tempo.', watch:'When Portugal look smooth rather than frantic, Vitinha is usually nearby.', tag:'🧠 Control'},
  {find:'RAFAEL LEAO', team:'Portugal', bucket:'Young chaos merchants', hook:'A glide-speed winger who can make elite defenders look flat-footed.', role:'Left winger who carries the ball fast and attacks space behind.', watch:'He looks casual until the sprint starts. Then it is a problem.', tag:'💨 Glide'}
];

function localized(value) {
  return Array.isArray(value) && value[0] ? value[0].Description : (value || '');
}
function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}
function capToken(token) {
  if (!token) return token;
  const lower = token.toLocaleLowerCase('en-US');
  if (['ii', 'iii', 'iv'].includes(lower)) return lower.toUpperCase();
  if (lower === 'jr' || lower === 'jr.') return 'Jr.';
  if (lower.startsWith('mc') && lower.length > 2) return 'Mc' + lower.charAt(2).toUpperCase() + lower.slice(3);
  return lower.charAt(0).toLocaleUpperCase('en-US') + lower.slice(1);
}
function humanName(raw) {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/([\s\-'])/)
    .map(part => /[\s\-']/.test(part) ? part : capToken(part))
    .join('')
    .replace(/\bDe Bruyne\b/g, 'De Bruyne')
    .replace(/\bVan Dijk\b/g, 'Van Dijk')
    .replace(/\bVinicius Junior\b/g, 'Vinícius Júnior')
    .replace(/\bCristiano Ronaldo\b/g, 'Cristiano Ronaldo')
    .replace(/\bMohamed Salah\b/g, 'Mohamed Salah');
}
function ageOnTournamentStart(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(+d)) return null;
  let age = AGE_ON.getUTCFullYear() - d.getUTCFullYear();
  const beforeBirthday = AGE_ON.getUTCMonth() < d.getUTCMonth() || (AGE_ON.getUTCMonth() === d.getUTCMonth() && AGE_ON.getUTCDate() < d.getUTCDate());
  if (beforeBirthday) age--;
  return age;
}
function groupForTeam(team) {
  for (const [group, names] of Object.entries(GROUP_TEAMS)) {
    if (names.includes(team)) return group;
  }
  return null;
}
function canonicalTeam(rawName) {
  return TEAM_NAME_MAP[rawName] || rawName;
}
function simplifyPlayer(raw, teamRaw) {
  const team = canonicalTeam(teamRaw);
  const group = groupForTeam(team);
  if (!TEAMS[team] || !group) throw new Error(`Unknown FIFA team mapping: ${teamRaw} -> ${team}`);
  const pos = localized(raw.RealPositionLocalized) || localized(raw.PositionLocalized) || POSITION_BY_CODE[raw.Position] || 'Player';
  return {
    id: String(raw.IdPlayer),
    name: humanName(localized(raw.PlayerName)),
    short: humanName(localized(raw.ShortName) || localized(raw.PlayerName)),
    team,
    group,
    num: Number(raw.JerseyNum),
    pos,
    age: ageOnTournamentStart(raw.BirthDate),
    birth: raw.BirthDate ? raw.BirthDate.slice(0, 10) : null,
    h: raw.Height ? Number(raw.Height) : null,
    w: raw.Weight ? Number(raw.Weight) : null
  };
}
function statEntry(row) {
  const num = (value, fallback=0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const nullableNum = value => value == null ? null : num(value, null);
  return {
    m: nullableNum(row.MatchesPlayed),
    min: num(row.ActualMinutesPlayed),
    starts: nullableNum(row.MatchesStarted),
    g: num(row.GoalsScored),
    a: num(row.Assists),
    shots: num(row.TotalAttempts),
    onTarget: num(row.AttemptsOnTarget)
  };
}
function findPlayer(players, seed) {
  const wanted = normalizeKey(seed.find);
  const team = seed.team;
  const hits = players.filter(p =>
    (!team || p.team === team) &&
    (normalizeKey(p.name).includes(wanted) || normalizeKey(p.short).includes(wanted) || wanted.includes(normalizeKey(p.name)) || wanted.includes(normalizeKey(p.short)))
  );
  if (!hits.length) {
    throw new Error(`Spotlight seed did not match roster: ${seed.find} (${seed.team || 'any team'})`);
  }
  hits.sort((a,b) => Number(a.num === 10 ? -1 : 0) - Number(b.num === 10 ? -1 : 0));
  return hits[0];
}

async function getJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json();
}

const squads = await getJson(SQUADS_URL);
const stats = await getJson(STATS_URL);
const players = squads.Results.flatMap(team => {
  const teamName = localized(team.TeamName);
  return (team.Players || []).map(p => simplifyPlayer(p, teamName));
}).sort((a,b) => a.group.localeCompare(b.group) || a.team.localeCompare(b.team) || a.pos.localeCompare(b.pos) || a.num - b.num || a.name.localeCompare(b.name));

if (players.length !== 1248) throw new Error(`Expected 1248 players, got ${players.length}`);
const ids = new Set(players.map(p => p.id));
if (ids.size !== players.length) throw new Error('Duplicate player IDs found in squad feed');

const playerStats = {};
for (const row of stats.PlayerStatsList || []) {
  const id = String(row.PlayerInfo?.IdPlayer || '');
  if (id && ids.has(id)) playerStats[id] = statEntry(row);
}

const playerSpotlights = {};
for (const seed of SPOTLIGHT_SEEDS) {
  const player = findPlayer(players, seed);
  playerSpotlights[player.id] = {
    bucket: seed.bucket,
    tag: seed.tag,
    hook: seed.hook,
    role: seed.role,
    watch: seed.watch
  };
}
if (Object.keys(playerSpotlights).length < 30) throw new Error(`Expected >=30 spotlights, got ${Object.keys(playerSpotlights).length}`);

function jsLiteral(value, space) {
  return JSON.stringify(value, null, space)
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const sourceComment = `/* player roster: normalized from FIFA public squads endpoint, generated ${SNAPSHOT_AS_OF} by scripts/sync-players.mjs */`;
const playerBlock = `${sourceComment}\nconst PLAYERS = ${jsLiteral(players)};\n\nconst PLAYER_STATS = ${jsLiteral(playerStats)};\n\nconst PLAYER_SPOTLIGHTS = ${jsLiteral(playerSpotlights, 2)};\n\n`;

let nextHtml;
const existingBlock = /\/\* player roster: normalized from FIFA public squads endpoint[\s\S]*?\nconst ODDS = \[/;
if (existingBlock.test(html)) {
  nextHtml = html.replace(existingBlock, `${playerBlock}const ODDS = [`);
} else {
  nextHtml = html.replace('\nconst ODDS = [', `\n${playerBlock}const ODDS = [`);
}
if (nextHtml === html) {
  console.log(JSON.stringify({ ok: true, unchanged: true, players: players.length, stats: Object.keys(playerStats).length, spotlights: Object.keys(playerSpotlights).length, html: path.relative(root, htmlPath) }, null, 2));
} else {
  fs.writeFileSync(htmlPath, nextHtml);
  console.log(JSON.stringify({ ok: true, players: players.length, stats: Object.keys(playerStats).length, spotlights: Object.keys(playerSpotlights).length, html: path.relative(root, htmlPath) }, null, 2));
}
