import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RouteMetadataService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
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
  }

  private deepestRoute(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = route;
    while (current.firstChild) current = current.firstChild;
    return current;
  }
}
