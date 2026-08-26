import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Los juegos persisten progreso en el navegador. Durante el prerender no hay
// localStorage, por lo que usamos un adaptador sin estado para generar HTML
// inicial limpio y evitar que una ruta contamine a otra.
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      length: 0,
      clear: () => undefined,
      getItem: () => null,
      key: () => null,
      removeItem: () => undefined,
      setItem: () => undefined,
    } satisfies Storage,
  });
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
