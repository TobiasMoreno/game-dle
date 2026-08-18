import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const catalogPath = path.resolve('public/geodle-countries.json');

function fail(message) {
  throw new Error(message);
}

async function main() {
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
  if (catalog.version !== 1) fail('Versión de catálogo no soportada.');
  if (!Array.isArray(catalog.countries) || catalog.countries.length !== 195) {
    fail(`El catálogo debe contener 195 países; contiene ${catalog.countries?.length ?? 0}.`);
  }

  const codes = new Set();
  for (const country of catalog.countries) {
    if (codes.has(country.code)) fail(`Código duplicado: ${country.code}.`);
    codes.add(country.code);
    if (!country.name || !country.capital || !country.continent || !country.subregion) {
      fail(`${country.code}: faltan campos textuales requeridos.`);
    }
    if (!Array.isArray(country.coordinates) || country.coordinates.length !== 2) {
      fail(`${country.code}: coordenadas inválidas.`);
    }
    if (!Number.isFinite(country.areaKm2) || !Number.isFinite(country.population)) {
      fail(`${country.code}: datos numéricos inválidos.`);
    }
    await access(path.resolve('public', country.flagPath));
  }

  console.log(`GeoDLE: catálogo v${catalog.version} válido (${catalog.countries.length} países).`);
}

main().catch((error) => {
  console.error(`GeoDLE: ${error.message}`);
  process.exitCode = 1;
});
