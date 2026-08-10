import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const catalogUrl = new URL('../public/musicdle-songs.json', import.meta.url);
const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Number.POSITIVE_INFINITY;
const idArg = process.argv.find((arg) => arg.startsWith('--id='));
const requestedId = idArg?.slice('--id='.length);
const songs = JSON.parse(await readFile(catalogUrl, 'utf8'));
const pendingOnly = args.has('--pending');
const selectedSongs = (requestedId
  ? songs.filter((song) => song.id === requestedId)
  : pendingOnly
    ? songs.filter((song) => song.youtubeVideoId.startsWith('pending'))
    : songs).slice(0, limit);
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36';
const songFilter = decodeURIComponent('EgWKAQIIAWoKEAkQBRAKEAMQBA%3D%3D');

const queryOverrides = {
  'abuelos-costumbres-argentinas': 'Costumbres Argentinas Los Abuelos De La Nada Audio original',
};

const manualSelections = {
  'los-piojos-pistolas': 'xMg4J2n6sGY',
  'los-piojos-verano-del-92': 'KV-LOwj9tAw',
  'los-piojos-desde-lejos-no-se-ve': 'uley2e_KoWY',
  'los-piojos-ando-ganas': 'BTTEwWQX590',
  'los-piojos-bicho-de-ciudad': 'tZ477ASNs9o',
  'los-piojos-ruleta': 'l2lxukjjQSk',
  'los-piojos-como-ali': 'AtfhFG0o2iM',
  'los-piojos-babilonia': 'hpl7ZFAx5Oc',
  'los-piojos-agua': 'VOqg2VWzClA',
  'los-piojos-vine-hasta-aqui': '427zHJxD060',
  'intoxicados-nunca-quise': 'RRTB_W4jJFY',
  'intoxicados-esta-saliendo-el-sol': 'bDuPlBQjrUQ',
  'intoxicados-no-tengo-ganas': 'sPm-Iaztdoc',
  'intoxicados-se-fue-al-cielo': 'u8I5D7Co24U',
  'intoxicados-senor-kiosquero': 'pCTPBsHj4Y4',
  'intoxicados-quieren-rock': 'c2wbiJ8Qqfw',
  'intoxicados-una-vela': 's_SL2nb0jac',
  'intoxicados-reggae-para-los-amigos': '5FZLs7kS6Rk',
  'intoxicados-las-cosas-que-no-se-tocan': '8h6w0eBugfM',
  'intoxicados-rodando-por-ahi': 'lXeP40zYrRE',
  'soda-stereo-de-musica-ligera': 'sWft4cMiwXQ',
  'fabulosos-cadillacs-matador': 'dKJM2ux3bF8',
  'soda-stereo-cuando-pase-el-temblor': '7PHqjNbwnwU',
  'abuelos-costumbres-argentinas': 'rGeDxHsuUmA',
  'abuelos-lunes-por-la-madrugada': 'Rj8zXVQ3j18',
  'intoxicados-fuego': 'tRrMNRg5oGE',
  'fabulosos-cadillacs-siguiendo-la-luna': '_1kNEcc27u0',
  'la-renga-el-rebelde': 'gqGKBirlpjg',
  'seru-giran-seminare': 'seYKJZ9xAyY',
  'charly-spinetta-rezo-por-vos': 'PqO3ns8iHR0',
  'khea-duki-cazzu-loca': 'BdU4-BJ5iEQ',
  'duki-malbec': 'A5Jyopocqbs',
  'duki-cro-harakiri': 'Tqm5t3AVXIg',
  'modo-diablo-hijo-de-la-noche': 'bytMVl-sgTk',
  'modo-diablo-quavo': 'NXa9K0euapw',
  'duki-obie-wanshot-hielo': 'FwqjmVghjy8',
  'duki-bizarrap-buscarte-lejos': 'S7pn14tZIl8',
  'modo-diablo-trap-n-export': '6iRmp3KQZ6c',
  'duki-khea-bizarrap-remember-me': 'LjlPiitVjgk',
  'duki-ysy-a-punta-de-espada': 'gzB2SSlGcCc',
  'ysy-a-duki-no-da-mas': '8R3h761kmsg',
  'ysy-a-flechazo-en-el-centro': 'qGD2fpTfM70',
  'bhavi-ysy-a-tuuyo': '-1C4IPmnB70',
  'neo-pistea-tumbando-el-club-remix': 'jGhYpX0xjNw',
  'duki-khea-hitboy': 'JOUugt8mGTU',
  'duki-myke-towers-nueva-era': 'D5SJbQYQoWI',
  'ysy-a-full-ice': 'YE3C-5ltpb8',
  'ysy-a-buenos-aires-es-amor': 'DatAcj4zFTY',
  'latin-mafia-humbe-patadas-de-ahogado': 'fszdwQhFih8',
  'khea-ayer-me-llamo-mi-ex': 'aSPLjhySCCw',
  'neo-pistea-tony-the-kid': '85VsqfOCxD4',
  'bhavi-besame': 'EmbJpVZSqAw',
};

