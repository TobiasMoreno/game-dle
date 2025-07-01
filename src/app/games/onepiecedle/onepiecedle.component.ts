import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { HighlightPipe } from './highlight.pipe';
import { GameProgress } from '../../shared/models/game.model';

interface OnePieceCharacter {
  id: number;
  nombre: string;
  genero: string;
  afiliacion: string;
  fruta_del_diablo: string;
  hakis: string[];
  ultima_recompensa: number;
  altura: number;
  primer_arco: string;
}

type CompareStatus = 'correct' | 'partial' | 'wrong';
type Arrow = 'up' | 'down' | null;

interface GuessResult {
  name: { value: string; status: CompareStatus };
  genero: { value: string; status: CompareStatus };
  afiliacion: { value: string; status: CompareStatus };
  fruta_del_diablo: { value: string; status: CompareStatus };
  hakis: { value: string; status: CompareStatus };
  ultima_recompensa: { value: string; status: CompareStatus; arrow: Arrow };
  altura: { value: string; status: CompareStatus; arrow: Arrow };
  primer_arco: { value: string; status: CompareStatus };
}

@Component({
  selector: 'app-onepiecedle',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseGameComponent, HighlightPipe],
  templateUrl: './onepiecedle.component.html',
  styles: [],
})
export class OnePieceDLEComponent extends BaseGameComponent implements OnInit {
  readonly maxAttempts = 6;
  private http: HttpClient = inject(HttpClient);

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

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadCharacters();

