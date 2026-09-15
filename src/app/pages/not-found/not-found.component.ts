import { Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, FooterComponent],
  template: `<main class="mx-auto max-w-3xl px-6 py-20"><p>404 · Game-DLE</p><h1 class="my-6 font-serif text-5xl">Esta página no existe</h1><p>La dirección puede haber cambiado o contener un error. Elegí un juego desde la portada o consultá las guías.</p><nav class="my-8 flex gap-6"><a routerLink="/">Volver a la portada</a><a routerLink="/guias">Leer las guías</a></nav></main><app-footer />`,
})
export class NotFoundComponent {
  constructor() { inject(Meta).updateTag({ name: 'robots', content: 'noindex, follow' }); }
}
