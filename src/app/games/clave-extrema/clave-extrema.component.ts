import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { argentinaDateKey } from '../../shared/utils/daily-activity.utils';
import {
  calculateExtremeScore,
  ClaveFeedback,
  dailyWordIndex,
  ManualLetterMark,
  nextManualMark,
  scoreExtremeGuess,
} from './clave-extrema.utils';

interface WordEntry { id: number; word: string; length: number; }
interface ClaveAttempt { word: string; feedback: ClaveFeedback; marks?: ManualLetterMark[]; }

@Component({
  selector: 'app-clave-extrema',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseGameComponent],
  templateUrl: './clave-extrema.component.html',
  styleUrl: './clave-extrema.component.css',
})
export class ClaveExtremaComponent extends BaseGameComponent implements OnInit, OnDestroy {
  readonly maxAttempts = 8;
  readonly rows = Array.from({ length: this.maxAttempts });
  readonly slots = Array.from({ length: 5 });
  readonly keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
  ];

  attempts: ClaveAttempt[] = [];
  currentGuess = '';
  targetWord = '';
  errorMessage = '';
  isLoading = true;
  hasSavedProgress = false;
  gameWon = false;
  roundIsDailyChallenge = true;
  elapsedSeconds = 0;
  score = 0;

  private readonly gameId = 'clave-extrema';
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private words: WordEntry[] = [];
  private wordMap = new Map<string, WordEntry>();
  private startedAt = Date.now();
  private timerId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.progressLoaded.subscribe((progress) => progress && this.restoreProgress(progress));
    this.setGameId(this.gameId);
    if (this.isBrowser) this.loadWords();
  }

  ngOnDestroy(): void { this.stopTimer(); }

  private loadWords(): void {
    this.http.get<WordEntry[]>('/palabras_wordle.json').pipe(
      catchError(() => of([
        { id: 1, word: 'NUBES', length: 5 },
        { id: 2, word: 'PERRO', length: 5 },
        { id: 3, word: 'TIGRE', length: 5 },
        { id: 4, word: 'LLAVE', length: 5 },
      ])),
    ).subscribe((words) => {
      this.words = words.filter(({ word, length }) => length === 5 && /^[A-ZÑ]{5}$/.test(word));
      this.wordMap = new Map(this.words.map((entry) => [entry.word, entry]));
      this.resetInvalidProgress();
      if (!this.targetWord) this.createRound();
      else if (!this.hasSavedProgress && !this.finished) this.startTimer();
      this.isLoading = false;
    });
  }

  private createRound(): void {
    if (!this.words.length) return;
    this.roundIsDailyChallenge = !this.isGamePlayedToday();
    const index = this.roundIsDailyChallenge
      ? dailyWordIndex(argentinaDateKey(), this.words.length)
      : Math.floor(Math.random() * this.words.length);
    this.targetWord = this.words[index].word;
    this.startedAt = Date.now();
    this.startTimer();
    this.saveRoundProgress();
  }

  private restoreProgress(progress: GameProgress): void {
    this.attempts = Array.isArray(progress.attempts) ? progress.attempts : [];
    this.gameWon = progress.gameWon;
    this.targetWord = progress.gameData?.targetWord ?? '';
    this.roundIsDailyChallenge = progress.gameData?.roundIsDailyChallenge ?? !this.isGamePlayedToday();
    this.startedAt = progress.gameData?.startedAt ?? Date.now();
    this.elapsedSeconds = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
    this.hasSavedProgress = this.attempts.length > 0;
  }

  private resetInvalidProgress(): void {
    if (!this.currentProgress || (this.targetWord && this.wordMap.has(this.targetWord))) return;
    this.clearProgress();
    this.attempts = [];
    this.targetWord = '';
    this.hasSavedProgress = false;
  }

  continueGame(): void {
    this.hasSavedProgress = false;
    this.startTimer();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentGuess = this.normalize(input.value).slice(0, 5);
    input.value = this.currentGuess;
    this.errorMessage = '';
  }

  onPhysicalKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submitGuess();
    }
  }

  pressKey(key: string): void {
    if (key === 'ENTER') return this.submitGuess();
    if (key === 'BACKSPACE') {
      this.currentGuess = this.currentGuess.slice(0, -1);
    } else if (this.currentGuess.length < 5) {
      this.currentGuess += key;
    }
    this.errorMessage = '';
  }

  submitGuess(): void {
    if (this.currentGuess.length !== 5) {
      this.errorMessage = 'Completá las cinco letras.';
      return;
    }
    if (!this.wordMap.has(this.currentGuess)) {
      this.errorMessage = 'Esa palabra no está en el diccionario.';
      return;
    }

    const feedback = scoreExtremeGuess(this.currentGuess, this.targetWord);
    this.attempts = [...this.attempts, { word: this.currentGuess, feedback, marks: Array(5).fill(null) }];
    this.currentGuess = '';
    this.errorMessage = '';

    if (feedback.exact === 5) {
      this.finishGame(true);
    } else if (this.attempts.length >= this.maxAttempts) {
      this.finishGame(false);
    } else {
      this.saveRoundProgress();
    }
  }

  playAgain(): void {
    this.clearProgress();
    this.stopTimer();
    this.attempts = [];
    this.currentGuess = '';
    this.targetWord = '';
    this.errorMessage = '';
    this.gameWon = false;
    this.score = 0;
    this.elapsedSeconds = 0;
    this.hasSavedProgress = false;
    this.createRound();
  }

  getAttempt(rowIndex: number): ClaveAttempt | null { return this.attempts[rowIndex] ?? null; }
  getLetterMark(rowIndex: number, columnIndex: number): ManualLetterMark {
    return this.attempts[rowIndex]?.marks?.[columnIndex] ?? null;
  }
  getLetterMarkLabel(rowIndex: number, columnIndex: number): string {
    const letter = this.getCellLetter(rowIndex, columnIndex);
    const mark = this.getLetterMark(rowIndex, columnIndex);
    const current = mark === 'green' ? 'verde' : mark === 'orange' ? 'naranja' : mark === 'red' ? 'rojo' : 'sin marca';
    const next = nextManualMark(mark);
    const nextLabel = next === 'green' ? 'verde' : next === 'orange' ? 'naranja' : next === 'red' ? 'rojo' : 'sin marca';
    return `Letra ${letter}, ${current}. Cambiar a ${nextLabel}`;
  }
  cycleLetterMark(rowIndex: number, columnIndex: number): void {
    if (!this.attempts[rowIndex]) return;
    this.attempts = this.attempts.map((attempt, index) => {
      if (index !== rowIndex) return attempt;
      const marks = attempt.marks?.slice() ?? Array<ManualLetterMark>(5).fill(null);
      marks[columnIndex] = nextManualMark(marks[columnIndex] ?? null);
      return { ...attempt, marks };
    });
    this.saveRoundProgress();
  }
  getCellLetter(rowIndex: number, columnIndex: number): string {
    return this.attempts[rowIndex]?.word[columnIndex]
      ?? (rowIndex === this.attempts.length ? this.currentGuess[columnIndex] : '')
      ?? '';
  }
  get rowProgress(): number { return (this.attempts.length / this.maxAttempts) * 100; }
  get finished(): boolean { return this.gameWon || this.attempts.length >= this.maxAttempts; }

  private finishGame(won: boolean): void {
    this.gameWon = won;
    this.elapsedSeconds = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
    this.score = won ? calculateExtremeScore(this.attempts.length, this.elapsedSeconds) : 0;
    this.stopTimer();
    this.clearProgress();
    this.completeGame(won, this.attempts.length, {
      targetWord: this.targetWord,
      score: this.score,
      elapsedSeconds: this.elapsedSeconds,
      maxAttempts: this.maxAttempts,
    });
  }

  private saveRoundProgress(): void {
    this.updateProgress({
      currentAttempt: this.attempts.length,
      maxAttempts: this.maxAttempts,
      gameWon: this.gameWon,
      gameLost: this.attempts.length >= this.maxAttempts,
      attempts: this.attempts,
      gameData: { targetWord: this.targetWord, startedAt: this.startedAt, roundIsDailyChallenge: this.roundIsDailyChallenge },
    });
  }

  private startTimer(): void {
    if (!this.isBrowser || this.timerId || this.finished || this.hasSavedProgress) return;
    this.elapsedSeconds = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
    this.timerId = setInterval(() => {
      this.elapsedSeconds = Math.max(0, Math.floor((Date.now() - this.startedAt) / 1000));
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = undefined;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-ZÑ]/g, '');
  }
}
