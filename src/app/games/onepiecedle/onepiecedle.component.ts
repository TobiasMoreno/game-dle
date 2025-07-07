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

@Component({
  selector: 'app-onepiecedle',
  imports: [
    FormsModule,
    BaseGameComponent,
    MusicControlsComponent,
    GuessInputComponent,
    GameBoardComponent,
  ],
  templateUrl: './onepiecedle.component.html',
  styleUrls: ['./onepiecedle.component.css'],
})
export class OnePieceDLEComponent
  extends BaseGameComponent
  implements OnInit, OnDestroy
{
  readonly maxAttempts = 6;
  readonly gameId = 'onepiecedle';
  private http: HttpClient = inject(HttpClient);
  private onePieceService: OnePieceGameService = inject(OnePieceGameService);
  private audioService: AudioService = inject(AudioService);

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

  ngOnInit(): void {
    this.setGameId(this.gameId);
    this.loadCharacters();
    this.audioService.initializeAudio('one-piece-soundtrack.mp3');
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
        gameLost: this.currentAttempt >= this.maxAttempts,
        attempts: this.guesses,
        maxAttempts: this.maxAttempts,
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
        this.filteredCharacters = this.characters.slice().sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
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
    const guessedNames = this.guesses.map((g) => g.name.value);
    this.filteredCharacters = this.onePieceService
      .filterCharacters(this.characters, this.currentGuess, guessedNames)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
  }

  submitGuess(): void {
    if (!this.currentGuess.trim()) {
      this.errorMessage = 'Por favor ingresa un nombre';
      return;
    }
    // Validar si el personaje ya fue adivinado
    const guessedNames = this.guesses.map((g) => g.name.value.toLowerCase());
    if (guessedNames.includes(this.currentGuess.trim().toLowerCase())) {
      this.errorMessage = 'Ya adivinaste ese personaje. Intenta con otro.';
      return;
    }
    let guessedCharacter = this.onePieceService.findCharacterByName(
      this.characters,
      this.currentGuess
    );
    if (!guessedCharacter && this.filteredCharacters.length > 0) {
      guessedCharacter = this.filteredCharacters[0];
      this.currentGuess = guessedCharacter.nombre;
    }
    if (!guessedCharacter) {
      this.errorMessage = 'Personaje no encontrado. Intenta con otro nombre.';
      return;
    }
    const guessResult = this.onePieceService.compareGuess(
      guessedCharacter,
      this.targetCharacter!
    );
    this.guesses.push(guessResult);
    if (guessResult.name.status === 'correct') {
      this.gameWon = true;
      this.completeGame(true, this.currentAttempt + 1, {
        targetCharacter: this.targetCharacter,
        guessedCharacter: guessedCharacter,
      });
    } else {
      this.currentAttempt++;
      if (this.currentAttempt >= this.maxAttempts) {
        this.completeGame(false, this.maxAttempts, {
          targetCharacter: this.targetCharacter,
          guessedCharacter: guessedCharacter,
        });
      } else {
        this.saveCurrentProgress();
      }
    }
    this.currentGuess = '';
    const guessedNamesAfter = this.guesses.map((g) => g.name.value);
    this.filteredCharacters = this.onePieceService
    .filterCharacters(this.characters, this.currentGuess, guessedNamesAfter)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));
}

  selectCharacter(nombre: string, autoSubmit: boolean = false): void {
    this.currentGuess = nombre;
    this.filteredCharacters = [];
    if (autoSubmit) {
      setTimeout(() => this.submitGuess(), 0);
    }
  }

  getFormattedValue(field: string, value: any): string {
    return this.onePieceService.getFormattedValue(field, value);
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
