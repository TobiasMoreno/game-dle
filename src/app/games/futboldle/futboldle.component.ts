import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { FootballerEntry } from './futboldle.data';
import {
  FUTBOLDLE_WORD_LENGTHS,
  FutboldleEngineService,
  FutboldleWordLength,
  LetterResult,
  LetterState
} from './futboldle-engine.service';
import { AppStorageService } from '../../shared/services/app-storage.service';
import { ShareService } from '../../shared/services/share.service';

type GameMode = 'normal' | 'easy';
type LengthPreference = FutboldleWordLength | 'random';

@Component({
  selector: 'app-futboldle',
  standalone: true,
  imports: [CommonModule, BaseGameComponent],
  templateUrl: './futboldle.component.html',
  styleUrl: './futboldle.component.css'
})
export class FutboldleComponent extends BaseGameComponent implements OnInit {
  readonly maxAttempts = 6;
  readonly keyboardRows = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  readonly statePriority: Record<LetterState, number> = { absent: 1, present: 2, correct: 3 };
  readonly wordLengthOptions = FUTBOLDLE_WORD_LENGTHS;
  readonly selectedPlayerStorageKey = 'game-dle-futboldle-selected-player';

  private readonly engine = inject(FutboldleEngineService);
  private readonly storage = inject(AppStorageService);
  private readonly shareService = inject(ShareService);
  target!: FootballerEntry;
  guesses: string[] = [];
  currentGuess = '';
  mode: GameMode = 'normal';
  lengthPreference: LengthPreference = 'random';
  errorMessage = '';
  won = false;
  finished = false;
  copied = false;
  showHelp = false;

  ngOnInit(): void {
    this.progressLoaded.subscribe(progress => this.restoreProgress(progress));
    this.target = this.createTarget();
    this.setGameId('futboldle');
    this.persistSelectedPlayer();
    this.saveGameProgress();
  }

  get wordLength(): number { return this.target.answer.length; }
  get remainingRows(): number[] { return Array.from({ length: this.maxAttempts - this.guesses.length }); }
  get currentLetters(): string[] { return Array.from({ length: this.wordLength }, (_, index) => this.currentGuess[index] ?? ''); }

  @HostListener('window:keydown', ['$event'])
  onPhysicalKey(event: KeyboardEvent): void {
    if (this.showHelp || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Enter') {
      if (this.finished) {
        if (!event.repeat) this.playAgain();
      } else {
        this.submitGuess();
      }
      return;
    }
    if (this.finished) return;
    if (event.key === 'Backspace') this.removeLetter();
    else if (/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]$/.test(event.key)) this.addLetter(event.key);
  }

  addLetter(letter: string): void {
    if (this.finished || this.currentGuess.length >= this.wordLength) return;
    this.currentGuess += this.engine.normalize(letter);
    this.errorMessage = '';
  }

  removeLetter(): void {
    this.currentGuess = this.currentGuess.slice(0, -1);
    this.errorMessage = '';
  }

  submitGuess(): void {
    if (this.finished) return;
    if (this.currentGuess.length !== this.wordLength) {
      this.errorMessage = `Necesitás ${this.wordLength} letras`;
      return;
    }
    if (this.mode === 'normal' && !this.engine.isKnownName(this.currentGuess)) {
      this.errorMessage = 'Ese apellido no está en la convocatoria';
      return;
    }

    this.guesses = [...this.guesses, this.currentGuess];
    this.won = this.currentGuess === this.target.answer;
    this.currentGuess = '';
    this.finished = this.won || this.guesses.length >= this.maxAttempts;

    if (this.finished) {
      this.clearProgress();
      this.completeGame(this.won, this.guesses.length, {
        guesses: this.guesses,
        answer: this.target.answer,
        player: this.target.player,
        maxAttempts: this.maxAttempts
      });
    } else {
      this.saveGameProgress();
    }
  }

  setMode(mode: GameMode): void {
    if (this.guesses.length > 0 || this.finished) return;
    this.mode = mode;
    this.saveGameProgress();
  }

  setLengthPreference(preference: LengthPreference): void {
    if (this.guesses.length > 0 || this.finished || this.lengthPreference === preference) return;
    this.lengthPreference = preference;
    this.target = this.createTarget();
    this.currentGuess = '';
    this.errorMessage = '';
    this.persistSelectedPlayer();
    this.saveGameProgress();
  }

  getEvaluation(guess: string): LetterResult[] { return this.engine.evaluate(guess, this.target.answer); }

  getKeyState(letter: string): LetterState | '' {
    let best: LetterState | '' = '';
    for (const guess of this.guesses) {
      for (const result of this.getEvaluation(guess)) {
        if (result.letter === letter && (!best || this.statePriority[result.state] > this.statePriority[best])) best = result.state;
      }
    }
    return best;
  }

  async shareResult(): Promise<void> {
    const squares = this.guesses.map(guess => this.getEvaluation(guess).map(({ state }) =>
      state === 'correct' ? '🟩' : state === 'present' ? '🟨' : '⬛'
    ).join('')).join('\n');
    const score = this.won ? this.guesses.length : 'X';
    const text = `FutbolDLE ⚽ ${score}/${this.maxAttempts}\n${squares}`;
    const outcome = await this.shareService.share({ title: 'FutbolDLE', text, path: '/games/futboldle' });
    this.copied = outcome === 'copied' || outcome === 'shared';
    if (this.copied) window.setTimeout(() => this.copied = false, 1800);
    if (outcome === 'failed') this.errorMessage = 'No pudimos compartir el resultado';
  }

  playAgain(): void {
    const previousAnswer = this.target.answer;
    this.clearProgress();
    this.target = this.createTarget(previousAnswer);
    this.guesses = [];
    this.currentGuess = '';
    this.errorMessage = '';
    this.won = false;
    this.finished = false;
    this.copied = false;
    this.persistSelectedPlayer();
    this.saveGameProgress();
  }

  private restoreProgress(progress: GameProgress | null): void {
    if (!progress) return;
    const savedTarget = typeof progress.gameData?.answer === 'string'
      ? this.engine.getPlayerByAnswer(progress.gameData.answer)
      : undefined;
    if (!savedTarget) {
      this.clearProgress();
      return;
    }
    this.target = savedTarget;
    this.guesses = progress.attempts ?? [];
    this.mode = progress.gameData?.mode === 'easy' ? 'easy' : 'normal';
    const savedLength = progress.gameData?.lengthPreference;
    this.lengthPreference = savedLength === 5 || savedLength === 6 || savedLength === 7 ? savedLength : 'random';
  }

  private saveGameProgress(): void {
    this.updateProgress({
      currentAttempt: this.guesses.length,
      maxAttempts: this.maxAttempts,
      gameWon: false,
      gameLost: false,
      attempts: this.guesses,
      gameData: { answer: this.target.answer, mode: this.mode, lengthPreference: this.lengthPreference }
    });
  }

  private createTarget(excludedAnswer?: string): FootballerEntry {
    const length = this.lengthPreference === 'random'
      ? this.engine.getRandomWordLength()
      : this.lengthPreference;
    return this.engine.getRandomPlayerByLength(length, excludedAnswer);
  }

  private persistSelectedPlayer(): void {
    try {
      this.storage.setItem(this.selectedPlayerStorageKey, JSON.stringify(this.target));
    } catch (error) {
      console.error('No se pudo guardar el futbolista seleccionado:', error);
    }
  }
}
