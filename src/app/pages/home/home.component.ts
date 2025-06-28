import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameState } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Game-DLE
          </h1>
          <p class="text-xl text-gray-600">
            Colección de juegos diarios inspirados en Wordle
          </p>
        </div>

        <!-- Juegos Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div
            *ngFor="let game of games"
            (click)="navigateToGame(game)"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
          >
            <div class="flex items-center mb-4">
              <i [class]="game.icon + ' text-2xl text-blue-500 mr-3'"></i>
              <h3 class="text-xl font-semibold text-gray-900">{{ game.name }}</h3>
            </div>
            
            <p class="text-gray-600 mb-4">{{ game.description }}</p>
            
            <!-- Estado del juego -->
            <div class="flex items-center justify-between">
              <span 
                [class]="getGameStatusClass(game)"
                class="text-sm font-medium"
              >
                {{ getGameStatusText(game) }}
              </span>
              
              <!-- Estadísticas -->
              <div class="text-xs text-gray-500">
                <div>Jugados: {{ game.stats?.totalGames || 0 }}</div>
                <div>Victorias: {{ game.stats?.wins || 0 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información -->
        <div class="bg-blue-50 rounded-lg p-6 text-center">
          <h3 class="text-lg font-semibold text-blue-900 mb-2">
            ¿Cómo funciona?
          </h3>
          <p class="text-blue-700">
            Cada día tienes un nuevo desafío. Los juegos se actualizan a las 00:00 y 
            puedes jugar una vez por día. ¡Intenta mantener tu racha de victorias!
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent {
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
  }

  /**
   * Obtiene la clase CSS para el estado del juego
   */
  getGameStatusClass(game: GameState): string {
    if (!game.dailyState) {
      return 'text-gray-500'; // No jugado hoy
    }
    
    if (game.dailyState.won) {
      return 'text-green-600'; // Ganado
    } else {
      return 'text-red-600'; // Perdido
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