import { Component, Input, output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GameState } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() isOpen: boolean = true;
  toggleSidebar = output<void>();

  games: GameState[] = [];

  constructor(
    private router: Router,
    private gameManager: GameManagerService
  ) {
    this.gameManager.games$.subscribe(games => {
      this.games = games;
    });
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
      return 'text-gray-400'; // No jugado hoy
    }
    
    if (game.dailyState.won) {
      return 'text-green-400'; // Ganado
    } else {
      return 'text-red-400'; // Perdido
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
    return Math.max(...this.games.map(game => game.stats?.bestStreak || 0));
  }
}
