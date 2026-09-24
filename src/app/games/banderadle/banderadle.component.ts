import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GameEditorialContentComponent } from '../../shared/components/game-editorial-content/game-editorial-content.component';
import { GameProgress } from '../../shared/models/game.model';
import { GameManagerService } from '../../shared/services/game-manager.service';
import { GameStorageService } from '../../shared/services/game-storage.service';
import { ThemeService } from '../../shared/services/theme.service';
import {
  BANDERADLE_MAX_ATTEMPTS,
  BanderadleEngineService,
} from './banderadle-engine.service';
import {
  BanderadleAttempt,
  BanderadleCatalog,
  BanderadleCountry,
  BanderadleRoundStatus,
} from './banderadle.models';

@Component({
  selector: 'app-banderadle',
  imports: [FormsModule, FooterComponent, GameEditorialContentComponent],
  templateUrl: './banderadle.component.html',
  styleUrl: './banderadle.component.css',
})
export class BanderadleComponent implements OnInit {
  private flagImageElement: HTMLImageElement | null = null;
  private flagCanvasElement: HTMLCanvasElement | null = null;

  @ViewChild('flagImage')
  set flagImage(element: ElementRef<HTMLImageElement> | undefined) {
    const image = element?.nativeElement;
    this.flagImageElement = image ?? null;
    if (image?.complete && image.naturalWidth > 0) this.drawPixelatedFlag();
  }

  @ViewChild('flagCanvas')
  set flagCanvas(element: ElementRef<HTMLCanvasElement> | undefined) {
    this.flagCanvasElement = element?.nativeElement ?? null;
    if (this.flagImageElement?.complete) this.drawPixelatedFlag();
  }

  readonly maxAttempts = BANDERADLE_MAX_ATTEMPTS;
  readonly attemptSlots = Array.from({ length: BANDERADLE_MAX_ATTEMPTS }, (_, index) => index);

  private readonly http = inject(HttpClient);
  private readonly engine = inject(BanderadleEngineService);
  private readonly storage = inject(GameStorageService);
  private readonly gameManager = inject(GameManagerService);
  private readonly theme = inject(ThemeService);

  countries: BanderadleCountry[] = [];
  suggestions: BanderadleCountry[] = [];
  target: BanderadleCountry | null = null;
  attempts: BanderadleAttempt[] = [];
  query = '';
  feedback = '';
  shareMessage = '';
  loading = true;
  inputFocused = false;
  suggestionIndex = -1;
  status: BanderadleRoundStatus = 'active';
  flagReady = false;

  ngOnInit(): void {
    this.theme.setHeaderTheme('banderadle');
    this.theme.setFooterTheme('banderadle');
    this.http.get<BanderadleCatalog>('geodle-countries.json').subscribe({
      next: (catalog) => this.initializeCatalog(catalog),
      error: () => {
        this.loading = false;
        this.feedback = 'No pudimos cargar las banderas. Recargá la página para intentarlo otra vez.';
      },
    });
  }

  get finished(): boolean {
    return this.status !== 'active';
  }

  get won(): boolean {
    return this.status === 'won';
  }

  get pixelResolution(): number {
    return this.engine.pixelResolutionFor(this.attempts.length, this.status);
  }

  get pixelResolutionPercentage(): number {
    return Math.round(this.pixelResolution * 100);
  }

  get currentAttempt(): number {
    return this.finished
      ? this.attempts.length
      : Math.min(this.attempts.length + 1, this.maxAttempts);
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.feedback = '';
    this.suggestionIndex = -1;
    this.suggestions = this.engine.filterCountries(
      this.countries,
      value,
      this.attempts.flatMap(({ code }) => code ? [code] : [])
    );
  }

  selectCountry(country: BanderadleCountry): void {
    this.query = country.name;
    this.closeSuggestions();
  }

  onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeSuggestions();
      return;
    }

    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && this.suggestions.length) {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      this.suggestionIndex = this.suggestionIndex === -1
        ? (direction === 1 ? 0 : this.suggestions.length - 1)
        : (this.suggestionIndex + direction + this.suggestions.length) % this.suggestions.length;
      return;
    }

    if (event.key === 'Enter' && this.suggestionIndex >= 0) {
      event.preventDefault();
      this.selectCountry(this.suggestions[this.suggestionIndex]);
      this.submitGuess();
    }
  }

  submitGuess(): void {
    if (this.finished || !this.target) return;
    const country = this.engine.findCountry(this.countries, this.query);
    if (!country) {
      this.feedback = 'Elegí un país válido de la lista.';
      return;
    }
    if (this.attempts.some(({ code }) => code === country.code)) {
      this.feedback = `Ya probaste con ${country.name}.`;
      return;
    }

    const correct = country.code === this.target.code;
    this.attempts = [...this.attempts, { kind: 'guess', code: country.code, name: country.name, correct }];
    this.query = '';
    this.closeSuggestions();

    if (correct) {
      this.status = 'won';
      this.feedback = `¡Correcto! Era ${this.target.name}.`;
    } else {
      this.resolveIncorrectAttempt(`No es ${country.name}.`);
    }

    this.drawPixelatedFlag();
    this.persistAttemptResult();
  }

  passAttempt(): void {
    if (this.finished || !this.target) return;
    this.attempts = [...this.attempts, {
      kind: 'pass',
      name: 'Intento pasado',
      correct: false,
    }];
    this.query = '';
    this.closeSuggestions();
    this.resolveIncorrectAttempt('Pasaste el intento.');
    this.drawPixelatedFlag();
    this.persistAttemptResult();
  }

  startNewRound(): void {
    if (!this.countries.length) return;
    const previousTargetCode = this.target?.code;
    this.flagReady = false;
    this.storage.clearGameProgress('banderadle');
    this.target = this.engine.getRandomCountry(this.countries, previousTargetCode);
    this.attempts = [];
    this.query = '';
    this.feedback = '';
    this.shareMessage = '';
    this.status = 'active';
    this.closeSuggestions();
    this.saveProgress();
  }

  async share(): Promise<void> {
    const score = this.won ? `${this.attempts.length}/${this.maxAttempts}` : `X/${this.maxAttempts}`;
    const marks = this.attempts
      .map((attempt) => attempt.correct ? '🟩' : attempt.kind === 'pass' ? '⏭️' : '⬛')
      .join('');
    const text = `BanderaDLE · ${score}\n${marks}\n${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: 'BanderaDLE', text });
      else await navigator.clipboard.writeText(text);
      this.shareMessage = 'Resultado listo para compartir.';
    } catch {
      this.shareMessage = 'No se pudo compartir el resultado.';
    }
  }

  hideSuggestionsSoon(): void {
    window.setTimeout(() => { this.inputFocused = false; }, 120);
  }

  onFlagError(): void {
    this.flagReady = false;
    this.feedback = 'No pudimos mostrar esta bandera. Probá iniciar una ronda nueva.';
  }

  onFlagLoad(): void {
    this.drawPixelatedFlag();
  }

  private drawPixelatedFlag(): void {
    const image = this.flagImageElement;
    const canvas = this.flagCanvasElement;
    if (!image || !canvas || !image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) return;

    const width = image.naturalWidth;
    const height = image.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    const sampleWidth = Math.max(1, Math.round(width * this.pixelResolution));
    const sampleHeight = Math.max(1, Math.round(height * this.pixelResolution));
    const sample = canvas.ownerDocument.createElement('canvas');
    sample.width = sampleWidth;
    sample.height = sampleHeight;

    const sampleContext = sample.getContext('2d');
    const context = canvas.getContext('2d');
    if (!sampleContext || !context) return;

    sampleContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = false;
    context.drawImage(sample, 0, 0, sampleWidth, sampleHeight, 0, 0, width, height);
    this.flagReady = true;
  }

  private initializeCatalog(catalog: BanderadleCatalog): void {
    if (catalog.version !== 1 || catalog.countries.length !== 195) {
      this.loading = false;
      this.feedback = 'El catálogo local de banderas no superó la validación.';
      return;
    }
    this.countries = this.engine.prepareCountries(catalog.countries);
    this.restoreOrStartRound();
    this.loading = false;
  }

  private restoreOrStartRound(): void {
    const progress = this.storage.getGameProgress('banderadle');
    const storedTarget = progress
      ? this.countries.find(({ code }) => code === progress.gameData?.targetCode)
      : null;
    if (!progress || !storedTarget) {
      if (progress) this.storage.clearGameProgress('banderadle');
      this.startNewRound();
      return;
    }

    this.target = storedTarget;
    this.attempts = this.validAttempts(progress.attempts);
    this.status = progress.gameWon ? 'won' : progress.gameLost ? 'lost' : 'active';
    if (this.status === 'won') this.feedback = `¡Correcto! Era ${storedTarget.name}.`;
    if (this.status === 'lost') this.feedback = `Se terminaron los intentos. Era ${storedTarget.name}.`;
  }

  private validAttempts(value: unknown): BanderadleAttempt[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((attempt): BanderadleAttempt[] => {
      if (!attempt || typeof attempt !== 'object' || !('name' in attempt) || !('correct' in attempt)) return [];
      const stored = attempt as Partial<BanderadleAttempt>;
      if (stored.kind === 'pass') return [{ kind: 'pass', name: String(stored.name), correct: false }];
      if (typeof stored.code !== 'string') return [];
      return [{ kind: 'guess', code: stored.code, name: String(stored.name), correct: Boolean(stored.correct) }];
    }).slice(0, this.maxAttempts);
  }

  private resolveIncorrectAttempt(prefix: string): void {
    if (!this.target) return;
    if (this.attempts.length >= this.maxAttempts) {
      this.status = 'lost';
      this.feedback = `Se terminaron los intentos. Era ${this.target.name}.`;
      return;
    }
    const remaining = this.maxAttempts - this.attempts.length;
    this.feedback = `${prefix} La bandera ganó un poco más de resolución · ${remaining} ${remaining === 1 ? 'intento' : 'intentos'}.`;
  }

  private persistAttemptResult(): void {
    this.saveProgress();
    if (!this.finished || !this.target) return;
    this.gameManager.completeGame('banderadle', this.won, this.attempts.length, {
      targetCode: this.target.code,
      maxAttempts: this.maxAttempts,
    });
  }

  private saveProgress(): void {
    const progress: GameProgress = {
      date: new Date().toISOString(),
      currentAttempt: this.attempts.length,
      maxAttempts: this.maxAttempts,
      gameWon: this.won,
      gameLost: this.status === 'lost',
      attempts: this.attempts,
      gameData: { targetCode: this.target?.code },
      lastUpdated: Date.now(),
    };
    this.storage.saveGameProgress('banderadle', progress);
  }

  private closeSuggestions(): void {
    this.suggestions = [];
    this.suggestionIndex = -1;
    this.inputFocused = false;
  }
}
