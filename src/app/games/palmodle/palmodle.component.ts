import { Component, OnInit, inject } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { ThemeService } from '../../shared/services/theme.service';
import { PalmodleEngineService } from './palmodle-engine.service';
import { PalmodleGameState, PalmodlePerson } from './palmodle.models';
import { PalmodleStorageService } from './palmodle-storage.service';

@Component({
  selector: 'app-palmodle',
  imports: [FooterComponent],
  templateUrl: './palmodle.component.html',
  styleUrl: './palmodle.component.css',
})
export class PalmodleComponent implements OnInit {
  readonly totalRounds = 10;
  readonly maxLives = 3;
  private readonly engine = inject(PalmodleEngineService);
  private readonly storage = inject(PalmodleStorageService);
  private readonly gameManager = inject(GameManagerService);
  private readonly theme = inject(ThemeService);

  state!: PalmodleGameState;
  shareMessage = '';

  ngOnInit(): void {
    this.theme.setHeaderTheme('default');
    this.theme.setFooterTheme('default');
    this.state = this.storage.load() ?? this.initialState(1, 0);
  }

  get pair() { return this.engine.createPair(this.state.seed, this.state.round); }
  get correctPerson() { return this.engine.firstToDie(this.pair); }
  get latestAnswer() { return this.state.answers.at(-1) ?? null; }
  get yearsApart() { return this.engine.yearsApart(this.pair); }
  get gapLabel(): string {
    return this.yearsApart === 0
      ? 'menos de un año'
      : `${this.yearsApart} ${this.yearsApart === 1 ? 'año' : 'años'}`;
  }
  get progress(): number { return ((this.state.round + (this.state.status === 'finished' ? 1 : 0)) / this.totalRounds) * 100; }

  choose(person: PalmodlePerson): void {
    if (this.state.status !== 'playing') return;
    const correctPerson = this.correctPerson;
    const correct = this.engine.isCorrect(this.pair, person.id);
    const lives = this.state.lives - (correct ? 0 : 1);
    const score = this.state.score + (correct ? 1 : 0);
    const answer = {
      round: this.state.round,
      leftId: this.pair.left.id,
      rightId: this.pair.right.id,
      selectedId: person.id,
      correctId: correctPerson.id,
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
      this.gameManager.completeGame('palmodle', score >= 7, this.state.answers.length, {
        score,
        maxAttempts: this.totalRounds,
      });
    }
  }

  next(): void {
    if (this.state.status !== 'revealed') return;
    this.state = { ...this.state, round: this.state.round + 1, status: 'playing' };
    this.shareMessage = '';
    this.storage.save(this.state);
  }

  playAgain(): void {
    this.state = this.initialState(this.state.run + 1, this.state.bestScore);
    this.shareMessage = '';
    this.storage.save(this.state);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isSelected(person: PalmodlePerson): boolean {
    return this.latestAnswer?.round === this.state.round && this.latestAnswer.selectedId === person.id;
  }

  isCorrectPerson(person: PalmodlePerson): boolean {
    return this.state.status !== 'playing' && this.correctPerson.id === person.id;
  }

  async share(): Promise<void> {
    const text = this.engine.buildShareText(this.state.score, this.state.answers);
    try {
      if (navigator.share) await navigator.share({ title: 'Palmó Primero', text });
      else await navigator.clipboard.writeText(text);
      this.shareMessage = 'Resultado listo para compartir.';
    } catch {
      this.shareMessage = 'No se pudo compartir el resultado.';
    }
  }

  private initialState(run: number, bestScore: number): PalmodleGameState {
    const state: PalmodleGameState = {
      version: 2,
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
