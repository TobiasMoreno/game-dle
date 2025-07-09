import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameState } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { ThemeService } from '../../shared/services/theme.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-home',
  imports: [FooterComponent],
  templateUrl: './home.component.html',
  styles: [],
})
export class HomeComponent {
  games: GameState[] = [];
  router = inject(Router);
  gameManager = inject(GameManagerService);
  private themeService = inject(ThemeService);

  ngOnInit() {
    this.themeService.setHeaderTheme('default');
    this.themeService.setFooterTheme('default');
    
    this.gameManager.games$.subscribe((games) => {
      this.games = games;
    });
  }

  /**
   * Navega a un juego específico
   */
  navigateToGame(game: GameState): void {
    this.router.navigate([game.route]);
  }

  /**
   * Obtiene la clase CSS para el estado del juego
   */
  getGameStatusClass(game: GameState): string {
    if (!game.dailyState) {
      return 'text-gray-500 dark:text-gray-400'; // No jugado hoy
    }

    if (game.dailyState.won) {
      return 'text-green-600 dark:text-green-400'; // Ganado
    } else {
      return 'text-red-600 dark:text-red-400'; // Perdido
    }
  }

  /**
   * Obtiene el texto del estado del juego
   */
  getGameStatusText(game: GameState): string {
    if (!game.dailyState) {
      return 'Nuevo juego disponible';
    }

    if (game.dailyState.won) {
      return `¡Ganaste en ${game.dailyState.attempts} intentos!`;
    } else {
      return 'Mejor suerte mañana';
    }
  }
}
