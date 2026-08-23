import { Injectable, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';
import { GameManagerService } from './game-manager.service';
import { GamePresentationService } from './game-presentation.service';

export function routeMatchesRecommendation(routePath: string | undefined, recommendationRoute: string | undefined): boolean {
  return Boolean(routePath && recommendationRoute && routePath === recommendationRoute.replace(/^\//, ''));
}

@Injectable({ providedIn: 'root' })
export class NextGamePreloadingStrategy implements PreloadingStrategy {
  private readonly games = inject(GameManagerService);
  private readonly presentation = inject(GamePresentationService);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const recommendation = this.presentation.getNextGame(this.games.getGames());
    return routeMatchesRecommendation(route.path, recommendation?.game.route) ? load() : of(null);
  }
}
