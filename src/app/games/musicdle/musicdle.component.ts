import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import {
  GuessInputComponent,
  GuessInputTheme,
  GuessSuggestion,
} from '../../shared/components/guess-input/guess-input.component';
import { MusicdleCatalogService } from './musicdle-catalog.service';
import {
  MUSICDLE_MAX_ATTEMPTS,
  MUSICDLE_SECONDS_PER_ATTEMPT,
  MusicdleEngineService,
} from './musicdle-engine.service';
import {
  MusicdleFilter,
  MusicdleFilterOption,
  MusicdleRoundState,
  MusicdleSong,
} from './musicdle.models';
import { MusicdleStorageService } from './musicdle-storage.service';
import { MusicdleYoutubePlayerComponent } from './musicdle-youtube-player.component';
import { ThemeService } from '../../shared/services/theme.service';

@Component({
  selector: 'app-musicdle',
  imports: [
    FormsModule,
    BaseGameComponent,
    GuessInputComponent,
    MusicdleYoutubePlayerComponent,
  ],
  templateUrl: './musicdle.component.html',
  styleUrl: './musicdle.component.css',
})
export class MusicdleComponent extends BaseGameComponent implements OnInit, OnDestroy {
  @ViewChild(MusicdleYoutubePlayerComponent)
  private youtubePlayer?: MusicdleYoutubePlayerComponent;

  readonly maxAttempts = MUSICDLE_MAX_ATTEMPTS;
  readonly secondsPerAttempt = MUSICDLE_SECONDS_PER_ATTEMPT;
  readonly attemptDurations = Array.from(
    { length: MUSICDLE_MAX_ATTEMPTS },
    (_, index) => (index + 1) * MUSICDLE_SECONDS_PER_ATTEMPT
  );
  private readonly darkMusicInputTheme: GuessInputTheme = {
    inputBg: 'rgba(28, 25, 23, 0.96)',
    inputBorder: 'border-amber-500/60',
    inputText: 'text-amber-50',
    inputPlaceholder: 'placeholder-stone-500',
    dropdownBg: 'bg-stone-900',
    dropdownBorder: 'border-amber-500/30',
    dropdownItemHoverBg: 'hover:bg-amber-500/10',
    buttonBg: 'bg-amber-500',
    buttonText: 'text-stone-950',
    buttonHoverBg: 'hover:bg-amber-400',
  };
  private readonly lightMusicInputTheme: GuessInputTheme = {
    inputBg: 'rgba(255, 251, 235, 0.98)',
    inputBorder: 'border-amber-700/40',
    inputText: 'text-stone-900',
    inputPlaceholder: 'placeholder-stone-500',
    dropdownBg: 'bg-amber-50',
    dropdownBorder: 'border-amber-700/25',
    dropdownItemHoverBg: 'hover:bg-amber-700/10',
    buttonBg: 'bg-amber-700',
    buttonText: 'text-amber-50',
    buttonHoverBg: 'hover:bg-amber-800',
  };

  songs: MusicdleSong[] = [];
  filterOptions: MusicdleFilterOption[] = [];
  selectedFilterKey = 'all:*';
  selectedFilter: MusicdleFilter = {
    kind: 'all',
    value: '*',
    label: 'Todas las canciones',
  };
  round: MusicdleRoundState | null = null;
  targetSong: MusicdleSong | null = null;
  suggestions: GuessSuggestion[] = [];
  currentGuess = '';
  selectedSongId: string | null = null;
  isLoading = true;
  playerReady = false;
  isPlaying = false;
  message = '';
  errorMessage = '';
  shareMessage = '';
  revealedVideoUrl: SafeResourceUrl | null = null;

