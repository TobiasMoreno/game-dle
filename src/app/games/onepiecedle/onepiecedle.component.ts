import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { AudioService } from '../../shared/services/audio.service';
import {
  MusicControlsComponent,
  MusicControlsTheme,
} from '../../shared/components/music-controls/music-controls.component';
import {
  OnePieceGameService,
  OnePieceCharacter,
  CompareStatus,
  GuessResult,
} from './onepiece-game.service';
import {
  GuessInputComponent,
  GuessInputTheme,
} from '../../shared/components/guess-input/guess-input.component';
import {
  GameBoardComponent,
  GameColumn,
  GameRow,
  GameBoardTheme,
  ComparisonStatus,
} from '../../shared/components/game-board';
import { GuessHandlerService } from '../../shared/services/guess-handler.service';
import { CharacterGameConfig } from '../../shared/components/base-character-game/base-character-game.component';
import {
  GameResultComponent,
  GameResultConfig,
  CharacterField,
} from '../../shared/components/game-result';

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
export class OnePieceDLEComponent
  extends BaseGameComponent
  implements OnInit, OnDestroy
{
  // Configuración del juego usando la interfaz generalizada
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

  // Tema para los controles de música
  onepieceTheme: MusicControlsTheme = {
    buttonBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    buttonHoverBg: 'hover:from-yellow-400 hover:to-orange-400',
    buttonTextColor: 'text-black',
    volumeTextColor: '#1f2937',
    sliderBg: '#fef3c7',
    sliderThumbBg: '#f59e0b',
  };

  onepieceInputTheme: GuessInputTheme = {
    inputBg: '#fff7ed',
    inputBorder: 'border-orange-300',
    inputText: 'text-orange-700',
    inputPlaceholder: 'placeholder-orange-400',
    dropdownBg: 'bg-orange-50',
    dropdownBorder: 'border-orange-300',
    dropdownItemHoverBg: 'hover:bg-orange-200',
    buttonBg: 'bg-red-500',
    buttonText: 'text-white',
    buttonHoverBg: 'hover:bg-red-600',
  };

  // Configuración del tablero
  boardColumns: GameColumn[] = [
    {
      key: 'name',
      label: 'Nombre',
      icon: '👤',
      width: 'w-20',
      height: 'h-20',
      type: 'image',
    },
    {
      key: 'genero',
      label: 'Género',
      icon: '⚧',
      width: 'w-24',
      height: 'h-24',
      type: 'text',
    },
    {
      key: 'afiliacion',
      label: 'Afiliación',
      icon: '🏴',
      width: 'w-24',
      height: 'h-24',
      type: 'text',
    },
    {
      key: 'fruta_del_diablo',
      label: 'Fruta',
      icon: '🍎',
      width: 'w-24',
      height: 'h-24',
      type: 'text',
    },
    {
      key: 'hakis',
      label: 'Hakis',
      icon: '⚡',
      width: 'w-24',
      height: 'h-24',
      type: 'text',
    },
    {
      key: 'ultima_recompensa',
      label: 'Recompensa',
      icon: '💰',
      width: 'w-24',
      height: 'h-24',
      type: 'numeric',
    },
    {
      key: 'altura',
      label: 'Altura',
      icon: '📏',
      width: 'w-24',
      height: 'h-24',
      type: 'numeric',
    },
    {
      key: 'origen',
      label: 'Origen',
      icon: '🗺️',
      width: 'w-24',
      height: 'h-24',
      type: 'text',
    },
    {
      key: 'primer_arco',
      label: 'Primer Arco',
      icon: '📚',
      width: 'w-24',
      height: 'h-24',
      type: 'numeric',
    },
  ];

  boardTheme: GameBoardTheme = {
    headerBg: 'bg-gradient-to-r from-yellow-400 to-orange-400',
    headerText: 'text-white',
    cellTheme: {
      correctBg: 'bg-green-500',
      partialBg: 'bg-yellow-400',
      incorrectBg: 'bg-red-500',
      correctText: 'text-white',
      partialText: 'text-white',
      incorrectText: 'text-white',
      imageOverlayBg: 'bg-black bg-opacity-50',
      imageOverlayText: 'text-white',
    },
  };

  // Configuración para el componente de resultado
  getGameResultConfig(): GameResultConfig {
    return {
      gameWon: this.gameWon,
      currentAttempt: this.currentAttempt,
      maxAttempts: this.config.maxAttempts,
      targetCharacter: this.targetCharacter,
      characterType: this.config.characterType,
      theme: {
        primaryBg: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        secondaryBg: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        textColor: '#c2410c',
        borderColor: '#f59e0b',
        icon: '🏴‍☠️',
        winIcon: '🏆',
        loseIcon: '💀',
      },
    };
  }

  getCharacterFields(): CharacterField[] {
    if (!this.targetCharacter) return [];

    return [
      {
        key: 'nombre',
        label: 'Nombre',
        icon: '👤',
        value: this.targetCharacter.nombre,
      },
      {
        key: 'genero',
        label: 'Género',
        icon: '⚧',
        value: this.targetCharacter.genero || 'N/A',
      },
      {
        key: 'afiliacion',
        label: 'Afiliación',
        icon: '🏴',
        value: this.targetCharacter.afiliacion || 'N/A',
      },
      {
        key: 'fruta_del_diablo',
        label: 'Fruta',
        icon: '🍎',
        value: this.targetCharacter.fruta_del_diablo || 'N/A',
      },
      {
        key: 'hakis',
        label: 'Hakis',
        icon: '⚡',
        value: this.targetCharacter.hakis?.join(', ') || 'N/A',
      },
      {
        key: 'ultima_recompensa',
        label: 'Última recompensa',
        icon: '💰',
        value: this.targetCharacter.ultima_recompensa,
        formatter: (value: any) =>
          this.getFormattedValue('ultima_recompensa', value),
      },
      {
        key: 'altura',
        label: 'Altura',
        icon: '📏',
        value: this.targetCharacter.altura,
        formatter: (value: any) => this.getFormattedValue('altura', value),
      },
      {
        key: 'origen',
        label: 'Origen',
        icon: '🗺️',
        value: this.targetCharacter.origen || 'N/A',
      },
    ];
  }

  ngOnInit(): void {
    this.setGameId(this.config.gameId);
    this.loadCharacters();
    this.audioService.initializeAudio(this.config.musicFile);
    this.progressLoaded.subscribe((progress) => {
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
        this.targetCharacter =
          this.characters.find(
            (char) =>
              char.id === targetData.id && char.nombre === targetData.nombre
          ) || null;
      }
    } catch (error) {
      console.error('Error al restaurar progreso:', error);
    }
  }

  private saveCurrentProgress(): void {
    try {
      const targetCharacterData = this.targetCharacter
        ? {
            id: this.targetCharacter.id,
            nombre: this.targetCharacter.nombre,
          }
        : null;
      const progressData = {
        currentAttempt: this.currentAttempt,
        gameWon: this.gameWon,
        gameLost: this.currentAttempt >= this.config.maxAttempts,
        attempts: this.guesses,
        maxAttempts: this.config.maxAttempts,
        gameData: {
          targetCharacter: targetCharacterData,
        },
      };
      this.updateProgress(progressData);
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  }

  private loadCharacters(): void {
    this.http.get<OnePieceCharacter[]>('personajes_one_piece.json').subscribe({
      next: (characters) => {
        this.characters = characters.filter(
          (char) => char.nombre && char.nombre.trim() !== ''
        );
        this.charactersLoaded = true;
        this.filteredCharacters = this.characters
          .slice()
          .sort((a, b) =>
            a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
          );
        this.initializeGame();
      },
      error: (error) => {
        console.error('❌ Error loading characters:', error);
        this.errorMessage =
          'Error al cargar los personajes. Intenta recargar la página.';
      },
    });
  }

  private initializeGame(): void {
    if (this.characters.length === 0) {
      return;
    }
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
    this.filteredCharacters = this.guessHandler
      .updateFilteredCharacters(
        this.characters,
        this.currentGuess,
        this.guesses,
        this.gameService
      )
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );
  }

  submitGuess(): void {
    // Validar el intento usando el servicio generalizado
    const validation = this.guessHandler.validateGuess(
      this.currentGuess,
      this.characters,
      this.guesses,
      this.gameService,
      this.config.characterType
    );

    if (!validation.isValid) {
      this.errorMessage = validation.errorMessage!;
      return;
    }

    const guessedCharacter = validation.guessedCharacter! as OnePieceCharacter;
    this.currentGuess = guessedCharacter.nombre;

    const guessResult = this.gameService.compareGuess(
      guessedCharacter,
      this.targetCharacter!
    );
    this.guesses.push(guessResult);

    // Procesar el resultado usando el servicio generalizado
    const result = this.guessHandler.processGuessResult(
      guessResult,
      this.currentAttempt,
      this.config.maxAttempts,
      this.targetCharacter!,
      guessedCharacter
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
    this.filteredCharacters = this.guessHandler
      .updateFilteredCharacters(
        this.characters,
        this.currentGuess,
        this.guesses,
        this.gameService
      )
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );
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

  getComparisonClass(status: CompareStatus): string {
    if (status === 'correct') return 'bg-green-500 text-white';
    if (status === 'partial') return 'bg-yellow-400 text-white';
    return 'bg-red-500 text-white';
  }

  getCharacterImageUrl(characterName: string): string {
    const character = this.characters.find(
      (char) => char.nombre === characterName
    );
    if (character?.img_url) {
      return character.img_url;
    }

    return '';
  }

  hasCharacterImage(characterName: string): boolean {
    return !!this.getCharacterImageUrl(characterName);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  continueGame(): void {
    this.hasSavedProgress = false;
  }

  protected isGamePlayedTodaySafe(): boolean {
    return this.isGamePlayedToday();
  }
  protected hasProgressSafe(): boolean {
    return this.hasProgress();
  }

  onSelectSuggestion(suggestion: { nombre: string }) {
    this.currentGuess = suggestion.nombre;
    this.filteredCharacters = [];
  }

  onPlayAgain(): void {
    // Reiniciar el juego
    this.initializeGame();
  }

  private mapStatus(status: CompareStatus): ComparisonStatus {
    switch (status) {
      case 'correct':
        return 'correct';
      case 'partial':
        return 'partial';
      case 'wrong':
        return 'wrong';
      default:
        return 'incorrect';
    }
  }

  // Método para convertir guesses al formato del tablero
  getBoardRows(): GameRow[] {
    return this.guesses
      .slice()
      .reverse()
      .map((guess) => ({
        name: {
          value: guess.name.value,
          status: this.mapStatus(guess.name.status),
          imageUrl: this.getCharacterImageUrl(guess.name.value),
          hasImage: this.hasCharacterImage(guess.name.value),
        },
        genero: {
          value: guess.genero.value || 'N/A',
          status: this.mapStatus(guess.genero.status),
        },
        afiliacion: {
          value: guess.afiliacion.value || 'N/A',
          status: this.mapStatus(guess.afiliacion.status),
        },
        fruta_del_diablo: {
          value: guess.fruta_del_diablo.value || 'N/A',
          status: this.mapStatus(guess.fruta_del_diablo.status),
        },
        hakis: {
          value: guess.hakis.value || 'N/A',
          status: this.mapStatus(guess.hakis.status),
        },
        ultima_recompensa: {
          value: guess.ultima_recompensa.value || 'N/A',
          status: this.mapStatus(guess.ultima_recompensa.status),
          arrow: guess.ultima_recompensa.arrow || undefined,
        },
        altura: {
          value: guess.altura.value || 'N/A',
          status: this.mapStatus(guess.altura.status),
          arrow: guess.altura.arrow || undefined,
        },
        origen: {
          value: guess.origen.value || 'N/A',
          status: this.mapStatus(guess.origen.status),
        },
        primer_arco: {
          value: guess.primer_arco.value || 'N/A',
          status: this.mapStatus(guess.primer_arco.status),
          arrow: guess.primer_arco.arrow || undefined,
        },
      }));
  }
}
