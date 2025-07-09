import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameState } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';

@Component({
  selector: 'app-home',
  imports: [],
  template: `
    <div class="bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Game-DLE</h1>
          <p class="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Colección de juegos diarios inspirados en Wordle
          </p>
        </div>

        <!-- Juegos Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          @for (game of games; track game.id) {
          <div
            (click)="navigateToGame(game)"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer p-6 border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center mb-4">
              <i [class]="game.icon + ' text-2xl text-blue-500 dark:text-blue-400 mr-3'"></i>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                {{ game.name }}
              </h3>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-200">{{ game.description }}</p>

            <!-- Estado del juego -->
            <div class="flex items-center justify-between">
              <span
                [class]="getGameStatusClass(game)"
                class="text-sm font-medium"
              >
                {{ getGameStatusText(game) }}
              </span>

              <!-- Estadísticas -->
              <div class="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                <div>Jugados: {{ game.stats?.totalGames || 0 }}</div>
                <div>Victorias: {{ game.stats?.wins || 0 }}</div>
              </div>
            </div>
          </div>
          }
        </div>

        <!-- Información -->
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 text-center border border-blue-200 dark:border-blue-800">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 transition-colors duration-200">
            ¿Cómo funciona?
          </h3>
          <p class="text-blue-700 dark:text-blue-300 transition-colors duration-200">
            Cada día tienes un nuevo desafío. Los juegos se actualizan a las
            00:00 y puedes jugar una vez por día. ¡Intenta mantener tu racha de
            victorias!
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class HomeComponent {
  games: GameState[] = [];
  router = inject(Router);
  gameManager = inject(GameManagerService);

  ngOnInit() {
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
