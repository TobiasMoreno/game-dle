import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseGameComponent } from '../../shared/components/base-game/base-game.component';
import { HighlightPipe } from './highlight.pipe';
import { GameProgress } from '../../shared/models/game.model';

interface OnePieceCharacter {
  id: number;
  name: string;
  size: string; // Ejemplo: "174cm" o "2m63"
  age: string;
  bounty: string; // Ejemplo: "3.000.000.000"
  crew?: {
    id: number;
    name: string;
    description: string | null;
    status: string;
    number: string;
    roman_name: string;
    total_prime: string;
    is_yonko: boolean;
  };
  fruit?: {
    id: number;
    name: string;
    description: string;
    type: string;
    filename: string;
    roman_name: string;
    technicalFile: string;
  };
  job: string;
  status: string;
}

type CompareStatus = 'correct' | 'partial' | 'wrong';
type Arrow = 'up' | 'down' | null;

interface GuessResult {
  name: { value: string; status: CompareStatus };
  crew: { value: string; status: CompareStatus };
  fruit: { value: string; status: CompareStatus };
  bounty: { value: string; status: CompareStatus; arrow: Arrow };
  size: { value: string; status: CompareStatus; arrow: Arrow };
  status: { value: string; status: CompareStatus };
  job: { value: string; status: CompareStatus };
}

