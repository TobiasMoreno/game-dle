import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';

/**
 * Componente del juego Numberle (placeholder)
 * En el futuro, implementará la lógica para adivinar números
 */
@Component({
  selector: 'app-numberle',
  standalone: true,
  imports: [CommonModule, BaseGameComponent],
  template: `
    <app-base-game 
      (gameCompleted)="onGameCompleted($event)"
      [footerTheme]="'numberle'"
    >
      <div class="text-center py-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Numberle - Próximamente
        </h2>
        <p class="text-gray-600 mb-4">
          Adivina el número en 6 intentos
        </p>
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-yellow-800">
            Este juego estará disponible próximamente. ¡Mantente atento!
          </p>
        </div>
      </div>
    </app-base-game>
  `,
  styles: []
})
export class NumberleComponent extends BaseGameComponent implements OnInit {
  private readonly gameId = 'numberle';

  ngOnInit(): void {
    this.setGameId(this.gameId);
  }

  onGameCompleted(result: {won: boolean, attempts: number, gameData?: any}): void {
    console.log('Juego completado:', result);
  }
} 