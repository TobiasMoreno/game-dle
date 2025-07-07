import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { AudioService } from '../../shared/services/audio.service';
import { MusicControlsComponent } from '../../shared/components/music-controls/music-controls.component';
import { GuessInputComponent } from '../../shared/components/guess-input/guess-input.component';
import {
  OnePieceGameService,
  OnePieceCharacter,
  GuessResult,
} from './onepiece-game.service';
import { GameBoardComponent } from '../../shared/components/game-board';
import { GuessHandlerService } from '../../shared/services/guess-handler.service';
import { CharacterGameConfig } from '../../shared/components/base-character-game/base-character-game.component';
import { GameResultComponent } from '../../shared/components/game-result';
import { OnePieceThemeService } from './onepiece-theme.service';
import { OnePieceConfigService } from './onepiece-config.service';

@Component({
  selector: 'app-onepiecedle',
  imports: [
    FormsModule,
    BaseGameComponent,
    MusicControlsComponent,
    GuessInputComponent,
    GameBoardComponent,
    GameResultComponent,
  ],
  templateUrl: './onepiecedle.component.html',
  styleUrls: ['./onepiecedle.component.css'],
})
export class OnePieceDLEComponent extends BaseGameComponent implements OnInit, OnDestroy {
  // Configuración del juego
  readonly config: CharacterGameConfig = {
    gameId: 'onepiecedle',
    maxAttempts: 6,
    charactersFile: 'personajes_one_piece.json',
    musicFile: 'one-piece-soundtrack.mp3',
    characterType: 'personaje',
  };

  // Servicios inyectados
  private http: HttpClient = inject(HttpClient);
  readonly gameService: OnePieceGameService = inject(OnePieceGameService);
  private audioService: AudioService = inject(AudioService);
  private guessHandler: GuessHandlerService = inject(GuessHandlerService);
  private onepieceThemeService: OnePieceThemeService = inject(OnePieceThemeService);
  private configService: OnePieceConfigService = inject(OnePieceConfigService);

  // Propiedades del juego
  characters: OnePieceCharacter[] = [];
  filteredCharacters: OnePieceCharacter[] = [];
  targetCharacter: OnePieceCharacter | null = null;
  guesses: GuessResult[] = [];
  currentGuess: string = '';
  currentAttempt: number = 0;
  gameWon: boolean = false;
  errorMessage: string = '';
  charactersLoaded: boolean = false;
  hasSavedProgress: boolean = false;
  revealedColumns: number[] = [];

  // Getters para temas y configuración
  get onepieceTheme() { return this.onepieceThemeService.getMusicTheme(); }
  get onepieceInputTheme() { return this.onepieceThemeService.getInputTheme(); }
  get boardColumns() { return this.configService.getBoardColumns(); }
  get boardTheme() { return this.onepieceThemeService.getBoardTheme(); }

  ngOnInit(): void {
    this.setGameId(this.config.gameId);
    this.loadCharacters();
    this.audioService.initializeAudio(this.config.musicFile);
    this.progressLoaded.subscribe((progress: GameProgress | null) => {
      if (progress) {
        this.restoreProgress(progress);
      }
    });
  }

  ngOnDestroy(): void {
    this.audioService.cleanup();
  }

  private restoreProgress(progress: GameProgress): void {
    try {
      this.currentAttempt = progress.currentAttempt;
      this.gameWon = progress.gameWon;
      this.guesses = progress.attempts || [];
      this.hasSavedProgress = true;
      if (progress.gameData?.targetCharacter && this.characters.length > 0) {
        const targetData = progress.gameData.targetCharacter;
        this.targetCharacter = this.characters.find(
          (char) => char.id === targetData.id && char.nombre === targetData.nombre
        ) || null;
      }
    } catch (error) {
      console.error('Error al restaurar progreso:', error);
    }
  }

