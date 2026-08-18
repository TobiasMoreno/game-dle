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
      case 'loldle':
        return 'bg-gradient-to-b from-blue-900 to-purple-900 border-blue-500';
      case 'musicdle':
        return 'bg-stone-950 border-amber-500';
      case 'geodle':
        return 'bg-[#173b4a] border-[#d85d45]';
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
      case 'loldle':
        return 'text-blue-100';
      case 'musicdle':
        return 'text-amber-100';
      case 'geodle':
        return 'text-[#f3ead7]';
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
      case 'loldle':
        return 'text-blue-200';
      case 'musicdle':
        return 'text-amber-300';
      case 'geodle':
        return 'text-[#e8b94f]';
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
      case 'loldle':
        return 'text-blue-200 hover:text-purple-300';
      case 'musicdle':
        return 'text-amber-200 hover:text-amber-400';
      case 'geodle':
        return 'text-[#f3ead7] hover:text-[#e8b94f]';
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
      case 'loldle':
        return 'text-blue-100 hover:bg-blue-800/50 hover:text-purple-200';
      case 'musicdle':
        return 'text-stone-200 hover:bg-amber-500/10 hover:text-amber-200';
      case 'geodle':
        return 'text-[#f3ead7] hover:bg-[#d85d45]/20 hover:text-white';
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
      case 'loldle':
        return 'text-blue-300';
      case 'musicdle':
        return 'text-amber-400';
      case 'geodle':
        return 'text-[#e8b94f]';
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
      case 'loldle':
        return 'text-blue-200';
      case 'musicdle':
        return 'text-amber-300';
      case 'geodle':
        return 'text-[#e8b94f]';
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
      case 'loldle':
        return 'text-blue-200';
      case 'musicdle':
        return 'text-stone-300';
      case 'geodle':
        return 'text-[#c8d4ce]';
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
      case 'loldle':
        return 'text-blue-300';
      case 'musicdle':
        return 'text-stone-400';
      case 'geodle':
        return 'text-[#a9bcb7]';
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
    if (game.mode === 'unlimited') {
      return 'text-amber-600 dark:text-amber-400';
    }

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
    if (game.mode === 'unlimited') {
      return '∞ rondas';
    }

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
