import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import { AudioService } from '../../shared/services/audio.service';
import { MusicControlsComponent, MusicControlsTheme } from '../../shared/components/music-controls/music-controls.component';
import { GuessInputComponent } from '../../shared/components/guess-input/guess-input.component';
import {
  LoLGameService,
  LoLCharacter,
  CompareStatus,
  GuessResult,
} from './loldle-game.service';

@Component({
  selector: 'app-loldle',
  imports: [FormsModule, BaseGameComponent, MusicControlsComponent, GuessInputComponent],
  templateUrl: './loldle.component.html',
  styleUrls: ['./loldle.component.css'],
})
export class LoldleComponent extends BaseGameComponent implements OnInit, OnDestroy {
  readonly maxAttempts = 6;
  readonly gameId = 'loldle';
  private http: HttpClient = inject(HttpClient);
  private lolService: LoLGameService = inject(LoLGameService);
  private audioService: AudioService = inject(AudioService);

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

  lolInputTheme = {
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

  ngOnInit(): void {
    console.log('🚀 LoLDLE ngOnInit iniciado');
    this.setGameId(this.gameId);
    this.loadCharacters();
    this.audioService.initializeAudio('warriors-lol.mp3');
    this.progressLoaded.subscribe((progress) => {
      console.log('📊 Progreso cargado:', progress);
      if (progress) {
        console.log('🔄 Restaurando progreso...');
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
    console.log('🔄 Iniciando carga de campeones...');
    this.http.get<LoLCharacter[]>('campeones_lol.json').subscribe({
      next: (characters) => {
        console.log('📥 Campeones cargados desde JSON:', characters.length);
        this.characters = characters.filter(
          (char) => char.nombre && char.nombre.trim() !== ''
        );
        console.log('✅ Campeones filtrados:', this.characters.length);
        console.log('📋 Primeros 3 campeones:', this.characters.slice(0, 3));
        this.charactersLoaded = true;
        this.filteredCharacters = this.characters;
        console.log('🎮 Inicializando juego después de cargar campeones...');
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
      console.log('❌ No hay campeones cargados, no inicializando');
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
    const guessedNames = this.guesses.map((g) => g.name.value);
    this.filteredCharacters = this.lolService.filterCharacters(
      this.characters,
      value,
      guessedNames
    );
  }

  onSelectSuggestion(suggestion: { nombre: string }) {
    this.currentGuess = suggestion.nombre;
    this.filteredCharacters = [];
  }

  submitGuess(): void {
    if (!this.currentGuess.trim()) {
      this.errorMessage = 'Por favor ingresa un nombre';
      return;
    }
    let guessedCharacter = this.lolService.findCharacterByName(
      this.characters,
      this.currentGuess
    );
    if (!guessedCharacter && this.filteredCharacters.length > 0) {
      guessedCharacter = this.filteredCharacters[0];
      this.currentGuess = guessedCharacter.nombre;
    }
    if (!guessedCharacter) {
      this.errorMessage = 'Campeón no encontrado. Intenta con otro nombre.';
      return;
    }
    const guessResult = this.lolService.compareGuess(
      guessedCharacter,
      this.targetCharacter!
    );
    this.guesses.push(guessResult);
    this.revealedColumns.unshift(0);
    this.revealNextColumn();
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
    return this.lolService.getFormattedValue(field, value);
  }

  getComparisonClass(status: CompareStatus): string {
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
}