    // Escuchar cuando se carga el progreso
    this.progressLoaded.subscribe((progress) => {
      if (progress) {
        this.restoreProgress(progress);
      }
    });
  }

  /**
   * Restaura el progreso guardado
   */
  private restoreProgress(progress: GameProgress): void {
    try {
      this.currentAttempt = progress.currentAttempt;
      this.gameWon = progress.gameWon;
      this.guesses = progress.attempts || [];
      this.hasSavedProgress = true;

      // Restaurar personaje objetivo si está guardado
      if (progress.gameData?.targetCharacter && this.characters.length > 0) {
        const targetData = progress.gameData.targetCharacter;
        this.targetCharacter =
          this.characters.find(
            (char) => char.id === targetData.id && char.nombre === targetData.nombre
          ) || null;
      }
    } catch (error) {
      console.error('Error al restaurar progreso:', error);
    }
  }

  /**
   * Guarda el progreso actual
   */
  private saveCurrentProgress(): void {
    try {
      // Solo guardar datos esenciales del personaje objetivo para evitar problemas de serialización
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

  private compareText(
    guess: string,
    target: string,
    allowPartial = true
  ): CompareStatus {
    if (guess === target) return 'correct';
    if (
      allowPartial &&
      guess &&
      target &&
      guess.toLowerCase() === target.toLowerCase()
    )
      return 'correct';
    // Solo permitir parcial para atributos que no sean crew
    if (
      allowPartial &&
      guess &&
      target &&
      guess &&
      target &&
      guess !== target &&
      guess.toLowerCase().includes(target.toLowerCase())
    )
      return 'partial';
    return 'wrong';
  }

  private compareNumeric(guess: number, target: number): { status: CompareStatus; arrow: Arrow } {
    if (guess === target) return { status: 'correct', arrow: null };
    if (guess < target) return { status: 'wrong', arrow: 'up' };
    return { status: 'wrong', arrow: 'down' };
  }

  private compareHakis(guess: string[], target: string[]): CompareStatus {
    if (!guess || !target) return 'wrong';
    
    const guessSet = new Set(guess.map(h => h.toLowerCase()));
    const targetSet = new Set(target.map(h => h.toLowerCase()));
    
    // Si son exactamente iguales
    if (guessSet.size === targetSet.size && 
        [...guessSet].every(h => targetSet.has(h))) {
      return 'correct';
    }
    
    // Si hay al menos uno en común
    const hasCommon = [...guessSet].some(h => targetSet.has(h));
    if (hasCommon) return 'partial';
    
    return 'wrong';
  }

  private compareGuess(
    guess: OnePieceCharacter,
    target: OnePieceCharacter
  ): GuessResult {
    return {
      name: {
        value: guess.nombre,
        status: this.compareText(guess.nombre, target.nombre),
      },
      genero: {
        value: guess.genero || 'N/A',
        status: this.compareText(
          guess.genero || '',
          target.genero || '',
          false
        ), // solo verde o rojo
      },
      afiliacion: {
        value: guess.afiliacion || 'N/A',
        status: this.compareText(
          guess.afiliacion || '',
          target.afiliacion || '',
          true
        ),
      },
      fruta_del_diablo: {
        value: guess.fruta_del_diablo || 'N/A',
        status: this.compareText(
          guess.fruta_del_diablo || '',
          target.fruta_del_diablo || '',
          true
        ),
      },
      hakis: {
        value: guess.hakis.join(', ') || 'N/A',
        status: this.compareHakis(guess.hakis || [], target.hakis || []),
      },
      ultima_recompensa: {
        value: guess.ultima_recompensa.toString() || 'N/A',
        ...this.compareNumeric(guess.ultima_recompensa || 0, target.ultima_recompensa || 0),
      },
      altura: {
        value: (guess.altura || 0).toString(),
        ...this.compareNumeric(guess.altura || 0, target.altura || 0),
      },
      primer_arco: {
        value: guess.primer_arco || 'N/A',
        status: this.compareText(
          guess.primer_arco || '',
          target.primer_arco || '',
          true
        ),
      },
    };
  }

  /**
   * Carga los personajes desde la API
   */
  private loadCharacters(): void {
    this.http
      .get<OnePieceCharacter[]>('personajes_one_piece.json')
      .subscribe({
        next: (characters) => {
          this.characters = characters.filter(
            (char) =>
              char.nombre &&
              char.nombre.trim() !== ''
          );
          this.charactersLoaded = true;
          this.filteredCharacters = this.characters;

          // Inicializar juego después de cargar personajes
          this.initializeGame();
        },
        error: (error) => {
          console.error('Error loading characters:', error);
          this.errorMessage =
            'Error al cargar los personajes. Intenta recargar la página.';
        },
      });
  }

  /**
   * Inicializa el juego
   */
  private initializeGame(): void {
    // Si ya hay progreso guardado, no inicializar
    if (this.hasProgress()) {
      return;
    }

    // Si ya se jugó hoy, no inicializar
    if (this.isGamePlayedToday()) {
      return;
    }

    // Verificar que los personajes estén cargados
    if (this.characters.length === 0) {
      return;
    }

    // Seleccionar personaje aleatorio
    this.targetCharacter = this.getRandomCharacter();
    console.log(this.targetCharacter);

    this.currentAttempt = 0;
    this.gameWon = false;
    this.errorMessage = '';
    this.guesses = [];
    this.hasSavedProgress = false;

    // Guardar progreso inicial
    this.saveCurrentProgress();
  }

  /**
   * Obtiene el personaje del día basado en la fecha
   */
  private getRandomCharacter(): OnePieceCharacter {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  /**
   * Busca un personaje por nombre
   */
  private findCharacterByName(name: string): OnePieceCharacter | null {
    const normalizedName = name.toLowerCase().trim();
    return (
      this.characters.find(
        (char) => char.nombre.toLowerCase() === normalizedName
      ) || null
    );
  }

  /**
   * Maneja el cambio en el input
   */
  onInputChange(event: any): void {
    this.currentGuess = event.target.value;
    this.errorMessage = '';
    const value = this.currentGuess.toLowerCase().trim();
    if (value.length === 0) {
      this.filteredCharacters = [];
      return;
    }
    this.filteredCharacters = this.characters.filter((char) =>
      char.nombre.toLowerCase().startsWith(value)
    );
  }

  selectCharacter(event: any): void {
    const value = event && event.target ? event.target.value : event;
    this.currentGuess = value;
    this.filteredCharacters = [];
  }

  /**
   * Envía el intento
   */
  submitGuess(): void {
    if (!this.currentGuess.trim()) {
      this.errorMessage = 'Por favor ingresa un nombre';
      return;
    }

    const guessedCharacter = this.findCharacterByName(this.currentGuess);
    if (!guessedCharacter) {
      this.errorMessage = 'Personaje no encontrado. Intenta con otro nombre.';
      return;
    }

    const guessResult = this.compareGuess(
      guessedCharacter,
      this.targetCharacter!
    );
    this.guesses.push(guessResult);

    // Verificar si ganó
    if (guessResult.name.status === 'correct') {
      this.gameWon = true;
      this.completeGame(true, this.currentAttempt + 1, {
        targetCharacter: this.targetCharacter,
        guessedCharacter: guessedCharacter,
      });
    } else {
      this.currentAttempt++;

      // Verificar si perdió
      if (this.currentAttempt >= this.maxAttempts) {
        this.completeGame(false, this.maxAttempts, {
          targetCharacter: this.targetCharacter,
          guessedCharacter: guessedCharacter,
        });
      } else {
        // Guardar progreso después de cada intento
        this.saveCurrentProgress();
      }
    }

    this.currentGuess = '';
    this.filteredCharacters = [];
  }

  /**
   * Obtiene la clase CSS para la comparación
   */
  getComparisonClass(status: CompareStatus): string {
    if (status === 'correct') return 'bg-green-500 text-white';
    if (status === 'partial') return 'bg-yellow-400 text-white';
    return 'bg-red-500 text-white';
  }

  /**
   * Maneja la finalización del juego
   */
  onGameCompleted(result: {
    won: boolean;
    attempts: number;
    gameData?: any;
  }): void {
  }

  /**
   * Continúa el juego guardado
   */
  continueGame(): void {
    this.hasSavedProgress = false;
  }

  /**
   * Método de debug para verificar el estado del localStorage
   */
  debugLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const gamesData = localStorage.getItem('game-dle-data');

      const progressData = localStorage.getItem('game-progress');

      const onepieceProgress = this.gameStorage.getGameProgress('onepiecedle');
    }
  }
}
