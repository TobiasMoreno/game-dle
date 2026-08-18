import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://countries.dev/countries?full=true';
const FLAG_VERSION = '7.5.0';
const OUTPUT_FILE = path.resolve('public/geodle-countries.json');
const FLAGS_DIR = path.resolve('public/img_flags');

// 193 miembros de la ONU y los dos estados observadores permanentes.
const PLAYABLE_CODES = new Set(`
AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW PS
`.trim().split(/\s+/));

const CONTINENTS = {
  Africa: 'África',
  Americas: 'América',
  Asia: 'Asia',
  Europe: 'Europa',
  Oceania: 'Oceanía',
};

const SUBREGIONS = {
  'Northern Africa': 'África del Norte',
  'Middle Africa': 'África Central',
  'Western Africa': 'África Occidental',
  'Eastern Africa': 'África Oriental',
  'Southern Africa': 'África Austral',
  Caribbean: 'Caribe',
  'Central America': 'América Central',
  'South America': 'América del Sur',
  'North America': 'América del Norte',
  'Northern America': 'América del Norte',
  'Eastern Asia': 'Asia Oriental',
  'South-Eastern Asia': 'Sudeste Asiático',
  'Southern Asia': 'Asia del Sur',
  'Western Asia': 'Asia Occidental',
  'Central Asia': 'Asia Central',
  'Central Europe': 'Europa Central',
  'Eastern Europe': 'Europa Oriental',
  'Northern Europe': 'Europa del Norte',
  'Southern Europe': 'Europa del Sur',
  'Western Europe': 'Europa Occidental',
  'Australia and New Zealand': 'Australia y Nueva Zelanda',
  Melanesia: 'Melanesia',
  Micronesia: 'Micronesia',
  Polynesia: 'Polinesia',
};

const OVERRIDES = {
  PS: { areaKm2: 6025 },
};

const languageNames = new Intl.DisplayNames(['es'], { type: 'language' });
const currencyNames = new Intl.DisplayNames(['es'], { type: 'currency' });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function localizedLanguage(language) {
  if (!language.iso639_1) return language.name;
  try {
    return languageNames.of(language.iso639_1) ?? language.name;
  } catch {
    return language.name;
  }
}

function localizedCurrency(currency) {
  try {
    return currencyNames.of(currency.code) ?? currency.name;
  } catch {
    return currency.name;
  }
}

function normalizeCountry(country, playableCode3) {
  const code = country.alpha2Code;
  const override = OVERRIDES[code] ?? {};
  return {
    code,
    code3: country.alpha3Code,
    name: country.translations.es,
    aliases: unique([country.name, country.nativeName, ...(country.altSpellings ?? [])]),
    capital: country.capital,
    continent: CONTINENTS[country.region],
    subregion: SUBREGIONS[country.subregion],
    languages: unique(country.languages.map(localizedLanguage)),
    currencies: unique(country.currencies.map(localizedCurrency)),
    areaKm2: override.areaKm2 ?? country.area,
    population: country.population,
    coordinates: country.latlng,
    borders: (country.borders ?? []).filter((border) => playableCode3.has(border)),
    flagPath: `img_flags/${code.toLowerCase()}.svg`,
  };
}

function validate(countries) {
  assert(PLAYABLE_CODES.size === 195, `La allowlist debe tener 195 códigos y tiene ${PLAYABLE_CODES.size}.`);
  assert(countries.length === 195, `Se esperaban 195 países y se generaron ${countries.length}.`);
  assert(new Set(countries.map(({ code }) => code)).size === countries.length, 'Hay códigos ISO-2 duplicados.');
  assert(new Set(countries.map(({ code3 }) => code3)).size === countries.length, 'Hay códigos ISO-3 duplicados.');

  for (const country of countries) {
    for (const field of ['code', 'code3', 'name', 'capital', 'continent', 'subregion', 'flagPath']) {
      assert(country[field], `${country.code}: falta ${field}.`);
    }
    assert(country.languages.length > 0, `${country.code}: no tiene idiomas.`);
    assert(country.currencies.length > 0, `${country.code}: no tiene monedas.`);
    assert(Number.isFinite(country.areaKm2) && country.areaKm2 > 0, `${country.code}: superficie inválida.`);
    assert(Number.isFinite(country.population) && country.population > 0, `${country.code}: población inválida.`);
    assert(country.coordinates.length === 2, `${country.code}: coordenadas inválidas.`);
    assert(country.coordinates[0] >= -90 && country.coordinates[0] <= 90, `${country.code}: latitud inválida.`);
    assert(country.coordinates[1] >= -180 && country.coordinates[1] <= 180, `${country.code}: longitud inválida.`);
  }
}

async function downloadFlag(code) {
  const url = `https://cdn.jsdelivr.net/npm/flag-icons@${FLAG_VERSION}/flags/4x3/${code.toLowerCase()}.svg`;
  const response = await fetch(url);
  assert(response.ok, `${code}: no se pudo descargar la bandera (${response.status}).`);
  const svg = await response.text();
  assert(svg.includes('<svg'), `${code}: la bandera descargada no es SVG.`);
  await writeFile(path.join(FLAGS_DIR, `${code.toLowerCase()}.svg`), svg, 'utf8');
}

async function main() {
  const response = await fetch(API_URL);
  assert(response.ok, `countries.dev respondió ${response.status}.`);
  const sourceCountries = await response.json();
  const byCode = new Map(sourceCountries.map((country) => [country.alpha2Code, country]));
  const missingCodes = [...PLAYABLE_CODES].filter((code) => !byCode.has(code));
  assert(missingCodes.length === 0, `Faltan códigos en la API: ${missingCodes.join(', ')}.`);
  const playableCode3 = new Set([...PLAYABLE_CODES].map((code) => byCode.get(code).alpha3Code));

  const countries = [...PLAYABLE_CODES]
    .map((code) => normalizeCountry(byCode.get(code), playableCode3))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  validate(countries);

  await mkdir(FLAGS_DIR, { recursive: true });
  for (let index = 0; index < countries.length; index += 8) {
    await Promise.all(countries.slice(index, index + 8).map(({ code }) => downloadFlag(code)));
  }

  const catalog = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: API_URL,
    flagSource: `flag-icons@${FLAG_VERSION}`,
    countries,
  };
  await writeFile(OUTPUT_FILE, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`GeoDLE: ${countries.length} países y ${countries.length} banderas validados.`);
}

main().catch((error) => {
  console.error(`GeoDLE: ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
