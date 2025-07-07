import { Injectable } from '@angular/core';

export interface BaseCharacter {
  id: number;
  nombre: string;
  [key: string]: any;
}

export interface GuessValidationResult {
  isValid: boolean;
  errorMessage?: string;
  guessedCharacter?: BaseCharacter;
}

export interface GuessSubmissionResult {
  gameWon: boolean;
  shouldContinue: boolean;
  gameData: any;
}

@Injectable({
  providedIn: 'root'
})
export class GuessHandlerService {

  /**
   * Valida si el intento es válido
   */
  validateGuess(
    currentGuess: string,
    characters: BaseCharacter[],
    guesses: any[],
    gameService: any,
    characterType: string = 'personaje'
  ): GuessValidationResult {
    // Validar que no esté vacío
    if (!currentGuess.trim()) {
      return {
        isValid: false,
        errorMessage: 'Por favor ingresa un nombre'
      };
    }

    // Validar que no haya sido adivinado antes
    const guessedNames = guesses.map((g: any) => g.name.value.toLowerCase());
    if (guessedNames.includes(currentGuess.trim().toLowerCase())) {
      return {
        isValid: false,
        errorMessage: `Ya adivinaste ese ${characterType}. Intenta con otro.`
      };
    }

    // Buscar el personaje
    let guessedCharacter = gameService.findCharacterByName(characters, currentGuess);
    
    // Si no se encuentra exacto, intentar con el primer filtrado
    if (!guessedCharacter) {
      const filteredCharacters = gameService.filterCharacters(
        characters, 
        currentGuess, 
        guessedNames
      );
      if (filteredCharacters.length > 0) {
        guessedCharacter = filteredCharacters[0];
      }
    }

    if (!guessedCharacter) {
      return {
        isValid: false,
        errorMessage: `${characterType.charAt(0).toUpperCase() + characterType.slice(1)} no encontrado. Intenta con otro nombre.`
      };
    }

    return {
      isValid: true,
      guessedCharacter
    };
  }

  /**
   * Procesa el resultado de la adivinación
   */
  processGuessResult(
    guessResult: any,
    currentAttempt: number,
    maxAttempts: number,
    targetCharacter: BaseCharacter,
    guessedCharacter: BaseCharacter
  ): GuessSubmissionResult {
    // Verificar si ganó
    if (guessResult.name.status === 'correct') {
      return {
        gameWon: true,
        shouldContinue: false,
        gameData: {
          targetCharacter,
          guessedCharacter
        }
      };
    }

    // Verificar si perdió
    const nextAttempt = currentAttempt + 1;
    if (nextAttempt >= maxAttempts) {
      return {
        gameWon: false,
        shouldContinue: false,
        gameData: {
          targetCharacter,
          guessedCharacter
        }
      };
    }

    // Continuar jugando
    return {
      gameWon: false,
      shouldContinue: true,
      gameData: {
        targetCharacter,
        guessedCharacter
      }
    };
  }

  /**
   * Actualiza la lista filtrada de personajes
   */
  updateFilteredCharacters<T extends BaseCharacter>(
    characters: T[],
    currentGuess: string,
    guesses: any[],
    gameService: any
  ): T[] {
    const guessedNames = guesses.map((g: any) => g.name.value);
    return gameService.filterCharacters(characters, currentGuess, guessedNames);
  }
} 