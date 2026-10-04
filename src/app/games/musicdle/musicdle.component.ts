import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  MusicdleArtistOption,
  MusicdleFilter,
  MusicdleFilterOption,
  MusicdleArtistMatch,
  MusicdleRoundState,
  MusicdleSong,
} from './musicdle.models';
import { MusicdleStorageService } from './musicdle-storage.service';
import { MusicdleYoutubePlayerComponent } from './musicdle-youtube-player.component';
import { ThemeService } from '../../shared/services/theme.service';
import { ShareService } from '../../shared/services/share.service';
import { AppLifecycleService } from '../../shared/services/app-lifecycle.service';

@Component({
  selector: 'app-musicdle',
  imports: [
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
  readonly playbackStartSeconds = 0;
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
  artistOptions: MusicdleArtistOption[] = [];
  artistSearchQuery = '';
  hasAvailableSongs = true;
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
  private readonly shareService = inject(ShareService);
  private readonly lifecycle = inject(AppLifecycleService);
  readonly connected = this.lifecycle.connected;
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

  get filtersLocked(): boolean {
    return this.isRoundActive && (this.round?.attempts.length ?? 0) > 0;
  }

  get filteredArtistOptions(): MusicdleArtistOption[] {
    return this.catalogService.searchArtistOptions(this.artistOptions, this.artistSearchQuery);
  }

  get selectedArtistValues(): string[] {
    return this.selectedFilter.artistValues ?? [];
  }

  get artistFilterLabel(): string {
    const count = this.selectedArtistValues.length;
    if (count === 0) return 'Todos los artistas';
    if (count === 1) return this.selectedArtistValues[0];
    return `${count} artistas seleccionados`;
  }

  isFilterSelected(option: MusicdleFilterOption): boolean {
    if (option.kind === 'all') return this.selectedFilter.kind === 'all';
    return this.selectedFilter.kind === option.kind &&
      (this.selectedFilter.values ?? [this.selectedFilter.value]).includes(option.value);
  }

  onFilterChange(key: string): void {
    const option = this.filterOptions.find((filter) => filter.key === key);
    if (!option) return;

    if (this.filtersLocked) {
      this.message = 'Termina la ronda actual antes de cambiar las categorías.';
      return;
    }

    if (option.kind === 'all') {
      this.selectedFilter = {
        kind: 'all',
        value: '*',
        label: option.label,
        artistValues: this.selectedFilter.artistValues,
      };
    } else {
      const values = this.selectedFilter.kind === 'collection'
        ? this.selectedFilter.values ?? [this.selectedFilter.value]
        : [];
      const nextValues = values.includes(option.value)
        ? values.filter((value) => value !== option.value)
        : [...values, option.value];
      if (!nextValues.length) {
        this.message = 'Selecciona al menos una categoría o elige todas las canciones.';
        return;
      }
      this.selectedFilter = this.catalogService.resolveFilter(
        {
          kind: 'collection',
          value: nextValues[0],
          values: nextValues,
          artistValues: this.selectedFilter.artistValues,
          label: '',
        },
        this.filterOptions
      )!;
    }
    const removedArtists = this.reconcileArtistsForCategories();
    this.musicStorage.saveFilter(this.selectedFilter);
    this.message = removedArtists.length
      ? `Quitamos ${removedArtists.join(', ')} porque no pertenece a las categorías elegidas.`
      : this.isRoundFinished
        ? 'Los filtros elegidos se aplicarán en la siguiente canción.'
        : '';

    if (!this.isRoundFinished) {
      this.musicStorage.clearRound();
      this.startNewRound();
    } else {
      this.refreshArtistOptions();
    }
  }

  onArtistSearchChange(value: string): void {
    this.artistSearchQuery = value;
  }

  isArtistSelected(artist: string): boolean {
    return this.selectedArtistValues.includes(artist);
  }

  onArtistFilterChange(artist: string): void {
    if (this.filtersLocked) {
      this.message = 'Termina la ronda actual antes de cambiar los artistas.';
      return;
    }

    const option = this.artistOptions.find((item) => item.value === artist);
    if (!option || (option.availableSongs === 0 && !this.isArtistSelected(artist))) return;

    const values = this.isArtistSelected(artist)
      ? this.selectedArtistValues.filter((value) => value !== artist)
      : [...this.selectedArtistValues, artist];
    this.selectedFilter = this.withArtistValues(this.selectedFilter, values);
    this.applySelectedFilters();
  }

  clearArtistFilter(): void {
    if (this.filtersLocked || this.selectedArtistValues.length === 0) return;
    this.selectedFilter = this.withArtistValues(this.selectedFilter, []);
    this.applySelectedFilters();
  }

  onGuessInputChange(value: string): void {
    this.currentGuess = value;
    this.selectedSongId = null;
    this.errorMessage = '';
    this.suggestions = this.catalogService
      .searchSongs(
        this.catalogService.filterSongs(this.songs, this.round?.filter ?? this.selectedFilter),
        value,
        this.guessedSongIds
      )
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
    if (!this.connected()) {
      this.errorMessage = 'Necesitás conexión a Internet para reproducir el fragmento.';
      return;
    }
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

    const outcome = await this.shareService.share({ title: 'MusicDLE', text, path: '/games/musicdle' });
    this.shareMessage = outcome === 'failed' ? 'No se pudo compartir. Intenta copiarlo nuevamente.' :
      outcome === 'cancelled' ? '' : outcome === 'copied' ?
        'Resultado copiado al portapapeles.' : 'Resultado listo para compartir.';
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

  isExactArtistMatch(match: MusicdleArtistMatch | boolean | undefined): boolean {
    return match === 'exact' || match === true;
  }

  isPartialArtistMatch(match: MusicdleArtistMatch | boolean | undefined): boolean {
    return match === 'partial';
  }

  artistMatchLabel(match: MusicdleArtistMatch | boolean | undefined): string {
    if (this.isExactArtistMatch(match)) return 'Artista ✓';
    if (this.isPartialArtistMatch(match)) return 'Artista parcial';
    return 'Artista ×';
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
      const resolvedFilter = this.catalogService.resolveFilter(nextFilter, this.filterOptions);
      const matchingFilter = resolvedFilter
        ? this.withCompatibleArtists(resolvedFilter)
        : null;

      if (storedRound.status === 'active' && (!matchingFilter ||
          !this.catalogService.filterSongs([storedSong], matchingFilter).length)) {
        this.musicStorage.clearRound();
      } else {
        this.round = storedRound;
        this.targetSong = storedSong;
        this.selectedFilter = matchingFilter ?? this.filterOptions[0];
        if (storedRound.status !== 'active') this.prepareRevealedVideo();
        this.refreshArtistOptions();
        return;
      }
    }

    const savedFilter = this.musicStorage.getFilter();
    const matchingFilter = savedFilter
      ? this.catalogService.resolveFilter(savedFilter, this.filterOptions)
      : null;
    if (matchingFilter) {
      this.selectedFilter = this.withCompatibleArtists(matchingFilter);
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

    const cooldownSongIds = this.musicStorage.getCooldownSongIds();
    this.refreshArtistOptions(cooldownSongIds);
    const filteredSongs = this.catalogService.filterSongs(this.songs, this.selectedFilter);
    const target = this.catalogService.pickRandomSong(
      filteredSongs,
      cooldownSongIds
    );

    if (!target) {
      this.targetSong = null;
      this.round = null;
      this.errorMessage = 'Completaste todas las canciones disponibles para esta selección por hoy.';
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
      this.refreshArtistOptions();
      this.prepareRevealedVideo();
    }
  }

  private applySelectedFilters(): void {
    this.musicStorage.saveFilter(this.selectedFilter);
    this.message = this.isRoundFinished
      ? 'Los filtros elegidos se aplicarán en la siguiente canción.'
      : '';

    if (!this.isRoundFinished) {
      this.musicStorage.clearRound();
      this.startNewRound();
    } else {
      this.refreshArtistOptions();
    }
  }

  private reconcileArtistsForCategories(): string[] {
    const previous = this.selectedArtistValues;
    this.selectedFilter = this.withCompatibleArtists(this.selectedFilter);
    return previous.filter((artist) => !this.selectedArtistValues.includes(artist));
  }

  private withCompatibleArtists(filter: MusicdleFilter): MusicdleFilter {
    const categorySongs = this.catalogService.filterSongsByCategory(this.songs, filter);
    const availableArtists = new Set(categorySongs.flatMap((song) => song.artists));
    const compatibleArtists = (filter.artistValues ?? []).filter(
      (artist) => availableArtists.has(artist)
    );
    return this.withArtistValues(filter, compatibleArtists);
  }

  private withArtistValues(filter: MusicdleFilter, artistValues: string[]): MusicdleFilter {
    const { artistValues: _previousArtists, ...categoryFilter } = filter;
    const uniqueArtists = [...new Set(artistValues)].sort((a, b) => a.localeCompare(b, 'es'));
    return uniqueArtists.length
      ? { ...categoryFilter, artistValues: uniqueArtists }
      : categoryFilter;
  }

  private refreshArtistOptions(
    cooldownSongIds = this.musicStorage.getCooldownSongIds()
  ): void {
    const categorySongs = this.catalogService.filterSongsByCategory(
      this.songs,
      this.selectedFilter
    );
    this.artistOptions = this.catalogService.buildArtistOptions(categorySongs, cooldownSongIds);
    this.hasAvailableSongs = this.catalogService
      .filterSongs(this.songs, this.selectedFilter)
      .some((song) => !cooldownSongIds.has(song.id));
  }

  private prepareRevealedVideo(): void {
    if (!this.targetSong) return;
    const url = `https://www.youtube.com/embed/${this.targetSong.youtubeVideoId}?rel=0&start=${this.playbackStartSeconds}`;
    this.revealedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private toSuggestion(song: MusicdleSong): GuessSuggestion {
    return {
      id: song.id,
      nombre: `${song.title} — ${song.artist}`,
      searchText: [song.title, song.artist, ...song.aliases].join(' '),
    };
  }
}
