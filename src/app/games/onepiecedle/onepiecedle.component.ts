import { Component, inject, OnInit } from '@angular/core';
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
export class OnePieceDLEComponent extends BaseGameComponent implements OnInit {
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

  ngOnInit(): void {
    console.log('🚀 OnePieceDLE ngOnInit iniciado');
    this.setGameId(this.gameId);
    this.loadCharacters();
    this.progressLoaded.subscribe((progress) => {
      console.log('📊 Progreso cargado:', progress);
      if (progress) {
        console.log('🔄 Restaurando progreso...');
        this.restoreProgress(progress);
      }
    });
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
    this.filteredCharacters = this.onePieceService.filterCharacters(
      this.characters,
      this.currentGuess
    );
  }

  submitGuess(): void {
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
