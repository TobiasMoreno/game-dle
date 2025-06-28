import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';

/**
 * Componente del juego Wordle
 * Implementa la lógica del juego de adivinar palabras
 */
@Component({
  selector: 'app-wordle',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseGameComponent],
  template: `
    <app-base-game 
      [gameId]="'wordle'" 
      (gameCompleted)="onGameCompleted($event)"
    >
      <!-- Mensaje si ya se jugó hoy -->
      <div *ngIf="isGamePlayedToday()" class="text-center py-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          ¡Ya jugaste Wordle hoy!
        </h2>
        <p class="text-gray-600">
          Vuelve mañana para un nuevo desafío.
        </p>
      </div>

      <!-- Mensaje de progreso guardado -->
      <div *ngIf="hasSavedProgress && !isGamePlayedToday()" class="text-center py-8">
        <h2 class="text-2xl font-bold text-blue-600 mb-4">
          🎮 ¡Tienes un juego en progreso!
        </h2>
        <p class="text-gray-600 mb-4">
          Tienes {{ currentAttempt }}/{{ maxAttempts }} intentos realizados.
        </p>
        <button
          (click)="continueGame()"
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continuar juego
        </button>
      </div>

      <!-- Juego activo -->
      <div *ngIf="!isGamePlayedToday() && !gameWon && currentAttempt < maxAttempts && !hasSavedProgress" class="space-y-6">
        <!-- Instrucciones -->
        <div class="text-center mb-6">
          <h2 class="text-xl font-semibold mb-2">Adivina la palabra de 5 letras</h2>
          <p class="text-gray-600">Tienes 6 intentos</p>
        </div>

        <!-- Tablero del juego -->
        <div class="flex justify-center">
          <div class="grid grid-cols-5 gap-2">
            <div 
              *ngFor="let row of board; let rowIndex = index"
              class="grid grid-cols-5 gap-2"
            >
              <div 
                *ngFor="let cell of row; let colIndex = index"
                class="w-12 h-12 border-2 border-gray-300 flex items-center justify-center text-xl font-bold uppercase"
                [class]="getCellClass(rowIndex, colIndex)"
              >
                {{ cell }}
              </div>
            </div>
          </div>
        </div>

        <!-- Input para la palabra -->
        <div class="flex justify-center">
          <div class="flex space-x-2">
            <input
              type="text"
              [(ngModel)]="currentGuess"
              (keyup.enter)="submitGuess()"
              (input)="onInputChange($event)"
              maxlength="5"
              class="px-4 py-2 border-2 border-gray-300 rounded-lg text-center text-xl font-bold uppercase tracking-widest"
              placeholder="Escribe aquí"
              [disabled]="gameWon || currentAttempt >= maxAttempts"
            >
            <button
              (click)="submitGuess()"
              [disabled]="currentGuess.length !== 5 || gameWon || currentAttempt >= maxAttempts"
              class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Enviar
            </button>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div *ngIf="errorMessage" class="text-center text-red-600">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Resultado del juego -->
      <div *ngIf="gameWon || currentAttempt >= maxAttempts" class="text-center py-8">
        <h2 class="text-2xl font-bold mb-4" [class]="gameWon ? 'text-green-600' : 'text-red-600'">
          {{ gameWon ? '¡Felicidades! ¡Ganaste!' : '¡Game Over!' }}
        </h2>
        <p class="text-gray-600 mb-4">
          La palabra era: <span class="font-bold text-blue-600">{{ targetWord }}</span>
        </p>
        <p class="text-gray-600">
          Intentos: {{ currentAttempt }}/{{ maxAttempts }}
        </p>
      </div>
    </app-base-game>
  `,
  styles: []
})
export class WordleComponent extends BaseGameComponent implements OnInit {
  readonly maxAttempts = 6;
  private readonly wordLength = 5;

  board: string[][] = [];
  currentGuess: string = '';
  currentAttempt: number = 0;
  gameWon: boolean = false;
  errorMessage: string = '';
  targetWord: string = '';
  hasSavedProgress: boolean = false;

  // Lista de palabras de ejemplo (en un juego real, esto vendría de una API)
  private readonly wordList = [
    'CASA', 'PERRO', 'GATO', 'MESA', 'SILLA', 'LIBRO', 'LAPIZ', 'PUERTA', 'VENTANA', 'COCHE',
    'ARBOL', 'FLOR', 'SOL', 'LUNA', 'ESTRELLA', 'MAR', 'MONTAÑA', 'RIO', 'BOSQUE', 'CIUDAD'
  ];

