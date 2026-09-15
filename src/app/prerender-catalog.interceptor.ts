import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import countries from '../../public/geodle-countries.json';
import songs from '../../public/musicdle-songs.json';
import champions from '../../public/campeones_lol.json';

// Solo se importa desde app.config.server: los catálogos no se incluyen en el
// bundle del navegador y el build no depende de un Hosting remoto o un servidor dev.
const catalogs: Readonly<Record<string, unknown>> = {
  '/geodle-countries.json': countries,
  '/musicdle-songs.json': songs,
  '/campeones_lol.json': champions,
};

export const prerenderCatalogInterceptor: HttpInterceptorFn = (request, next) => {
  const url = new URL(request.url, 'https://game-dle.web.app/');
  const path = url.pathname;
  if (request.method === 'GET' && url.origin === 'https://game-dle.web.app' && Object.hasOwn(catalogs, path)) {
    // Cada consumidor obtiene datos propios: algunos juegos ordenan el array.
    return of(new HttpResponse({ body: structuredClone(catalogs[path]), url: request.url }));
  }
  return next(request);
};
