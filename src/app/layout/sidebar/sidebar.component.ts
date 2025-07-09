import { Component, inject, input, OnInit, output } from '@angular/core';
import { Router } from '@angular/router';
import { GameState } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  isOpen = input<boolean>(true);
  toggleSidebar = output<void>();

  games: GameState[] = [];

  router = inject(Router);
  gameManager = inject(GameManagerService);
  themeService = inject(ThemeService);
  ngOnInit() {
    this.gameManager.games$.subscribe((games) => {
      this.games = games;
    });
  }

  get colorMode() {
    return this.themeService.getColorMode();
  }

  /**
   * Navega a un juego específico
   */
  navigateToGame(game: GameState): void {
    this.router.navigate([game.route]);
    this.toggleSidebar.emit();
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
      return 'Nuevo';
    }

    if (game.dailyState.won) {
      return `✅ ${game.dailyState.attempts}/6`;
    } else {
      return '❌ 6/6';
    }
  }

  /**
   * Calcula el total de juegos jugados
   */
  getTotalGames(): number {
    return this.games.reduce((total, game) => {
      return total + (game.stats?.totalGames || 0);
    }, 0);
  }

  /**
   * Calcula el total de victorias
   */
  getTotalWins(): number {
    return this.games.reduce((total, game) => {
      return total + (game.stats?.wins || 0);
    }, 0);
  }

  /**
   * Obtiene la mejor racha entre todos los juegos
   */
  getBestStreak(): number {
    return Math.max(...this.games.map((game) => game.stats?.bestStreak || 0));
  }
}