const homeResponse = await fetch('https://music.youtube.com/?hl=es&gl=AR', {
  headers: { 'user-agent': userAgent, 'accept-language': 'es-AR,es;q=0.9' },
});
if (!homeResponse.ok) throw new Error(`YouTube Music respondió ${homeResponse.status}.`);
const homeHtml = await homeResponse.text();
const apiKey = extractConfig(homeHtml, 'INNERTUBE_API_KEY');
const clientVersion = extractConfig(homeHtml, 'INNERTUBE_CLIENT_VERSION');

const results = [];
for (let index = 0; index < selectedSongs.length; index += 4) {
  const batch = selectedSongs.slice(index, index + 4);
  const batchResults = await Promise.all(batch.map((song) => curateSong(song)));
  results.push(...batchResults);
  console.log(`Revisadas ${results.length}/${selectedSongs.length} canciones.`);
}

const reportPath = join(tmpdir(), 'game-dle-youtube-music-report.json');
await writeFile(reportPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');

const approved = results.filter((result) => result.status === 'approved');
const review = results.filter((result) => result.status === 'review');

if (apply) {
  const approvedById = new Map(approved.map((result) => [result.id, result.selected]));
  for (const song of songs) {
    const selected = approvedById.get(song.id);
    if (!selected) continue;
    song.youtubeVideoId = selected.videoId;
    song.startSeconds = 0;
  }

  const serialized = `[\n${songs.map((song) => `  ${JSON.stringify(song)}`).join(',\n')}\n]\n`;
  await writeFile(catalogUrl, serialized, 'utf8');
}

console.log(`Aprobadas: ${approved.length}. Requieren revisión: ${review.length}.`);
console.log(`Reporte: ${reportPath}`);
if (apply) console.log(`Catálogo actualizado: ${approved.length} canciones.`);

async function curateSong(song) {
  const query = queryOverrides[song.id] ?? `${song.title} ${song.artist}`;
  const response = await fetch(`https://music.youtube.com/youtubei/v1/search?key=${apiKey}&prettyPrint=false`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': userAgent,
      'x-youtube-client-name': '67',
      'x-youtube-client-version': clientVersion,
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: 'WEB_REMIX',
          clientVersion,
          hl: 'es-419',
          gl: 'AR',
        },
      },
      query,
      params: songFilter,
    }),
  });

  if (!response.ok) {
    return { id: song.id, query, status: 'review', reason: `HTTP ${response.status}`, candidates: [] };
  }

  const payload = await response.json();
  const rankedCandidates = collectCandidates(payload)
    .map((candidate) => ({ ...candidate, score: scoreCandidate(song, candidate) }))
    .sort((left, right) => right.score - left.score);
  const candidates = rankedCandidates.slice(0, 5);
  const manualVideoId = manualSelections[song.id];
  const selected = manualVideoId
    ? rankedCandidates.find((candidate) => candidate.videoId === manualVideoId) ?? null
    : candidates[0] ?? null;
  const exactTitle = selected && normalize(selected.title) === normalize(song.title);
  const artistMatches = selected && artistScore(song.artist, selected.artists) >= 45;
  const status = manualVideoId
    ? selected ? 'approved' : 'review'
    : selected && exactTitle && artistMatches && selected.score >= 140
      ? 'approved'
      : 'review';

  return {
    id: song.id,
    query,
    oldVideoId: song.youtubeVideoId,
    status,
    manualSelection: Boolean(manualVideoId),
    selected,
    candidates,
  };
}

