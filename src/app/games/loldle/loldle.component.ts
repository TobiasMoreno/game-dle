import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { AudioService } from '../../shared/services/audio.service';
import { MusicControlsComponent, MusicControlsTheme } from '../../shared/components/music-controls/music-controls.component';
import { GuessInputComponent, GuessInputTheme } from '../../shared/components/guess-input/guess-input.component';
import {
  LoLGameService,
  LoLCharacter,
  CompareStatus as LoLCompareStatus,
  GuessResult,
} from './loldle-game.service';
import { 
  GameBoardComponent, 
  GameColumn, 
  GameRow, 
  GameBoardTheme,
} from '../../shared/components/game-board';
import { ComparisonStatus } from '../../shared/components/game-cell/game-cell.component';
import { GuessHandlerService } from '../../shared/services/guess-handler.service';
import { CharacterGameConfig } from '../../shared/components/base-character-game/base-character-game.component';
import {
  GameResultComponent,
  GameResultConfig,
  CharacterField,
} from '../../shared/components/game-result';

@Component({
  selector: 'app-loldle',
  imports: [FormsModule, BaseGameComponent, MusicControlsComponent, GuessInputComponent, GameBoardComponent, GameResultComponent],
  templateUrl: './loldle.component.html',
  styleUrls: ['./loldle.component.css'],
})
export class LoldleComponent extends BaseGameComponent implements OnInit, OnDestroy {
  // Configuración del juego usando la interfaz generalizada
  readonly config: CharacterGameConfig = {
    gameId: 'loldle',
    maxAttempts: 6,
    charactersFile: 'campeones_lol.json',
    musicFile: 'warriors-lol.mp3',
    characterType: 'campeón'
  };

  // Servicios inyectados
  private http: HttpClient = inject(HttpClient);
  readonly gameService: LoLGameService = inject(LoLGameService);
  private audioService: AudioService = inject(AudioService);
  private guessHandler: GuessHandlerService = inject(GuessHandlerService);

  characters: LoLCharacter[] = [];
  filteredCharacters: LoLCharacter[] = [];
  targetCharacter: LoLCharacter | null = null;
  guesses: GuessResult[] = [];
  currentGuess: string = '';
  currentAttempt: number = 0;
  gameWon: boolean = false;
  errorMessage: string = '';
  charactersLoaded: boolean = false;
  hasSavedProgress: boolean = false;
  revealedColumns: number[] = [];

  // Tema para los controles de música
  lolTheme: MusicControlsTheme = {
    buttonBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    buttonHoverBg: 'hover:from-yellow-400 hover:to-orange-400',
    buttonTextColor: 'text-white',
    volumeTextColor: '#1f2937',
    sliderBg: '#fef3c7',
    sliderThumbBg: '#c89b3c'
  };

  lolInputTheme: GuessInputTheme = {
    inputBg: '#f0e6d2',
    inputBorder: 'border-yellow-400',
    inputText: 'text-blue-900',
    inputPlaceholder: 'placeholder-yellow-600',
    dropdownBg: 'bg-yellow-50',
    dropdownBorder: 'border-yellow-400',
    dropdownItemHoverBg: 'hover:bg-yellow-200',
    buttonBg: 'bg-gradient-to-r from-orange-500 to-red-600',
    buttonText: 'text-white',
    buttonHoverBg: 'hover:from-orange-400 hover:to-red-500'
  };

  // Configuración del tablero
  boardColumns: GameColumn[] = [
    { key: 'name', label: 'Nombre', icon: '👤', width: 'w-24', height: 'h-24', type: 'image' },
    { key: 'genero', label: 'Género', icon: '⚧', width: 'w-24', height: 'h-24', type: 'text' },
    { key: 'posicion', label: 'Posición', icon: '🎯', width: 'w-24', height: 'h-24', type: 'text' },
    { key: 'especie', label: 'Especie', icon: '🧬', width: 'w-24', height: 'h-24', type: 'text' },
    { key: 'recurso', label: 'Recurso', icon: '⚡', width: 'w-24', height: 'h-24', type: 'text' },
    { key: 'tipo_de_gama', label: 'Tipo', icon: '🗡️', width: 'w-24', height: 'h-24', type: 'text' },
    { key: 'region', label: 'Región', icon: '🗺️', width: 'w-24', height: 'h-24', type: 'text' },
    { key: 'anio_de_lanzamiento', label: 'Año', icon: '📅', width: 'w-24', height: 'h-24', type: 'numeric' }
  ];