  private readonly catalogService = inject(MusicdleCatalogService);
  private readonly engine = inject(MusicdleEngineService);
  private readonly musicStorage = inject(MusicdleStorageService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly musicThemeService = inject(ThemeService);
  private readonly subscriptions = new Subscription();

  get isDarkMode(): boolean {
    return this.musicThemeService.getColorMode() === 'dark';
  }

  get musicInputTheme(): GuessInputTheme {
    return this.isDarkMode ? this.darkMusicInputTheme : this.lightMusicInputTheme;
  }

  ngOnInit(): void {
    this.setGameId('musicdle');
    this.subscriptions.add(
      this.catalogService.loadSongs().subscribe({
        next: (songs) => {
          this.songs = songs;
          this.filterOptions = this.catalogService.buildFilterOptions(songs);
          this.restoreOrStartRound();
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'No pudimos cargar el catálogo musical. Intenta recargar la página.';
          this.isLoading = false;
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isRoundActive(): boolean {
    return this.round?.status === 'active';
  }

  get isRoundFinished(): boolean {
    return Boolean(this.round && this.round.status !== 'active');
  }

  get attemptNumber(): number {
    if (!this.round) return 1;
    return Math.min(this.round.attempts.length + 1, this.maxAttempts);
  }

  get guessedSongIds(): Set<string> {
    return new Set(
      this.round?.attempts
        .map((attempt) => attempt.songId)
        .filter((songId): songId is string => Boolean(songId)) ?? []
    );
  }

  onFilterChange(key: string): void {
    const option = this.filterOptions.find((filter) => filter.key === key);
    if (!option) return;

    if (this.isRoundActive && (this.round?.attempts.length ?? 0) > 0) {
      this.selectedFilterKey = this.getFilterKey(this.selectedFilter);
      this.message = 'Termina la ronda actual antes de cambiar de categoría.';
      return;
    }

    this.selectedFilter = {
      kind: option.kind,
      value: option.value,
      label: option.label,
    };
    this.selectedFilterKey = option.key;
    this.musicStorage.saveFilter(this.selectedFilter);
    this.message = this.isRoundFinished
      ? 'La nueva categoría se aplicará en la siguiente canción.'
      : '';

    if (this.isRoundActive) {
      this.musicStorage.clearRound();
      this.startNewRound();
    }
  }

  onGuessInputChange(value: string): void {
    this.currentGuess = value;
    this.selectedSongId = null;
    this.errorMessage = '';
    this.suggestions = this.catalogService
      .searchSongs(this.songs, value, this.guessedSongIds)
      .map((song) => this.toSuggestion(song));
  }

  onSelectSuggestion(suggestion: GuessSuggestion): void {
    this.currentGuess = suggestion.nombre;
    this.selectedSongId = typeof suggestion.id === 'string' ? suggestion.id : null;
    this.errorMessage = '';
  }

  submitGuess(): void {
    if (!this.round || !this.targetSong || !this.isRoundActive) return;

    const guessedSong = this.songs.find((song) => song.id === this.selectedSongId);
    if (!guessedSong) {
      this.errorMessage = 'Selecciona una canción válida de la lista.';
      return;
    }
    if (this.guessedSongIds.has(guessedSong.id)) {
      this.errorMessage = 'Ya intentaste con esa canción.';
      return;
    }

    this.round = this.engine.submitGuess(this.round, guessedSong, this.targetSong);
    this.afterAttempt();
  }

  passAttempt(): void {
    if (!this.round || !this.isRoundActive) return;
    this.round = this.engine.pass(this.round);
    this.afterAttempt();
  }

  playSegment(): void {
    if (!this.isRoundActive || !this.playerReady) return;
    this.youtubePlayer?.playSegment();
  }

  onVideoUnavailable(): void {
    if (!this.targetSong || !this.isRoundActive) return;
    this.musicStorage.addCooldown(this.targetSong.id, 'unavailable');
    this.musicStorage.clearRound();
    this.message = 'Ese video no está disponible. Elegimos otra canción sin gastar un intento.';
    queueMicrotask(() => this.startNewRound());
  }

  onYoutubeApiUnavailable(): void {
    this.errorMessage = 'No pudimos conectar con YouTube. Recarga la página para volver a intentarlo.';
  }

  nextRound(): void {
    this.musicStorage.clearRound();
    this.shareMessage = '';
    this.message = '';
    this.startNewRound();
  }

  async shareResult(): Promise<void> {
    if (!this.round || !this.isRoundFinished) return;
    const text = this.engine.buildShareText(this.round);

    try {
      if (navigator.share) {
        await navigator.share({ title: 'MusicDLE', text });
        this.shareMessage = 'Resultado listo para compartir.';
        return;
      }
      await navigator.clipboard.writeText(text);
      this.shareMessage = 'Resultado copiado al portapapeles.';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      this.shareMessage = 'No se pudo compartir. Intenta copiarlo nuevamente.';
    }
  }

  segmentState(index: number): 'used' | 'available' | 'locked' {
    if (!this.round) return 'locked';
    if (index < this.round.attempts.length) return 'used';
    if (index === this.round.attempts.length && this.isRoundActive) return 'available';
    if (this.isRoundFinished && index === this.round.attempts.length - 1) return 'available';
    return 'locked';
  }

  attemptIcon(kind: 'guess' | 'pass', correct: boolean): string {
    if (correct) return '✓';
    return kind === 'pass' ? '→' : '×';
  }

  private restoreOrStartRound(): void {
    const storedRound = this.musicStorage.getRound();
    const storedSong = storedRound
      ? this.songs.find((song) => song.id === storedRound.songId)
      : null;

    if (storedRound?.version === 2 && storedSong) {
      const nextFilter = storedRound.status === 'active'
        ? storedRound.filter
        : this.musicStorage.getFilter() ?? storedRound.filter;
      const matchingOption = this.filterOptions.find(
        (option) => option.key === this.getFilterKey(nextFilter)
      );

      if (storedRound.status === 'active' && !matchingOption) {
        this.musicStorage.clearRound();
      } else {
        this.round = storedRound;
        this.targetSong = storedSong;
        this.selectedFilter = matchingOption ?? this.filterOptions[0];
        this.selectedFilterKey = this.getFilterKey(this.selectedFilter);
        if (storedRound.status !== 'active') this.prepareRevealedVideo();
        return;
      }
    }

    const savedFilter = this.musicStorage.getFilter();
    const matchingFilter = savedFilter
      ? this.filterOptions.find((option) => option.key === this.getFilterKey(savedFilter))
      : null;
    if (matchingFilter) {
      this.selectedFilter = matchingFilter;
      this.selectedFilterKey = matchingFilter.key;
    }
    this.startNewRound();
  }

  private startNewRound(): void {
    this.errorMessage = '';
    this.currentGuess = '';
    this.selectedSongId = null;
    this.suggestions = [];
    this.revealedVideoUrl = null;
    this.playerReady = false;
    this.isPlaying = false;

    const filteredSongs = this.catalogService.filterSongs(this.songs, this.selectedFilter);
    const target = this.catalogService.pickRandomSong(
      filteredSongs,
      this.musicStorage.getCooldownSongIds()
    );

    if (!target) {
      this.targetSong = null;
      this.round = null;
      this.errorMessage = 'No quedan canciones disponibles en esta categoría durante las próximas 24 horas. Prueba con otra.';
      return;
    }

    this.targetSong = target;
    this.round = this.engine.createRound(target.id, this.selectedFilter);
    this.musicStorage.saveFilter(this.selectedFilter);
    this.musicStorage.saveRound(this.round);
  }

  private afterAttempt(): void {
    if (!this.round) return;
    this.musicStorage.saveRound(this.round);
    this.currentGuess = '';
    this.selectedSongId = null;
    this.suggestions = [];
    this.errorMessage = '';
    this.isPlaying = false;

    if (this.round.status !== 'active' && this.targetSong) {
      this.musicStorage.addCooldown(this.targetSong.id, 'played');
      this.prepareRevealedVideo();
    }
  }

  private prepareRevealedVideo(): void {
    if (!this.targetSong) return;
    const url = `https://www.youtube.com/embed/${this.targetSong.youtubeVideoId}?rel=0&start=${this.targetSong.startSeconds}`;
    this.revealedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private toSuggestion(song: MusicdleSong): GuessSuggestion {
    return {
      id: song.id,
      nombre: `${song.title} — ${song.artist}`,
      searchText: [song.title, song.artist, ...song.aliases].join(' '),
    };
  }

  private getFilterKey(filter: MusicdleFilter): string {
    return `${filter.kind}:${filter.value}`;
  }
}