function collectCandidates(payload) {
  const renderers = [];
  walk(payload, (key, value) => {
    if (key === 'musicResponsiveListItemRenderer') renderers.push(value);
  });

  const candidates = renderers.map((renderer) => {
    const columns = renderer.flexColumns ?? [];
    const titleRuns = columns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs ?? [];
    const metadataRuns = columns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs ?? [];
    const artists = metadataRuns
      .filter((run) => run.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
        ?.browseEndpointContextMusicConfig?.pageType === 'MUSIC_PAGE_TYPE_ARTIST')
      .map((run) => run.text);
    const album = metadataRuns.find((run) => run.navigationEndpoint?.browseEndpoint
      ?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig
      ?.pageType === 'MUSIC_PAGE_TYPE_ALBUM')?.text ?? '';
    const duration = metadataRuns.map((run) => run.text).find((text) => /^\d{1,2}:\d{2}$/.test(text)) ?? '';
    const videoId = renderer.playlistItemData?.videoId
      ?? renderer.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
        ?.playNavigationEndpoint?.watchEndpoint?.videoId
      ?? renderer.navigationEndpoint?.watchEndpoint?.videoId
      ?? '';

    return {
      videoId,
      title: titleRuns.map((run) => run.text).join('').trim(),
      artists,
      album,
      duration,
      metadata: metadataRuns.map((run) => run.text).join('').trim(),
    };
  });

  return [...new Map(candidates
    .filter((candidate) => /^[\w-]{11}$/.test(candidate.videoId) && candidate.title)
    .map((candidate) => [candidate.videoId, candidate])).values()];
}

function scoreCandidate(song, candidate) {
  const wantedTitle = normalize(song.title);
  const candidateTitle = normalize(candidate.title);
  let score = 0;

  if (wantedTitle === candidateTitle) score += 100;
  else if (candidateTitle.startsWith(`${wantedTitle} `)
    && /\b(remaster|remasterizado|remastered|official audio|audio oficial)\b/.test(candidateTitle)) {
    score += 85;
  } else if (wantedTitle.includes(candidateTitle) || candidateTitle.includes(wantedTitle)) score += 45;
  score += artistScore(song.artist, candidate.artists);

  const unwantedVersion = /\b(live|en vivo|remix|karaoke|cover|instrumental|gira|edit version)\b/i;
  if (!unwantedVersion.test(song.title) && unwantedVersion.test(candidate.title)) score -= 70;
  if (candidate.album) score += 5;
  if (candidate.duration) score += 5;
  return score;
}

function artistScore(wantedArtist, candidateArtists) {
  const primaryArtist = normalize(wantedArtist).split(/\s*(?:&|,|\bfeat(?:uring)?\b|\bft\b)\s*/)[0];
  const actualArtists = candidateArtists.map(normalize);
  if (actualArtists.some((artist) => artist === primaryArtist)) return 70;
  if (actualArtists.some((artist) => artist.includes(primaryArtist) && !artist.includes('made famous by'))) return 45;
  return 0;
}

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function walk(value, visitor) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visitor);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    visitor(key, child);
    walk(child, visitor);
  }
}

function extractConfig(html, key) {
  const match = html.match(new RegExp(`"${key}":"([^"]+)"`));
  if (!match) throw new Error(`No se encontró ${key} en YouTube Music.`);
  return match[1];
}