  boardTheme: GameBoardTheme = {
    headerBg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
    headerText: 'text-white',
    cellTheme: {
      correctBg: 'bg-green-500',
      partialBg: 'bg-yellow-400',
      incorrectBg: 'bg-red-500',
      correctText: 'text-white',
      partialText: 'text-white',
      incorrectText: 'text-white',
      imageOverlayBg: 'bg-black bg-opacity-50',
      imageOverlayText: 'text-white'
    }
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
        primaryBg: 'linear-gradient(135deg, #c89b3c 0%, #f0e6d2 100%)',
        secondaryBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        textColor: '#92400e',
        borderColor: '#f59e0b',
        icon: '⚔️',
        winIcon: '🏆',
        loseIcon: '💀'
      }
    };
  }

  getCharacterFields(): CharacterField[] {
    if (!this.targetCharacter) return [];
    
    return [
      {
        key: 'nombre',
        label: 'Nombre',
        icon: '👤',
        value: this.targetCharacter.nombre
      },
      {
        key: 'genero',
        label: 'Género',
        icon: '⚧',
        value: this.targetCharacter.genero || 'N/A'
      },
      {
        key: 'posicion',
        label: 'Posición',
        icon: '🎯',
        value: this.targetCharacter.posicion?.join(', ') || 'N/A'
      },
      {
        key: 'especie',
        label: 'Especie',
        icon: '🧬',
        value: this.targetCharacter.especie?.join(', ') || 'N/A'
      },
      {
        key: 'recurso',
        label: 'Recurso',
        icon: '⚡',
        value: this.targetCharacter.recurso?.join(', ') || 'N/A'
      },
      {
        key: 'tipo_de_gama',
        label: 'Tipo de Gama',
        icon: '🗡️',
        value: this.targetCharacter.tipo_de_gama?.join(', ') || 'N/A'
      },
      {
        key: 'region',
        label: 'Región',
        icon: '🗺️',
        value: this.targetCharacter.region?.join(', ') || 'N/A'
      },
      {
        key: 'anio_de_lanzamiento',
        label: 'Año de Lanzamiento',
        icon: '📅',
        value: this.targetCharacter.anio_de_lanzamiento,
        formatter: (value: any) => this.getFormattedValue('anio_de_lanzamiento', value)
      }
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
    this.http.get<LoLCharacter[]>(this.config.charactersFile).subscribe({
      next: (characters) => {
        this.characters = characters.filter(
          (char) => char.nombre && char.nombre.trim() !== ''
        );
        this.charactersLoaded = true;
        this.filteredCharacters = this.characters.sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.initializeGame();
      },
      error: (error) => {
        console.error('❌ Error loading characters:', error);
        this.errorMessage =
          'Error al cargar los campeones. Intenta recargar la página.';
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

  private getRandomCharacter(): LoLCharacter {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  onGuessInputChange(value: string) {
    this.currentGuess = value;
    this.errorMessage = '';
    this.filteredCharacters = this.guessHandler.updateFilteredCharacters(
      this.characters,
      value,
      this.guesses,
      this.gameService
    );
  }

  onSelectSuggestion(suggestion: { nombre: string }) {
    this.currentGuess = suggestion.nombre;
    this.filteredCharacters = [];
  }

  onPlayAgain(): void {
    // Reiniciar el juego
    this.initializeGame();
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

    const guessedCharacter = validation.guessedCharacter! as LoLCharacter;
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
  }

  revealNextColumn(): void {
    if (this.revealedColumns.length === 0) return;
    const reveal = (col: number) => {
      if (col == 0) {
        setTimeout(() => {}, 0);
      }
      if (col < 8) {
        setTimeout(() => {
          this.revealedColumns[0] = col + 1;
          reveal(col + 1);
        }, 300);
      }
    };
    reveal(0);
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

  getComparisonClass(status: LoLCompareStatus): string {
    if (status === 'correct') return 'bg-green-500 text-white';
    if (status === 'partial') return 'bg-yellow-400 text-white';
    return 'bg-red-500 text-white';
  }

  getCharacterImageUrl(characterName: string): string {
    const character = this.characters.find(char => char.nombre === characterName);
    if (character?.img_url) {
      return character.img_url;
    }
    // Fallback: buscar por nombre similar si no se encuentra exacto
    const similarCharacter = this.characters.find(char => 
      char.nombre.toLowerCase().includes(characterName.toLowerCase()) ||
      characterName.toLowerCase().includes(char.nombre.toLowerCase())
    );
    return similarCharacter?.img_url || '';
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

  // Método para convertir guesses al formato del tablero
  getBoardRows(): GameRow[] {
    // El orden y las claves deben coincidir exactamente con boardColumns
    return this.guesses.slice().reverse().map((guess) => ({
      name: {
        value: guess.name.value || 'N/A',
        status: this.mapStatus(guess.name.status),
        imageUrl: this.getCharacterImageUrl(guess.name.value),
        hasImage: this.hasCharacterImage(guess.name.value)
      },
      genero: {
        value: guess.genero.value || 'N/A',
        status: this.mapStatus(guess.genero.status)
      },
      posicion: {
        value: guess.posicion.value || 'N/A',
        status: this.mapStatus(guess.posicion.status)
      },
      especie: {
        value: guess.especie.value || 'N/A',
        status: this.mapStatus(guess.especie.status)
      },
      recurso: {
        value: guess.recurso.value || 'N/A',
        status: this.mapStatus(guess.recurso.status)
      },
      tipo_de_gama: {
        value: guess.tipo_de_gama.value || 'N/A',
        status: this.mapStatus(guess.tipo_de_gama.status)
      },
      region: {
        value: Array.isArray(guess.region.value) ? guess.region.value.join(', ') : guess.region.value || 'N/A',
        status: this.mapStatus(guess.region.status)
      },
      anio_de_lanzamiento: {
        value: guess.anio_de_lanzamiento.value || 'N/A',
        status: this.mapStatus(guess.anio_de_lanzamiento.status),
        arrow: guess.anio_de_lanzamiento.arrow || undefined
      }
    }));
  }

  private mapStatus(status: LoLCompareStatus): ComparisonStatus {
    switch (status) {
      case 'correct':
        return 'correct';
      case 'partial':
        return 'partial';
      case 'wrong':
        return 'incorrect';
      default:
        return 'incorrect';
    }
  }
}
