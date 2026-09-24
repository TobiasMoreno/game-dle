import { Component, OnInit, inject } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GameEditorialContentComponent } from '../../shared/components/game-editorial-content/game-editorial-content.component';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { ThemeService } from '../../shared/services/theme.service';
import { FutbolMayorEngineService } from './futbol-mayor-engine.service';
import {
  FutbolMayorCompetitor,
  FutbolMayorGameState,
} from './futbol-mayor.models';
import { FutbolMayorStorageService } from './futbol-mayor-storage.service';

@Component({
  selector: 'app-futbol-mayor',
  imports: [FooterComponent, GameEditorialContentComponent],
  templateUrl: './futbol-mayor.component.html',
  styleUrl: './futbol-mayor.component.css',
})
export class FutbolMayorComponent implements OnInit {
  readonly totalRounds = 10;
  readonly maxLives = 3;
  private readonly engine = inject(FutbolMayorEngineService);
  private readonly storage = inject(FutbolMayorStorageService);
  private readonly gameManager = inject(GameManagerService);
  private readonly theme = inject(ThemeService);

  state!: FutbolMayorGameState;
  shareMessage = '';

  ngOnInit(): void {
    this.theme.setHeaderTheme('default');
    this.theme.setFooterTheme('default');
    this.state = this.storage.load() ?? this.initialState(1, 0);
  }

  get comparison() {
    return this.engine.comparison(this.state.seed, this.state.round);
  }
  get competitors() {
    return [this.comparison.left, this.comparison.right] as const;
  }
  get winner() {
    return this.engine.winner(this.comparison);
  }
  get latestAnswer() {
    return this.state.answers.at(-1) ?? null;
  }
  get gap() {
    return this.engine.gap(this.comparison);
  }
  get progress(): number {
    return (
      ((this.state.round + (this.state.status === 'finished' ? 1 : 0)) /
        this.totalRounds) *
      100
    );
  }
  get maxValue(): number {
    return Math.max(this.comparison.left.value, this.comparison.right.value);
  }

  choose(competitor: FutbolMayorCompetitor): void {
    if (this.state.status !== 'playing') return;
    const correct = this.engine.isCorrect(this.comparison, competitor.id);
    const lives = this.state.lives - (correct ? 0 : 1);
    const score = this.state.score + (correct ? 1 : 0);
    const answer = {
      round: this.state.round,
      comparisonId: this.comparison.id,
      selectedId: competitor.id,
      correctId: this.winner.id,
      correct,
    };
    const finished = lives === 0 || this.state.round === this.totalRounds - 1;
    this.state = {
      ...this.state,
      lives,
      score,
      bestScore: Math.max(this.state.bestScore, score),
      status: finished ? 'finished' : 'revealed',
      answers: [...this.state.answers, answer],
    };
    this.storage.save(this.state);

    if (finished) {
      this.gameManager.completeGame(
        'futbol-mayor',
        score >= 7,
        this.state.answers.length,
        {
          score,
          maxAttempts: this.totalRounds,
        },
      );
    }
  }

  next(): void {
    if (this.state.status !== 'revealed') return;
    this.state = {
      ...this.state,
      round: this.state.round + 1,
      status: 'playing',
    };
    this.shareMessage = '';
    this.storage.save(this.state);
  }

  playAgain(): void {
    this.state = this.initialState(this.state.run + 1, this.state.bestScore);
    this.shareMessage = '';
    globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  isSelected(competitor: FutbolMayorCompetitor): boolean {
    return (
      this.latestAnswer?.round === this.state.round &&
      this.latestAnswer.selectedId === competitor.id
    );
  }

  isWinner(competitor: FutbolMayorCompetitor): boolean {
    return this.state.status !== 'playing' && this.winner.id === competitor.id;
  }

  valueWidth(competitor: FutbolMayorCompetitor): number {
    return Math.max(8, (competitor.value / this.maxValue) * 100);
  }

  async share(): Promise<void> {
    const text = this.engine.buildShareText(
      this.state.score,
      this.state.answers,
    );
    try {
      if (navigator.share)
        await navigator.share({ title: '¿Quién tiene más?', text });
      else await navigator.clipboard.writeText(text);
      this.shareMessage = 'Resultado listo para compartir.';
    } catch {
      this.shareMessage = 'No se pudo compartir el resultado.';
    }
  }

  private initialState(run: number, bestScore: number): FutbolMayorGameState {
    const state: FutbolMayorGameState = {
      version: 1,
      run,
      seed: this.engine.createSeed(),
      round: 0,
      lives: this.maxLives,
      score: 0,
      bestScore,
      status: 'playing',
      answers: [],
    };
    this.storage.save(state);
    return state;
  }
}
