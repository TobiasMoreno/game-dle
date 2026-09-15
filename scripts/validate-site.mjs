import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'parse5';

const pages = JSON.parse(await readFile('src/app/public-pages.json', 'utf8'));
const hosting = JSON.parse(await readFile('firebase.json', 'utf8')).hosting;
const remote = process.argv.find(arg => arg.startsWith('--url='))?.slice(6);
const origin = remote?.replace(/\/$/, '');
const failures = [];
const documents = new Map();
function nodes(node, predicate, found = []) {
  if (predicate(node)) found.push(node);
  for (const child of node.childNodes ?? []) nodes(child, predicate, found);
  return found;
}
const attr = (node, key) => node.attrs?.find(item => item.name === key)?.value;
function text(node) {
  if (node.nodeName === '#text') return node.value;
  if (['style', 'script'].includes(node.tagName)) return '';
  return (node.childNodes ?? []).map(text).join(' ').replace(/\s+/g, ' ').trim();
}
const load = async path => {
  if (!origin) return readFile(`${hosting.public}/${path}`, 'utf8');
  const response = await fetch(`${origin}/${path}`, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}`);
  if (['ads.txt', 'robots.txt'].includes(path)) assert(response.headers.get('content-type')?.includes('text/plain'), `${path}: debe ser texto plano`);
  assert(!/noindex/i.test(response.headers.get('x-robots-tag') ?? ''), `${path}: X-Robots-Tag`);
  return response.text();
};
// Lotes acotados: no generar un volumen de rastreo innecesario en Hosting.
for (let start = 0; start < pages.length; start += 6) {
  await Promise.all(pages.slice(start, start + 6).map(async page => {
    try {
      const html = origin ? await load(page.path) : await load(page.path ? `${page.path}/index.html` : 'index.html');
      const document = parse(html);
      const title = nodes(document, node => node.tagName === 'title');
      const h1 = nodes(document, node => node.tagName === 'h1');
      const canonicals = nodes(document, node => node.tagName === 'link' && attr(node, 'rel') === 'canonical');
      const descriptions = nodes(document, node => node.tagName === 'meta' && attr(node, 'name') === 'description');
      assert.equal(title.length, 1, `${page.path}: title`);
      assert.equal(text(title[0]), page.title, `${page.path}: título incorrecto`);
      assert.equal(h1.length, 1, `${page.path}: debe existir un H1 principal`);
      assert(text(h1[0]).length > 2, `${page.path}: H1 vacío`);
      assert.equal(canonicals.length, 1, `${page.path}: canonical`);
      assert.equal(attr(canonicals[0], 'href'), `https://game-dle.web.app/${page.path}`, `${page.path}: canonical incorrecta`);
      assert.equal(descriptions.length, 1, `${page.path}: description`);
      assert(attr(descriptions[0], 'content')?.length > 15, `${page.path}: descripción vacía`);
      assert(!nodes(document, node => node.tagName === 'meta' && ['robots', 'googlebot'].includes(attr(node, 'name')) && /noindex/i.test(attr(node, 'content') ?? '')).length, `${page.path}: noindex`);
      const paragraphs = nodes(document, node => node.tagName === 'p').map(text);
      assert(!paragraphs.some(value => /^No pudimos (abrir el atlas|cargar el catálogo musical|cargar los campeones)/.test(value) || /^No hay suficientes datos para crear este tablero/.test(value)), `${page.path}: error de catálogo publicado`);
      const links = nodes(document, node => node.tagName === 'a').map(node => attr(node, 'href'));
      for (const legal of ['/privacidad', '/terminos', '/acerca-de', '/contacto']) assert(links.includes(legal), `${page.path}: falta enlace ${legal}`);
      if (page.path.startsWith('games/')) {
        const editorial = nodes(document, node => node.tagName === 'app-game-editorial-content');
        assert(editorial.some(node => text(node).split(/\s+/).length >= 150), `${page.path}: falta explicación editorial inicial`);
      }
      documents.set(page.path, { title: text(title[0]), links });
    } catch (error) { failures.push(error.message); }
  }));
}
try {
  assert.equal(new Set(pages.map(page => page.path)).size, pages.length, 'Rutas duplicadas en manifest');
  assert.equal(new Set([...documents.values()].map(document => document.title)).size, pages.length, 'Títulos duplicados');
  const sitemap = await load('sitemap.xml');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual([...urls].sort(), pages.map(page => `https://game-dle.web.app/${page.path}`).sort(), 'Sitemap no coincide con las rutas');
  const robots = await load('robots.txt');
  assert(robots.includes('Allow: /') && robots.includes('Sitemap: https://game-dle.web.app/sitemap.xml'), 'robots incorrecto');
  const ads = await load('ads.txt');
  assert.equal(ads.trim(), 'google.com, pub-9225896761341125, DIRECT, f08c47fec0942fa0', 'ads.txt incorrecto');
  const known = new Set(pages.map(page => `/${page.path}`));
  for (const [path, document] of documents) {
    for (const href of document.links) {
      if (!href?.startsWith('/') || href.startsWith('//')) continue;
      const target = href.split('#')[0].split('?')[0];
      assert(known.has(target) || target === '/home', `${path}: enlace interno desconocido ${href}`);
    }
  }
  if (origin) {
    const missing = await fetch(`${origin}/auditoria-ruta-inexistente-20260915`, { redirect: 'manual' });
    assert.equal(missing.status, 404, 'Una ruta inexistente debe devolver HTTP 404');
    assert(/noindex/.test(await missing.text()), '404 publicado debe quedar excluido');
    const shell = await fetch(`${origin}/index.csr.html`, { redirect: 'manual' });
    assert.equal(shell.status, 404, 'El shell CSR no debe estar publicado');
    const alias = await fetch(`${origin}/home`, { redirect: 'manual' });
    assert.equal(alias.status, 301, '/home debe redirigir permanentemente');
    assert.equal(new URL(alias.headers.get('location'), origin).pathname, '/', '/home debe apuntar a raíz');
  } else {
    assert(!hosting.rewrites?.some(rule => rule.source === '**'), 'Catch-all genera soft 404');
    const missing = await load('404.html');
    assert(/noindex/.test(missing), '404 debe quedar excluido');
    assert(hosting.ignore.includes('index.csr.html'), 'Shell CSR no debe desplegarse');
  }
} catch (error) { failures.push(error.message); }
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Validación ${origin ?? 'local'}: ${pages.length} páginas, H1, SEO, editorial, enlaces, sitemap y ads.txt correctos.`);
