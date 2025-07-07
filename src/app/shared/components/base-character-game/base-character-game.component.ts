import { BaseCharacter } from '../../services/guess-handler.service';

export interface CharacterGameConfig {
  gameId: string;
  maxAttempts: number;
  charactersFile: string;
  musicFile: string;
  characterType: string;
}

/**
 * Clase base abstracta que define la estructura común para juegos de personajes
 * Esta clase proporciona métodos y propiedades que son comunes entre diferentes juegos
 */
export abstract class BaseCharacterGameComponent<T extends BaseCharacter> {

  // Propiedades comunes que deben estar disponibles en las clases hijas
  abstract characters: T[];
  abstract filteredCharacters: T[];
  abstract targetCharacter: T | null;
  abstract guesses: any[];
  abstract currentGuess: string;
  abstract currentAttempt: number;
  abstract gameWon: boolean;
  abstract errorMessage: string;
  abstract charactersLoaded: boolean;
  abstract hasSavedProgress: boolean;
  abstract revealedColumns: number[];

  // Configuración específica del juego
  abstract readonly config: CharacterGameConfig;
  abstract readonly gameService: any;

  // Métodos abstractos que deben ser implementados por las clases hijas
  abstract getFormattedValue(field: string, value: any): string;
  abstract getCharacterImageUrl(characterName: string): string;
  abstract hasCharacterImage(characterName: string): boolean;
  abstract onImageError(event: Event): void;
  abstract getBoardRows(): any[];
  abstract submitGuess(): void;
  abstract onInputChange(value: string): void;
  abstract selectCharacter(nombre: string, autoSubmit?: boolean): void;
  abstract onSelectSuggestion(suggestion: { nombre: string }): void;
  abstract continueGame(): void;
  abstract isGamePlayedTodaySafe(): boolean;
  abstract hasProgressSafe(): boolean;
} 