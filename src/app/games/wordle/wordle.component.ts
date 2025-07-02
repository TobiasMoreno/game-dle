import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { GameStorageService } from '../../shared/services/game-storage.service';
import { catchError, of } from 'rxjs';

interface WordleWord {
  id: number;
  word: string;
  length: number;
}

/**
 * Componente del juego Wordle
 * Implementa la lógica del juego de adivinar palabras
 */
@Component({
  selector: 'app-wordle',
  standalone: true,
  imports: [FormsModule, BaseGameComponent],
  templateUrl: './wordle.component.html',
  styles: []
})
export class WordleComponent extends BaseGameComponent implements OnInit {
  readonly maxAttempts = 6;
  private readonly wordLength = 5;
  private readonly gameId = 'wordle';

  board: string[][] = [];
  currentGuess: string = '';
  currentAttempt: number = 0;
  gameWon: boolean = false;
  errorMessage: string = '';
  targetWord: string = '';
  hasSavedProgress: boolean = false;
  isLoading: boolean = false;

  // Lista de palabras optimizada con IDs
  private wordList: WordleWord[] = [];
  private wordMap: Map<string, WordleWord> = new Map();

  private http = inject(HttpClient);

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.setGameId(this.gameId);
    // Cargar palabras desde el JSON
    this.loadWordsFromJson();
    
    // Escuchar cuando se carga el progreso
    this.progressLoaded.subscribe((progress) => {
      if (progress) {
        this.restoreProgress(progress);
      }
    });
  }

  /**
   * Carga las palabras desde el archivo JSON
   */
  private loadWordsFromJson(): void {
    this.isLoading = true;
    
    this.http.get<WordleWord[]>('/palabras_wordle.json')
      .pipe(
        catchError(error => {
          console.error('Error al cargar palabras desde JSON:', error);
          // Fallback a palabras básicas si falla la carga
          const fallbackWords: WordleWord[] = [
            { id: 1, word: 'CASA', length: 5 },
            { id: 2, word: 'PERRO', length: 5 },
            { id: 3, word: 'GATO', length: 5 },
            { id: 4, word: 'MESA', length: 5 },
            { id: 5, word: 'SILLA', length: 5 }
          ];
          this.wordList = fallbackWords;
          this.buildWordMap();
          this.isLoading = false;
          this.initializeGame();
          return of([]);
        })
      )
      .subscribe(words => {
        if (words && words.length > 0) {
          this.wordList = words;
          this.buildWordMap();
          console.log(`Cargadas ${words.length} palabras desde JSON`);
        }
        this.isLoading = false;
        this.initializeGame();
      });
  }

  /**
   * Construye el mapa de palabras para búsqueda eficiente
   */
  private buildWordMap(): void {
    this.wordMap.clear();
    this.wordList.forEach(wordObj => {
      this.wordMap.set(wordObj.word, wordObj);
    });
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

    // Inicializar tablero
    this.board = Array(this.maxAttempts).fill(null).map(() => 
      Array(this.wordLength).fill('')
    );
    
    this.currentAttempt = 0;
    this.gameWon = false;
    this.errorMessage = '';
    this.hasSavedProgress = false;

    // Obtener palabra del día desde la API
    this.getWordOfTheDay();
  }

  /**
   * Obtiene la palabra del día desde la lista local
   */
  private getWordOfTheDay(): void {
    if (this.wordList.length === 0) {
      console.error('No hay palabras disponibles');
      return;
    }
    
    // Usar la fecha para seleccionar una palabra consistente por día
    const wordIndex = Math.floor(Math.random() * this.wordList.length);

    this.targetWord = this.wordList[wordIndex].word;
    console.log('Palabra del día seleccionada:', this.targetWord);
    this.saveCurrentProgress();
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

    // Verificar si la palabra está en la lista usando el mapa para búsqueda eficiente
    if (!this.wordMap.has(this.currentGuess)) {
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