@Component({
  selector: 'app-onepiecedle',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseGameComponent, HighlightPipe],
  templateUrl: './onepiecedle.component.html',
  styles: []
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
        this.targetCharacter = this.characters.find(char => 
          char.id === targetData.id && char.name === targetData.name
        ) || null;
      }
      
      console.log('Progreso restaurado:', progress);
      console.log('Personaje objetivo restaurado:', this.targetCharacter);
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
      const targetCharacterData = this.targetCharacter ? {
        id: this.targetCharacter.id,
        name: this.targetCharacter.name
      } : null;

      const progressData = {
        currentAttempt: this.currentAttempt,
        gameWon: this.gameWon,
        gameLost: this.currentAttempt >= this.maxAttempts,
        attempts: this.guesses,
        maxAttempts: this.maxAttempts,
        gameData: {
          targetCharacter: targetCharacterData
        }
      };

      console.log('Guardando progreso:', progressData);
      this.updateProgress(progressData);
      console.log('Progreso guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar progreso:', error);
    }
  }

  private parseBounty(bounty: string): number {
    // Elimina símbolos y puntos, convierte a número
    return Number(bounty.replace(/[^\d]/g, ''));
  }

  private parseSize(size: string): number {
    // Convierte "2m63" a 263, "174cm" a 174
    if (!size) return 0;
    if (size.includes('m')) {
      const match = size.match(/(\d+)m(\d+)?/);
      if (match) {
        const meters = Number(match[1]);
        const cm = match[2] ? Number(match[2]) : 0;
        return meters * 100 + cm;
      }
    }
    // Si es solo cm
    return Number(size.replace(/[^\d]/g, ''));
  }

  private compareNumeric(guess: number, target: number): { status: CompareStatus; arrow: Arrow } {
    if (guess === target) return { status: 'correct', arrow: null };
    if (guess < target) return { status: 'wrong', arrow: 'up' };
    return { status: 'wrong', arrow: 'down' };
  }

  private compareText(guess: string, target: string, allowPartial = true): CompareStatus {
    if (guess === target) return 'correct';
    if (allowPartial && guess && target && guess.toLowerCase() === target.toLowerCase()) return 'correct';
    // Solo permitir parcial para atributos que no sean crew
    if (allowPartial && guess && target && guess && target && guess !== target && guess.toLowerCase().includes(target.toLowerCase())) return 'partial';
    return 'wrong';
  }

  private compareGuess(guess: OnePieceCharacter, target: OnePieceCharacter): GuessResult {
    // Fruta parcial: mismo tipo
    const fruitPartial = !!(guess.fruit && target.fruit && guess.fruit.type === target.fruit.type);
    // Job parcial: mismo job (case-insensitive)
    const jobPartial = !!(guess.job && target.job && guess.job.toLowerCase().includes(target.job.toLowerCase()));

    return {
      name: {
        value: guess.name,
        status: this.compareText(guess.name, target.name)
      },
      crew: {
        value: guess.crew?.name || 'N/A',
        status: this.compareText(guess.crew?.name || '', target.crew?.name || '', false) // solo verde o rojo
      },
      fruit: {
        value: guess.fruit?.name || 'N/A',
        status: this.compareText(
          guess.fruit?.name || '',
          target.fruit?.name || '',
          fruitPartial
        )
      },
      bounty: {
        value: guess.bounty || 'N/A',
        ...this.compareNumeric(this.parseBounty(guess.bounty || '0'), this.parseBounty(target.bounty || '0'))
      },
      size: {
        value: guess.size || 'N/A',
        ...this.compareNumeric(this.parseSize(guess.size || ''), this.parseSize(target.size || ''))
      },
      status: {
        value: guess.status || 'N/A',
        status: this.compareText(guess.status || '', target.status || '')
      },
      job: {
        value: guess.job || 'N/A',
        status: this.compareText(
          guess.job || '',
          target.job || '',
          jobPartial
        )
      }
    };
  }

  /**
   * Carga los personajes desde la API
   */
  private loadCharacters(): void {
    console.log('Cargando personajes desde la API...');
    this.http.get<OnePieceCharacter[]>('https://api.api-onepiece.com/v2/characters/en')
      .subscribe({
        next: (characters) => {
          console.log('Personajes cargados:', characters.length);
          this.characters = characters.filter(char => 
            char.name && char.name.trim() !== '' && 
            char.status !== 'unknown' && 
            char.status !== ''
          );
          console.log('Personajes filtrados:', this.characters.length);
          this.charactersLoaded = true;
          this.filteredCharacters = this.characters;
          
          // Inicializar juego después de cargar personajes
          this.initializeGame();
        },
        error: (error) => {
          console.error('Error loading characters:', error);
          this.errorMessage = 'Error al cargar los personajes. Intenta recargar la página.';
        }
      });
  }

  /**
   * Inicializa el juego
   */
  private initializeGame(): void {
    // Si ya hay progreso guardado, no inicializar
    if (this.hasProgress()) {
      console.log('Ya hay progreso guardado, no inicializando juego');
      return;
    }

    // Si ya se jugó hoy, no inicializar
    if (this.isGamePlayedToday()) {
      console.log('Ya se jugó hoy, no inicializando juego');
      return;
    }

    // Verificar que los personajes estén cargados
    if (this.characters.length === 0) {
      console.log('Personajes no cargados aún, esperando...');
      return;
    }

    // Seleccionar personaje del día (basado en la fecha)
    this.targetCharacter = this.getCharacterOfTheDay();
    console.log('Personaje del día:', this.targetCharacter);
    
    this.currentAttempt = 0;
    this.gameWon = false;
    this.errorMessage = '';
    this.guesses = [];
    this.hasSavedProgress = false;

    // Guardar progreso inicial
    console.log('Inicializando juego y guardando progreso inicial...');
    this.saveCurrentProgress();
  }

  /**
   * Obtiene el personaje del día basado en la fecha
   */
  private getCharacterOfTheDay(): OnePieceCharacter {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return this.characters[dayOfYear % this.characters.length];
  }

  /**
   * Busca un personaje por nombre
   */
  private findCharacterByName(name: string): OnePieceCharacter | null {
    const normalizedName = name.toLowerCase().trim();
    return this.characters.find(char => 
      char.name.toLowerCase() === normalizedName
    ) || null;
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
    this.filteredCharacters = this.characters.filter(char => char.name.toLowerCase().startsWith(value));
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

    const guessResult = this.compareGuess(guessedCharacter, this.targetCharacter!);
    this.guesses.push(guessResult);
    
    // Verificar si ganó
    if (guessResult.name.status === 'correct') {
      this.gameWon = true;
      this.completeGame(true, this.currentAttempt + 1, { 
        targetCharacter: this.targetCharacter,
        guessedCharacter: guessedCharacter 
      });
    } else {
      this.currentAttempt++;
      
      // Verificar si perdió
      if (this.currentAttempt >= this.maxAttempts) {
        this.completeGame(false, this.maxAttempts, { 
          targetCharacter: this.targetCharacter,
          guessedCharacter: guessedCharacter 
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
  onGameCompleted(result: {won: boolean, attempts: number, gameData?: any}): void {
    console.log('One Piece DLE completado:', result);
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
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('localStorage disponible:', typeof localStorage !== 'undefined');
    
    if (typeof localStorage !== 'undefined') {
      console.log('Claves en localStorage:', Object.keys(localStorage));
      
      // Verificar datos de juegos
      const gamesData = localStorage.getItem('game-dle-data');
      console.log('Datos de juegos:', gamesData);
      
      // Verificar progreso
      const progressData = localStorage.getItem('game-progress');
      console.log('Datos de progreso:', progressData);
      
      // Verificar progreso específico de OnePieceDLE
      const onepieceProgress = this.gameStorage.getGameProgress('onepiecedle');
      console.log('Progreso OnePieceDLE:', onepieceProgress);
    }
    
    console.log('Estado actual del componente:');
    console.log('- currentAttempt:', this.currentAttempt);
    console.log('- gameWon:', this.gameWon);
    console.log('- guesses:', this.guesses);
    console.log('- targetCharacter:', this.targetCharacter);
    console.log('- hasSavedProgress:', this.hasSavedProgress);
    console.log('=== FIN DEBUG ===');
  }
}
