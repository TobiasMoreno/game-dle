import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdSlotComponent } from '../../shared/components/ad-slot/ad-slot.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { ADSENSE_CONFIG } from '../../shared/config/adsense.config';
import { GameProgress } from '../../shared/models/game.model';
import { GameStorageService } from '../../shared/services/game-storage.service';
import { ThemeService } from '../../shared/services/theme.service';
import { GeodleEngineService } from './geodle-engine.service';
import {
  GeodleCatalog,
  GeodleCountry,
  GeodleGuessResult,
  GeodleMatchStatus,
} from './geodle.models';

@Component({
  selector: 'app-geodle',
  imports: [FormsModule, AdSlotComponent, FooterComponent],
  templateUrl: './geodle.component.html',
  styleUrl: './geodle.component.css',
})
export class GeodleComponent implements OnInit {
  readonly adSlots = ADSENSE_CONFIG.slots;
  readonly maxAttempts = 6;

  private readonly http = inject(HttpClient);
  private readonly engine = inject(GeodleEngineService);
  private readonly storage = inject(GameStorageService);
  private readonly theme = inject(ThemeService);

  countries: GeodleCountry[] = [];
  suggestions: GeodleCountry[] = [];
  target: GeodleCountry | null = null;
  guesses: GeodleGuessResult[] = [];
  query = '';
  errorMessage = '';
  shareMessage = '';
  loading = true;
  inputFocused = false;
  won = false;
  finished = false;

  ngOnInit(): void {
    this.theme.setHeaderTheme('geodle');
    this.theme.setFooterTheme('geodle');
    this.http.get<GeodleCatalog>('geodle-countries.json').subscribe({
      next: (catalog) => this.initializeCatalog(catalog),
      error: () => {
        this.loading = false;
        this.errorMessage = 'No pudimos abrir el atlas. Recargá la página para intentarlo otra vez.';
      },
    });
  }

  get attemptsUsed(): number {
    return this.guesses.length;
  }

  get targetSubtitle(): string {
    if (!this.target) return '';
    return `${this.target.capital} · ${this.target.continent} · ${this.target.subregion}`;
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.errorMessage = '';
    this.suggestions = this.engine.filterCountries(
      this.countries,
      value,
      this.guesses.map(({ code }) => code)
    );
  }

  selectCountry(country: GeodleCountry): void {
    this.query = country.name;
    this.suggestions = [];
    this.inputFocused = false;
  }

  submitGuess(): void {
    if (this.finished || !this.target) return;
    const country = this.engine.findCountry(this.countries, this.query);
    if (!country) {
      this.errorMessage = 'Elegí un país de la lista para registrar el intento.';
      return;
    }
    if (this.guesses.some(({ code }) => code === country.code)) {
      this.errorMessage = 'Ese país ya figura en tu cuaderno de viaje.';
      return;
    }

    const result = this.engine.compare(country, this.target);
    this.guesses = [...this.guesses, result];
    this.query = '';
    this.suggestions = [];
    this.won = country.code === this.target.code;
    this.finished = this.won || this.guesses.length >= this.maxAttempts;
    this.saveProgress();
  }

  cellClass(status: GeodleMatchStatus): string {
    return `match-${status}`;
  }

  statusLabel(status: GeodleMatchStatus): string {
    return { correct: 'Coincide', partial: 'Cerca o parcial', wrong: 'No coincide' }[status];
  }

  async share(): Promise<void> {
    const score = this.won ? `${this.guesses.length}/${this.maxAttempts}` : `X/${this.maxAttempts}`;
    const rows = this.guesses.map((guess) => [
      guess.continent,
      guess.subregion,
      guess.hemisphere,
      guess.languages,
      guess.area,
      guess.population,
      guess.borders,
    ].map(({ status }) => ({ correct: '🟩', partial: '🟨', wrong: '⬛' })[status]).join(''));
    const text = `GeoDLE · ${score}\n${rows.join('\n')}\n${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: 'GeoDLE', text });
      else await navigator.clipboard.writeText(text);
      this.shareMessage = 'Resultado listo para compartir.';
    } catch {
      this.shareMessage = 'No se pudo compartir el resultado.';
    }
  }

  hideSuggestionsSoon(): void {
    window.setTimeout(() => { this.inputFocused = false; }, 120);
  }

  nextRound(): void {
    const previousTargetCode = this.target?.code;
    this.storage.clearGameProgress('geodle');
    this.startNewRound(previousTargetCode);
  }

  private initializeCatalog(catalog: GeodleCatalog): void {
    if (catalog.version !== 1 || catalog.countries.length !== 195) {
      this.loading = false;
      this.errorMessage = 'El atlas local no superó la validación de versión.';
      return;
    }
    this.countries = catalog.countries;
    this.restoreOrStartRound();
    this.loading = false;
  }

  private restoreOrStartRound(): void {
    const progress = this.storage.getGameProgress('geodle');
    const storedTarget = progress
      ? this.countries.find(({ code }) => code === progress.gameData?.targetCode)
      : null;
    if (!progress || !storedTarget) {
      if (progress) this.storage.clearGameProgress('geodle');
      this.startNewRound();
      return;
    }

    this.target = storedTarget;
    this.guesses = this.validGuesses(progress.attempts);
    this.won = progress.gameWon;
    this.finished = progress.gameWon || progress.gameLost || this.guesses.length >= this.maxAttempts;
  }

  private startNewRound(excludedCode?: string): void {
    this.target = this.engine.getRandomCountry(this.countries, excludedCode);
    this.guesses = [];
    this.query = '';
    this.suggestions = [];
    this.errorMessage = '';
    this.shareMessage = '';
    this.won = false;
    this.finished = false;
    this.saveProgress();
  }

  private validGuesses(value: unknown): GeodleGuessResult[] {
    if (!Array.isArray(value)) return [];
    return value.filter((guess): guess is GeodleGuessResult =>
      Boolean(guess && typeof guess === 'object' && 'code' in guess && 'continent' in guess)
    ).slice(0, this.maxAttempts);
  }

  private saveProgress(): void {
    const progress: GameProgress = {
      date: new Date().toISOString(),
      currentAttempt: this.guesses.length,
      maxAttempts: this.maxAttempts,
      gameWon: this.won,
      gameLost: this.finished && !this.won,
      attempts: this.guesses,
      gameData: { targetCode: this.target?.code },
      lastUpdated: Date.now(),
    };
    this.storage.saveGameProgress('geodle', progress);
  }
}
