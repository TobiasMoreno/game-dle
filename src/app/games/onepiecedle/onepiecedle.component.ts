import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { GameProgress } from '../../shared/models/game.model';
import {
  OnePieceGameService,
  OnePieceCharacter,
  CompareStatus,
  GuessResult,
} from './onepiece-game.service';

@Component({
  selector: 'app-onepiecedle',
  imports: [FormsModule, BaseGameComponent],
  templateUrl: './onepiecedle.component.html',
  styles: [],
})
export class OnePieceDLEComponent extends BaseGameComponent implements OnInit, OnDestroy {
  readonly maxAttempts = 6;
  readonly gameId = 'onepiecedle';
  private http: HttpClient = inject(HttpClient);
  private onePieceService: OnePieceGameService = inject(OnePieceGameService);

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

  // Propiedades para el audio
  private audio: HTMLAudioElement | null = null;
  isMusicPlaying: boolean = false;
  isMusicMuted: boolean = false;
  musicVolume: number = 0.3;

  ngOnInit(): void {
    console.log('🚀 OnePieceDLE ngOnInit iniciado');
    this.setGameId(this.gameId);
    this.loadCharacters();
    this.initializeAudio();
    this.progressLoaded.subscribe((progress) => {
      console.log('📊 Progreso cargado:', progress);
      if (progress) {
        console.log('🔄 Restaurando progreso...');
        this.restoreProgress(progress);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopMusic();
  }

  private initializeAudio(): void {
    try {
      // URL del archivo MP3 local
      const musicUrl = 'one-piece-soundtrack.mp3'; // Ajusta el nombre del archivo según lo que pusiste
      
      this.audio = new Audio(musicUrl);
      this.audio.loop = true;
      this.audio.volume = this.musicVolume;
      this.audio.preload = 'auto';
      
      this.startMusic();
    } catch (error) {
      console.error('❌ Error al inicializar audio:', error);
    }
  }

  startMusic(): void {
    if (this.audio && !this.isMusicPlaying && !this.isMusicMuted) {
      this.audio.play().then(() => {
        this.isMusicPlaying = true;
      }).catch((error) => {
        console.error('❌ Error al reproducir música:', error);
      });
    }
  }

  stopMusic(): void {
    if (this.audio && this.isMusicPlaying) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isMusicPlaying = false;
    }
  }

  toggleMusic(): void {
    if (this.isMusicMuted) {
      this.isMusicMuted = false;
      this.startMusic();
    } else {
      this.isMusicMuted = true;
      this.stopMusic();
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.musicVolume;
    }
  }

  onVolumeChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.setMusicVolume(parseFloat(target.value));
    }
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
    console.log('🔄 Iniciando carga de personajes...');
    this.http.get<OnePieceCharacter[]>('personajes_one_piece.json').subscribe({
      next: (characters) => {
        console.log('📥 Personajes cargados desde JSON:', characters.length);
        this.characters = characters.filter(
          (char) => char.nombre && char.nombre.trim() !== ''
        );
        console.log('✅ Personajes filtrados:', this.characters.length);
        console.log('📋 Primeros 3 personajes:', this.characters.slice(0, 3));
        this.charactersLoaded = true;
        this.filteredCharacters = this.characters;
        console.log('🎮 Inicializando juego después de cargar personajes...');
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
      console.log('❌ No hay personajes cargados, no inicializando');
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

  onInputChange(event: any): void {
    this.currentGuess = event.target.value;
    this.errorMessage = '';
    const guessedNames = this.guesses.map((g) => g.name.value);
    this.filteredCharacters = this.onePieceService.filterCharacters(
      this.characters,
      this.currentGuess,
      guessedNames
    );
  }

  submitGuess(): void {
    // Iniciar música en la primera interacción del usuario
    if (!this.isMusicPlaying && !this.isMusicMuted) {
      this.startMusic();
    }

    if (!this.currentGuess.trim()) {
      this.errorMessage = 'Por favor ingresa un nombre';
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
      if (col < 9) {
        setTimeout(() => {
          this.revealedColumns[0] = col + 1;
          reveal(col + 1);
        }, 300);
      }
    };
    reveal(0);
  }

  selectCharacter(nombre: string, autoSubmit: boolean = false): void {
    // Iniciar música en la primera interacción del usuario
    if (!this.isMusicPlaying && !this.isMusicMuted) {
      this.startMusic();
    }

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
