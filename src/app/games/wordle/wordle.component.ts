import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { catchError, of } from 'rxjs';
import { buildKeyboardState, WordleLetterState } from './wordle-keyboard.utils';

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
  imports: [CommonModule, FormsModule, BaseGameComponent],
  templateUrl: './wordle.component.html',
  styleUrl: './wordle.component.css'
})
export class WordleComponent extends BaseGameComponent implements OnInit {
  readonly maxAttempts = 6;
  readonly keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];
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
  roundIsDailyChallenge: boolean = true;

  // Lista de palabras optimizada con IDs
  private wordList: WordleWord[] = [];
  private wordMap: Map<string, WordleWord> = new Map();

  private http = inject(HttpClient);

  constructor() {
    super();
  }

  ngOnInit(): void {
    // Escuchar cuando se carga el progreso
    this.progressLoaded.subscribe((progress) => {
      if (progress) {
        this.restoreProgress(progress);
      }
    });

    this.setGameId(this.gameId);
    // Cargar palabras desde el JSON
    this.loadWordsFromJson();
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
            { id: 1, word: 'NUBES', length: 5 },
            { id: 2, word: 'PERRO', length: 5 },
            { id: 3, word: 'TIGRE', length: 5 },
            { id: 4, word: 'LLAVE', length: 5 },
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
          this.resetInvalidSavedProgress();
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
    this.roundIsDailyChallenge = progress.gameData?.roundIsDailyChallenge ?? !this.isGamePlayedToday();
    
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
        targetWord: this.targetWord,
        roundIsDailyChallenge: this.roundIsDailyChallenge,
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

    // Inicializar tablero
    this.board = Array(this.maxAttempts).fill(null).map(() => 
      Array(this.wordLength).fill('')
    );
    
    this.currentAttempt = 0;
    this.gameWon = false;
    this.errorMessage = '';
    this.hasSavedProgress = false;
    this.roundIsDailyChallenge = !this.isGamePlayedToday();

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
    const normalizedGuess = event.target.value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    const allowedGuess = [...normalizedGuess]
      .filter((letter) => !this.isLetterDisabled(letter))
      .join('')
      .slice(0, this.wordLength);

    this.currentGuess = allowedGuess;
    event.target.value = allowedGuess;
    this.errorMessage = allowedGuess === normalizedGuess
      ? ''
      : 'Esa letra ya fue descartada.';
  }

  onPhysicalKeyDown(event: KeyboardEvent): void {
    const letter = event.key.toUpperCase();
    if (letter.length === 1 && this.isLetterDisabled(letter)) {
      event.preventDefault();
      this.errorMessage = `La letra ${letter} ya fue descartada.`;
    }
  }

  pressKeyboardKey(key: string): void {
    if (key === 'ENTER') {
      this.submitGuess();
      return;
    }
    if (key === 'BACKSPACE') {
      this.currentGuess = this.currentGuess.slice(0, -1);
      this.errorMessage = '';
      return;
    }
    if (this.currentGuess.length < this.wordLength && !this.isLetterDisabled(key)) {
      this.currentGuess += key;
      this.errorMessage = '';
    }
  }

  getLetterState(letter: string): WordleLetterState | null {
    return buildKeyboardState(this.board, this.targetWord, this.currentAttempt)[letter] ?? null;
  }

  isLetterDisabled(letter: string): boolean {
    return this.getLetterState(letter) === 'absent';
  }

  getKeyboardKeyLabel(key: string): string {
    if (key === 'ENTER') return 'Comprobar palabra';
    if (key === 'BACKSPACE') return 'Borrar letra';
    return `Letra ${key}`;
  }

  /**
   * Descarta progresos creados con un diccionario anterior o incompleto.
   */
  private resetInvalidSavedProgress(): void {
    if (!this.currentProgress) {
      return;
    }

    if (!this.targetWord || !this.wordMap.has(this.targetWord)) {
      this.clearProgress();
      this.hasSavedProgress = false;
      this.currentAttempt = 0;
      this.gameWon = false;
      this.board = [];
      this.targetWord = '';
    }
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
      this.currentAttempt++;
      this.gameWon = true;
      this.finishGame(true);
    } else {
      this.currentAttempt++;
      
      // Verificar si perdió
      if (this.currentAttempt >= this.maxAttempts) {
        this.finishGame(false);
      } else {
        // Guardar progreso después de cada intento
        this.saveCurrentProgress();
      }
    }

    this.currentGuess = '';
  }

  private finishGame(won: boolean): void {
    this.clearProgress();
    this.completeGame(won, this.currentAttempt, { targetWord: this.targetWord });
  }

  playAgain(): void {
    this.clearProgress();
    this.currentAttempt = 0;
    this.currentGuess = '';
    this.gameWon = false;
    this.hasSavedProgress = false;
    this.targetWord = '';
    this.board = [];
    this.initializeGame();
  }

  /**
   * Obtiene la clase CSS para una celda del tablero
   */
  getCellClass(rowIndex: number, colIndex: number): string {
    if (rowIndex >= this.currentAttempt) {
      return rowIndex === this.currentAttempt ? 'wordle-cell--active' : 'wordle-cell--empty';
    }

    const letter = this.board[rowIndex][colIndex];
    const targetLetter = this.targetWord[colIndex];

    if (letter === targetLetter) {
      return 'wordle-cell--correct';
    } else if (this.targetWord.includes(letter)) {
      return 'wordle-cell--present';
    } else {
      return 'wordle-cell--absent';
    }
  }

  getCellLetter(rowIndex: number, colIndex: number): string {
    if (rowIndex === this.currentAttempt) {
      return this.currentGuess[colIndex] || '';
    }

    return this.board[rowIndex]?.[colIndex] || '';
  }

  get attemptProgress(): number {
    return (this.currentAttempt / this.maxAttempts) * 100;
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
