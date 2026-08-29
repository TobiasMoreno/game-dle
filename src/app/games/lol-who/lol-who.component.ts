import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../shared/services/theme.service';
import { LoLCharacter } from '../loldle/loldle-game.service';
import { LolGameShellComponent } from '../lol-shared/lol-game-shell.component';
import { randomChampionImage, shuffleChampions, validChampions } from '../lol-shared/lol-game.utils';

@Component({
  selector: 'app-lol-who',
  imports: [LolGameShellComponent],
  templateUrl: './lol-who.component.html',
})
export class LolWhoComponent implements OnInit, OnDestroy {
  readonly title = '¿Quién es?';
  readonly instructions = 'Escribí el nombre del campeón. Cada intento incorrecto reduce el zoom de la imagen.';
  readonly maxAttempts = 6;

  champions: LoLCharacter[] = [];
  target: LoLCharacter | null = null;
  targetImageUrl = '';
  loading = true;
  score = 0;
  rounds = 0;
  feedback = '';
  roundComplete = false;
  guess = '';
  suggestions: LoLCharacter[] = [];
  suggestionIndex = -1;
  attempts: string[] = [];
  imageOriginClass = 'origin-center';
  zoomTransitionEnabled = false;

  private readonly zoomClasses = ['scale-[3]', 'scale-[2.55]', 'scale-[2.15]', 'scale-[1.8]', 'scale-150', 'scale-125', 'scale-100'];
  private readonly imageOrigins = ['origin-top-left', 'origin-top', 'origin-top-right', 'origin-left', 'origin-center', 'origin-right', 'origin-bottom-left', 'origin-bottom', 'origin-bottom-right'];
  private readonly http = inject(HttpClient);
  private readonly themeService = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly subscriptions = new Subscription();
  private zoomTransitionFrame: number | null = null;

  get imageScaleClass(): string {
    return this.roundComplete ? 'scale-100' : this.zoomClasses[Math.min(this.attempts.length, this.zoomClasses.length - 1)];
  }

  get zoomPercent(): number {
    const levels = [300, 255, 215, 180, 150, 125, 100];
    return this.roundComplete ? 100 : levels[Math.min(this.attempts.length, levels.length - 1)];
  }

  ngOnInit(): void {
    this.themeService.setHeaderTheme('loldle');
    this.themeService.setFooterTheme('loldle');
    if (!this.isBrowser) {
      this.loading = false;
      return;
    }
    this.subscriptions.add(this.http.get<LoLCharacter[]>('campeones_lol.json').subscribe({
      next: (champions) => {
        this.champions = validChampions(champions);
        this.loading = false;
        this.startRound();
      },
      error: () => {
        this.loading = false;
        this.feedback = 'No pudimos cargar los campeones. Probá de nuevo en unos segundos.';
      },
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.zoomTransitionFrame !== null && this.isBrowser) cancelAnimationFrame(this.zoomTransitionFrame);
  }

  startRound(): void {
    if (!this.champions.length) return;
    this.zoomTransitionEnabled = false;
    this.target = shuffleChampions(this.champions)[0];
    this.targetImageUrl = randomChampionImage(this.target);
    const availableOrigins = this.imageOrigins.filter((origin) => origin !== this.imageOriginClass);
    this.imageOriginClass = availableOrigins[Math.floor(Math.random() * availableOrigins.length)];
    this.guess = '';
    this.suggestions = [];
    this.suggestionIndex = -1;
    this.attempts = [];
    this.feedback = '';
    this.roundComplete = false;

    if (this.isBrowser) {
      if (this.zoomTransitionFrame !== null) cancelAnimationFrame(this.zoomTransitionFrame);
      this.zoomTransitionFrame = requestAnimationFrame(() => {
        this.zoomTransitionFrame = requestAnimationFrame(() => {
          this.zoomTransitionEnabled = true;
          this.zoomTransitionFrame = null;
        });
      });
    }
  }

  onInput(value: string): void {
    this.guess = value;
    if (this.roundComplete || !value.trim()) {
      this.closeSuggestions();
      return;
    }
    const search = value.toLocaleLowerCase('es').trim();
    this.suggestions = this.champions
      .filter((champion) => champion.nombre.toLocaleLowerCase('es').includes(search) && !this.attempts.includes(champion.nombre))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .slice(0, 6);
    this.suggestionIndex = -1;
  }

  selectSuggestion(champion: LoLCharacter): void {
    this.guess = champion.nombre;
    this.closeSuggestions();
  }

  onKeydown(event: KeyboardEvent): void {
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
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.suggestions.length) {
        this.guess = this.suggestions[this.suggestionIndex >= 0 ? this.suggestionIndex : 0].nombre;
        this.closeSuggestions();
      }
      this.submitGuess();
    }
  }

  submitGuess(): void {
    if (this.roundComplete || !this.target) return;
    const normalizedGuess = this.guess.toLocaleLowerCase('es').trim();
    const champion = this.champions.find((item) => item.nombre.toLocaleLowerCase('es') === normalizedGuess);
    if (!champion) {
      this.feedback = 'Ingresá un nombre válido del catálogo de campeones.';
      return;
    }
    if (this.attempts.includes(champion.nombre)) {
      this.feedback = `Ya probaste con ${champion.nombre}.`;
      return;
    }
    this.attempts.push(champion.nombre);
    this.guess = '';
    this.closeSuggestions();

    if (champion.id === this.target.id) {
      this.score++;
      this.rounds++;
      this.roundComplete = true;
      this.feedback = `¡Correcto! Era ${this.target.nombre}.`;
    } else if (this.attempts.length >= this.maxAttempts) {
      this.rounds++;
      this.roundComplete = true;
      this.feedback = `Se terminaron los intentos. Era ${this.target.nombre}.`;
    } else {
      const remaining = this.maxAttempts - this.attempts.length;
      this.feedback = `No es ${champion.nombre}. La imagen se alejó un poco · ${remaining} ${remaining === 1 ? 'intento' : 'intentos'}.`;
    }
  }

  onTargetImageError(event?: Event): void {
    if (this.target && this.targetImageUrl !== this.target.img_url) {
      this.targetImageUrl = this.target.img_url;
    } else if (event) {
      (event.target as HTMLImageElement).style.visibility = 'hidden';
    }
  }

  private closeSuggestions(): void {
    this.suggestions = [];
    this.suggestionIndex = -1;
  }

}
