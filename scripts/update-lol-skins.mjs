import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
const CATALOG_PATH = path.resolve('public/campeones_lol.json');
const LOCALE = 'es_MX';
const MANUAL_IDS = {
  Bardo: 'Bard',
  'Maestro Yi': 'MasterYi',
  'Nunu y Willump': 'Nunu',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalize(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

async function getJson(url) {
  const response = await fetch(url);
  assert(response.ok, `${url} respondió ${response.status}.`);
  return response.json();
}

async function main() {
  const versions = await getJson(VERSIONS_URL);
  const version = versions[0];
  assert(version, 'Data Dragon no informó una versión disponible.');

  const dataBaseUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/data/${LOCALE}`;
  const summary = await getJson(`${dataBaseUrl}/champion.json`);
  const officialChampions = Object.values(summary.data);
  const officialByName = new Map(officialChampions.map((champion) => [normalize(champion.name), champion.id]));
  const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));

  for (let index = 0; index < catalog.length; index += 8) {
    const batch = catalog.slice(index, index + 8);
    await Promise.all(batch.map(async (champion) => {
      const officialId = MANUAL_IDS[champion.nombre] ?? officialByName.get(normalize(champion.nombre));
      assert(officialId, `${champion.nombre}: no se encontró en Data Dragon ${version}.`);
      const detail = await getJson(`${dataBaseUrl}/champion/${officialId}.json`);
      const officialChampion = detail.data[officialId];
      assert(officialChampion, `${champion.nombre}: respuesta individual inválida.`);

      champion.img_url ??= `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${officialId}_0.jpg`;
      champion.skins = officialChampion.skins
        .filter((skin) => skin.num > 0 && skin.parentSkin === undefined)
        .map((skin) => ({
          nombre: skin.name,
          numero: skin.num,
          img_url: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${officialId}_${skin.num}.jpg`,
        }));
      assert(champion.skins.length > 0, `${champion.nombre}: no se encontraron skins jugables.`);
    }));
  }

  await writeFile(CATALOG_PATH, `${JSON.stringify(catalog, null, 4)}\n`, 'utf8');
  const skinCount = catalog.reduce((total, champion) => total + champion.skins.length, 0);
  console.log(`LoL: ${skinCount} skins de ${catalog.length} campeones sincronizadas con Data Dragon ${version}.`);
}

main().catch((error) => {
  console.error(`LoL skins: ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