  private saveCurrentProgress(): void {
    try {
      const targetCharacterData = this.targetCharacter ? {
        id: this.targetCharacter.id,
        nombre: this.targetCharacter.nombre,
      } : null;
      const progressData = {
        currentAttempt: this.currentAttempt,
        gameWon: this.gameWon,
        gameLost: this.currentAttempt >= this.config.maxAttempts,
        attempts: this.guesses,
        maxAttempts: this.config.maxAttempts,
        gameData: { targetCharacter: targetCharacterData },
      };
      this.updateProgress(progressData);
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  }

  private loadCharacters(): void {
    this.http.get<OnePieceCharacter[]>(this.config.charactersFile).subscribe({
      next: (characters) => {
        this.characters = characters.filter(char => char.nombre && char.nombre.trim() !== '');
        this.charactersLoaded = true;
        this.filteredCharacters = this.characters.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.initializeGame();
      },
      error: (error) => {
        console.error('❌ Error loading characters:', error);
        this.errorMessage = 'Error al cargar los personajes. Intenta recargar la página.';
      },
    });
  }

  private initializeGame(): void {
    if (this.characters.length === 0) return;
    this.targetCharacter = this.getRandomCharacter();
    this.currentAttempt = 0;
    this.gameWon = false;
    this.errorMessage = '';
    this.guesses = [];
    this.hasSavedProgress = false;
    this.saveCurrentProgress();
  }

  private getRandomCharacter(): OnePieceCharacter {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  onInputChange(value: string): void {
    this.currentGuess = value;
    this.errorMessage = '';
    this.filteredCharacters = this.guessHandler.updateFilteredCharacters(
      this.characters, value, this.guesses, this.gameService
    );
  }

  onSelectSuggestion(suggestion: { nombre: string }): void {
    this.currentGuess = suggestion.nombre;
    this.filteredCharacters = [];
  }

  onPlayAgain(): void {
    this.initializeGame();
  }

  submitGuess(): void {
    const validation = this.guessHandler.validateGuess(
      this.currentGuess, this.characters, this.guesses, this.gameService, this.config.characterType
    );

    if (!validation.isValid) {
      this.errorMessage = validation.errorMessage!;
      return;
    }

    const guessedCharacter = validation.guessedCharacter! as OnePieceCharacter;
    this.currentGuess = guessedCharacter.nombre;

    const guessResult = this.gameService.compareGuess(guessedCharacter, this.targetCharacter!);
    this.guesses.push(guessResult);

    const result = this.guessHandler.processGuessResult(
      guessResult, this.currentAttempt, this.config.maxAttempts, this.targetCharacter!, guessedCharacter
    );

    if (result.gameWon) {
      this.gameWon = true;
      this.completeGame(true, this.currentAttempt + 1, result.gameData);
    } else if (!result.shouldContinue) {
      this.currentAttempt++;
      this.completeGame(false, this.config.maxAttempts, result.gameData);
    } else {
      this.currentAttempt++;
      this.saveCurrentProgress();
    }

    this.currentGuess = '';
  }

  selectCharacter(nombre: string, autoSubmit: boolean = false): void {
    this.currentGuess = nombre;
    this.filteredCharacters = [];
    if (autoSubmit) {
      setTimeout(() => this.submitGuess(), 0);
    }
  }

  getFormattedValue(field: string, value: any): string {
    return this.gameService.getFormattedValue(field, value);
  }

  getCharacterImageUrl(characterName: string): string {
    const character = this.characters.find(char => char.nombre === characterName);
    if (character?.img_url) return character.img_url;
    return '';
  }

  hasCharacterImage(characterName: string): boolean {
    return !!this.getCharacterImageUrl(characterName);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) target.style.display = 'none';
  }

  continueGame(): void {
    this.hasSavedProgress = false;
  }

  public isGamePlayedTodaySafe(): boolean {
    return this.isGamePlayedToday();
  }

  public hasProgressSafe(): boolean {
    return this.hasProgress();
  }

  getBoardRows() {
    return this.guesses.slice().reverse().map((guess) => ({
      name: {
        value: guess.name.value || 'N/A',
        status: this.configService.mapStatus(guess.name.status),
        imageUrl: this.getCharacterImageUrl(guess.name.value),
        hasImage: this.hasCharacterImage(guess.name.value)
      },
      genero: {
        value: guess.genero.value || 'N/A',
        status: this.configService.mapStatus(guess.genero.status)
      },
      afiliacion: {
        value: guess.afiliacion.value || 'N/A',
        status: this.configService.mapStatus(guess.afiliacion.status)
      },
      fruta_del_diablo: {
        value: guess.fruta_del_diablo.value || 'N/A',
        status: this.configService.mapStatus(guess.fruta_del_diablo.status)
      },
      hakis: {
        value: guess.hakis.value || 'N/A',
        status: this.configService.mapStatus(guess.hakis.status)
      },
      ultima_recompensa: {
        value: guess.ultima_recompensa.value || 'N/A',
        status: this.configService.mapStatus(guess.ultima_recompensa.status),
        arrow: guess.ultima_recompensa.arrow || undefined
      },
      altura: {
        value: guess.altura.value || 'N/A',
        status: this.configService.mapStatus(guess.altura.status),
        arrow: guess.altura.arrow || undefined
      },
      origen: {
        value: guess.origen.value || 'N/A',
        status: this.configService.mapStatus(guess.origen.status)
      },
      primer_arco: {
        value: guess.primer_arco.value || 'N/A',
        status: this.configService.mapStatus(guess.primer_arco.status),
        arrow: guess.primer_arco.arrow || undefined
      }
    }));
  }

  getGameResultConfig() {
    return this.onepieceThemeService.getGameResultConfig(
      this.gameWon, this.currentAttempt, this.config.maxAttempts, this.targetCharacter, this.config.characterType
    );
  }

  getCharacterFields() {
    return this.configService.getCharacterFields(this.targetCharacter, this.getFormattedValue.bind(this));
  }
}
