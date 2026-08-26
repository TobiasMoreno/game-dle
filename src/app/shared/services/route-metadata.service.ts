import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouteMetadataService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private started = false;

  start(): void {
    if (this.started) return;
    this.started = true;
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.apply());
    this.apply();
  }

  private apply(): void {
    const route = this.deepestRoute(this.router.routerState.snapshot.root);
    const title = typeof route.title === 'string' ? route.title : 'Game-DLE';
    const description = typeof route.data['description'] === 'string'
      ? route.data['description']
      : 'Desafíos diarios, rondas ilimitadas y juegos para compartir.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    const canonicalUrl = `https://game-dle.web.app${this.router.url.split('?')[0].split('#')[0]}`;
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.updateCanonical(canonicalUrl);
  }

  private updateCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  private deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current;
  }
}
