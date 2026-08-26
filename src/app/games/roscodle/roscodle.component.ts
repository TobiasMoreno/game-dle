import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GameEditorialContentComponent } from '../../shared/components/game-editorial-content/game-editorial-content.component';
import { ADSENSE_CONFIG } from '../../shared/config/adsense.config';
import { ThemeService } from '../../shared/services/theme.service';
import { ROSCO_GENERAL_CATEGORIES, ROSCO_LEAGUES } from './roscodle-catalog';
import { ROSCO_QUESTIONS } from './roscodle.data';
import { RoscoEngineService } from './roscodle-engine.service';
import { RoscoCategory, RoscoLeague, RoscoLeagueOption, RoscoLetter, RoscoResult } from './roscodle.models';

@Component({
  selector: 'app-roscodle',
  imports: [CommonModule, FormsModule, AdSlotComponent, FooterComponent, GameEditorialContentComponent],
  templateUrl: './roscodle.component.html',
  styleUrl: './roscodle.component.css',
})
export class RoscodleComponent implements OnInit, OnDestroy {
  readonly roundSeconds = 240;
  readonly adSlots = ADSENSE_CONFIG.slots;
  readonly categories = ROSCO_GENERAL_CATEGORIES;
  readonly leagues = ROSCO_LEAGUES;

  private readonly engine = inject(RoscoEngineService);
  private readonly theme = inject(ThemeService);
  private timerId: ReturnType<typeof setInterval> | null = null;

  phase: 'setup' | 'playing' | 'finished' = 'setup';
  setupView: 'categories' | 'leagues' | 'league' = 'categories';
  selectedLeague: RoscoLeague | null = null;
  category: RoscoCategory = 'players';
  letters: RoscoLetter[] = [];
  currentIndex = 0;
  answer = '';
  secondsLeft = this.roundSeconds;
  result: RoscoResult = { correct: 0, wrong: 0, unanswered: 27 };
  feedback: 'correct' | 'wrong' | null = null;
  isTransitioning = false;
  isPaused = false;

  ngOnInit(): void {
    this.theme.setHeaderTheme('default');
    this.theme.setFooterTheme('default');
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  get current(): RoscoLetter | null {
    return this.letters[this.currentIndex] ?? null;
  }

  get score(): number {
    return this.letters.filter((letter) => letter.status === 'correct').length;
  }

  get errors(): number {
    return this.letters.filter((letter) => letter.status === 'wrong').length;
  }

  get progress(): number {
    return ((this.roundSeconds - this.secondsLeft) / this.roundSeconds) * 100;
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.secondsLeft / 60);
    return `${minutes}:${String(this.secondsLeft % 60).padStart(2, '0')}`;
  }

  get categoryLabel(): string {
    const option = [
      ...this.categories,
      ...this.leagues.flatMap((league) => league.categories),
    ].find((item) => item.id === this.category);
    return option?.title ?? 'RoscoDLE';
  }

  get currentLeague(): RoscoLeagueOption | null {
    return this.leagues.find((league) => league.id === this.selectedLeague) ?? null;
  }

  get activeLeague(): RoscoLeagueOption {
    return this.currentLeague ?? this.leagues[0];
  }

  get currentNumber(): string {
    return String(this.currentIndex + 1).padStart(2, '0');
  }

  startGame(category: RoscoCategory): void {
    this.stopTimer();
    this.category = category;
    this.letters = this.engine.createLetters(ROSCO_QUESTIONS[category]);
    this.currentIndex = 0;
    this.answer = '';
    this.feedback = null;
    this.isTransitioning = false;
    this.isPaused = false;
    this.secondsLeft = this.roundSeconds;
    this.phase = 'playing';
    this.startTimer();
  }

  openLeague(league: RoscoLeague): void {
    this.selectedLeague = league;
    this.setupView = 'league';
  }

  showLeagues(): void {
    this.selectedLeague = null;
    this.setupView = 'leagues';
  }

  submitAnswer(): void {
    if (this.phase !== 'playing' || this.isPaused || !this.current || !this.answer.trim() || this.isTransitioning) return;
    this.isTransitioning = true;
    const wasCorrect = this.engine.isCorrect(this.current, this.answer);
    this.current.status = wasCorrect ? 'correct' : 'wrong';
    this.feedback = wasCorrect ? 'correct' : 'wrong';
    this.answer = '';
    window.setTimeout(() => this.advance(), 240);
  }

  pass(): void {
    if (this.phase !== 'playing' || this.isPaused || !this.current || this.isTransitioning) return;
    this.stopTimer();
    this.isPaused = true;
    this.current.status = 'pending';
    this.feedback = null;
    this.answer = '';
    this.advance();
  }

  resume(): void {
    if (this.phase !== 'playing' || !this.isPaused) return;
    this.isPaused = false;
    this.startTimer();
  }

  playAgain(): void {
    this.startGame(this.category);
  }

  changeCategory(): void {
    this.stopTimer();
    this.phase = 'setup';
    this.isPaused = false;
    this.setupView = 'categories';
    this.selectedLeague = null;
    this.letters = [];
  }

  private advance(): void {
    if (this.phase !== 'playing') return;
    const nextIndex = this.engine.nextPendingIndex(this.letters, this.currentIndex);
    this.feedback = null;
    this.isTransitioning = false;
    if (nextIndex < 0) {
      this.finishGame();
      return;
    }
    this.currentIndex = nextIndex;
    this.letters[this.currentIndex].status = 'current';
  }

  private finishGame(): void {
    if (this.phase !== 'playing') return;
    this.stopTimer();
    this.isPaused = false;
    if (this.current?.status === 'current') this.current.status = 'pending';
    this.result = this.engine.result(this.letters);
    this.phase = 'finished';
  }

  private stopTimer(): void {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerId = setInterval(() => {
      this.secondsLeft -= 1;
      if (this.secondsLeft <= 0) this.finishGame();
    }, 1000);
  }
}