  override ngOnInit(): void {
    super.ngOnInit();
    
    // Escuchar cuando se carga el progreso
    this.progressLoaded.subscribe((progress) => {
      if (progress) {
        this.restoreProgress(progress);
      }
    });
    
    this.initializeGame();
  }

  /**
   * Restaura el progreso guardado
   */
  private restoreProgress(progress: GameProgress): void {
    this.currentAttempt = progress.currentAttempt;
    this.gameWon = progress.gameWon;
    this.board = progress.attempts || [];
    this.hasSavedProgress = true;
    
    // Restaurar palabra objetivo si está guardada
    if (progress.gameData?.targetWord) {
      this.targetWord = progress.gameData.targetWord;
    }
    
    console.log('Progreso Wordle restaurado:', progress);
  }

  /**
   * Guarda el progreso actual
   */
  private saveCurrentProgress(): void {
    this.updateProgress({
      currentAttempt: this.currentAttempt,
      gameWon: this.gameWon,
      gameLost: this.currentAttempt >= this.maxAttempts,
      attempts: this.board,
      maxAttempts: this.maxAttempts,
      gameData: {
        targetWord: this.targetWord
      }
    });
  }

  /**
   * Inicializa el juego
   */
  private initializeGame(): void {
    // Si ya hay progreso guardado, no inicializar
    if (this.hasProgress()) {
      return;
    }

    // Si ya se jugó hoy, no inicializar
    if (this.isGamePlayedToday()) {
      return;
    }

    // Seleccionar palabra del día (basada en la fecha)
    this.targetWord = this.getWordOfTheDay();
    
    // Inicializar tablero
    this.board = Array(this.maxAttempts).fill(null).map(() => 
      Array(this.wordLength).fill('')
    );
    
    this.currentAttempt = 0;
    this.gameWon = false;
    this.errorMessage = '';
    this.hasSavedProgress = false;

    // Guardar progreso inicial
    this.saveCurrentProgress();
  }

  /**
   * Obtiene la palabra del día basada en la fecha
   */
  private getWordOfTheDay(): string {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return this.wordList[dayOfYear % this.wordList.length];
  }

  /**
   * Maneja el cambio en el input
   */
  onInputChange(event: any): void {
    this.currentGuess = event.target.value.toUpperCase();
    this.errorMessage = '';
  }

  /**
   * Envía el intento
   */
  submitGuess(): void {
    if (this.currentGuess.length !== this.wordLength) {
      this.errorMessage = 'La palabra debe tener 5 letras';
      return;
    }

    // Verificar si la palabra está en la lista (en un juego real, esto sería más robusto)
    if (!this.wordList.includes(this.currentGuess)) {
      this.errorMessage = 'Palabra no válida';
      return;
    }

    // Agregar la palabra al tablero
    this.board[this.currentAttempt] = this.currentGuess.split('');
    
    // Verificar si ganó
    if (this.currentGuess === this.targetWord) {
      this.gameWon = true;
      this.completeGame(true, this.currentAttempt + 1, { targetWord: this.targetWord });
    } else {
      this.currentAttempt++;
      
      // Verificar si perdió
      if (this.currentAttempt >= this.maxAttempts) {
        this.completeGame(false, this.maxAttempts, { targetWord: this.targetWord });
      } else {
        // Guardar progreso después de cada intento
        this.saveCurrentProgress();
      }
    }

    this.currentGuess = '';
  }

  /**
   * Obtiene la clase CSS para una celda del tablero
   */
  getCellClass(rowIndex: number, colIndex: number): string {
    if (rowIndex >= this.currentAttempt) {
      return 'border-gray-300 bg-white';
    }

    const letter = this.board[rowIndex][colIndex];
    const targetLetter = this.targetWord[colIndex];

    if (letter === targetLetter) {
      return 'border-green-500 bg-green-500 text-white';
    } else if (this.targetWord.includes(letter)) {
      return 'border-yellow-500 bg-yellow-500 text-white';
    } else {
      return 'border-gray-500 bg-gray-500 text-white';
    }
  }

  /**
   * Maneja la finalización del juego
   */
  onGameCompleted(result: {won: boolean, attempts: number, gameData?: any}): void {
    console.log('Wordle completado:', result);
  }

  /**
   * Continúa el juego guardado
   */
  continueGame(): void {
    this.hasSavedProgress = false;
  }
} 