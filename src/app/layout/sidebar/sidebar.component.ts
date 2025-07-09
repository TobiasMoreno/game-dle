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

  get sidebarTheme() {
    return this.themeService.getHeaderTheme();
  }

  getSidebarClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'bg-gradient-to-b from-orange-900 to-red-900 border-orange-500';
      case 'wordle':
        return 'bg-gray-900 border-gray-600';
      case 'colorle':
        return 'bg-gradient-to-b from-purple-900 to-pink-900 border-purple-500';
      case 'numberle':
        return 'bg-gradient-to-b from-blue-900 to-indigo-900 border-blue-500';
      case 'loldle':
        return 'bg-gradient-to-b from-blue-900 to-purple-900 border-blue-500';
      default:
        return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  }

  getSidebarTextClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-100';
      case 'wordle':
        return 'text-gray-300';
      case 'colorle':
        return 'text-purple-100';
      case 'numberle':
        return 'text-blue-100';
      case 'loldle':
        return 'text-blue-100';
      default:
        return 'text-gray-900 dark:text-white';
    }
  }

  getSidebarTitleClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-200';
      case 'wordle':
        return 'text-gray-400';
      case 'colorle':
        return 'text-purple-200';
      case 'numberle':
        return 'text-blue-200';
      case 'loldle':
        return 'text-blue-200';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  }

  getSidebarButtonClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-300 hover:text-yellow-300';
      case 'wordle':
        return 'text-gray-400 hover:text-white';
      case 'colorle':
        return 'text-purple-200 hover:text-pink-300';
      case 'numberle':
        return 'text-blue-200 hover:text-indigo-300';
      case 'loldle':
        return 'text-blue-200 hover:text-purple-300';
      default:
        return 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400';
    }
  }

  getGameButtonClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-100 hover:bg-orange-800/50 hover:text-yellow-200';
      case 'wordle':
        return 'text-gray-300 hover:bg-gray-800 hover:text-white';
      case 'colorle':
        return 'text-purple-100 hover:bg-purple-800/50 hover:text-pink-200';
      case 'numberle':
        return 'text-blue-100 hover:bg-blue-800/50 hover:text-indigo-200';
      case 'loldle':
        return 'text-blue-100 hover:bg-blue-800/50 hover:text-purple-200';
      default:
        return 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400';
    }
  }

  getGameIconClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-300';
      case 'wordle':
        return 'text-gray-400';
      case 'colorle':
        return 'text-purple-300';
      case 'numberle':
        return 'text-blue-300';
      case 'loldle':
        return 'text-blue-300';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  }

  getSectionTitleClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-200';
      case 'wordle':
        return 'text-gray-400';
      case 'colorle':
        return 'text-purple-200';
      case 'numberle':
        return 'text-blue-200';
      case 'loldle':
        return 'text-blue-200';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  getStatsTextClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-200';
      case 'wordle':
        return 'text-gray-400';
      case 'colorle':
        return 'text-purple-200';
      case 'numberle':
        return 'text-blue-200';
      case 'loldle':
        return 'text-blue-200';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  getInfoTextClasses(): string {
    switch (this.sidebarTheme) {
      case 'onepiece':
        return 'text-orange-300';
      case 'wordle':
        return 'text-gray-500';
      case 'colorle':
        return 'text-purple-300';
      case 'numberle':
        return 'text-blue-300';
      case 'loldle':
        return 'text-blue-300';
      default:
        return 'text-gray-500 dark:text-gray-500';
    }
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
