import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GamePresentationState, GameState } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { GamePresentationService } from '../../shared/services/game-presentation.service';
import { ThemeService } from '../../shared/services/theme.service';

type UniverseId = 'lol' | 'futbol';

interface GameUniverse {
  id: UniverseId;
  eyebrow: string;
  title: string;
  lead: string;
  note: string;
  icon: string;
  gameIds: string[];
}

const UNIVERSES: Record<UniverseId, GameUniverse> = {
  lol: {
    id: 'lol',
    eyebrow: 'La Grieta te espera',
    title: 'League of Legends',
    lead: 'Campeones, regiones, roles y habilidades. Todo el universo de LoL, reunido en un solo lugar.',
    note: 'Nuevos desafíos de League of Legends van a aparecer acá.',
    icon: 'fas fa-wand-sparkles',
    gameIds: ['loldle', 'lol-who', 'lol-memory', 'lol-timeline', 'lol-connections'],
  },
  futbol: {
    id: 'futbol',
    eyebrow: 'Noventa minutos de cultura futbolera',
    title: 'Fútbol',
    lead: 'Apellidos, clubes y grandes historias. Elegí cómo querés demostrar cuánto sabés de fútbol.',
    note: 'Esta sección va a crecer con más formatos y desafíos futboleros.',
    icon: 'fas fa-futbol',
    gameIds: ['futboldle', 'roscodle'],
  },
};

@Component({
  selector: 'app-game-universe',
  imports: [RouterLink, FooterComponent],
  templateUrl: './game-universe.component.html',
})
export class GameUniverseComponent implements OnInit, OnDestroy {
  universe = UNIVERSES.lol;
  games: GameState[] = [];

  private readonly route = inject(ActivatedRoute);
  private readonly gameManager = inject(GameManagerService);
  private readonly gamePresentation = inject(GamePresentationService);
  private readonly themeService = inject(ThemeService);
  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.route.data.subscribe((data) => {
      const universeId = data['universe'] as UniverseId;
      this.universe = UNIVERSES[universeId] ?? UNIVERSES.lol;
      const theme = this.universe.id === 'lol' ? 'loldle' : 'default';
      this.themeService.setHeaderTheme(theme);
      this.themeService.setFooterTheme(theme);
      this.updateGames(this.gameManager.getGames());
    }));

    this.subscriptions.add(this.gameManager.games$.subscribe((games) => this.updateGames(games)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getGamePresentation(game: GameState): GamePresentationState {
    return this.gamePresentation.getState(game);
  }

  private updateGames(games: GameState[]): void {
    this.games = this.universe.gameIds
      .map((id) => games.find((game) => game.id === id))
      .filter((game): game is GameState => Boolean(game));
  }
}
