import { readFile, writeFile } from 'node:fs/promises';

const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const pages = await readJson('src/app/public-pages.json');
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const urls = pages.map(page => `  <url><loc>${escapeXml(`https://game-dle.web.app/${page.path}`)}</loc></url>`);
// Se omite lastmod: una fecha de build no acredita revisión editorial de cada página.
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
const [countries, songs, champions, characters, arcs, words] = await Promise.all([
  'geodle-countries.json', 'musicdle-songs.json', 'campeones_lol.json',
  'personajes_one_piece.json', 'arcos.json', 'palabras_wordle.json',
].map(file => readJson(`public/${file}`)));
await writeFile('src/app/catalog-summary.json', JSON.stringify({
  countries: countries.countries.length, countriesGeneratedAt: countries.generatedAt,
  countriesSource: countries.source, champions: champions.length, characters: characters.length,
  arcs: arcs.length, words: words.length, songs: songs.length,
  enabledSongs: songs.filter(song => song.enabled).length,
}, null, 2) + '\n');
console.log(`Sitemap: ${pages.length} páginas canónicas; resumen de catálogos actualizado.`);
