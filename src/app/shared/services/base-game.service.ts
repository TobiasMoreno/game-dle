import { Injectable } from '@angular/core';
import { GameProgress } from '../models/game.model';

export type CompareStatus = 'correct' | 'partial' | 'wrong';

@Injectable({ providedIn: 'root' })
export class BaseGameService {

  /**
   * Guarda el progreso actual del juego
   */
  protected saveProgress(gameId: string, progress: any): void {
    try {
      const progressData: GameProgress = {
        currentAttempt: progress.currentAttempt,
        gameWon: progress.gameWon,
        gameLost: progress.gameLost,
        attempts: progress.attempts,
        maxAttempts: progress.maxAttempts,
        gameData: progress.gameData,
        date: new Date().toISOString().split('T')[0],
        lastUpdated: Date.now()
      };

      localStorage.setItem(`game_progress_${gameId}`, JSON.stringify(progressData));
      console.log('💾 Progreso guardado para:', gameId);
    } catch (error) {
      console.error('❌ Error al guardar progreso:', error);
    }
  }

  /**
   * Restaura el progreso guardado del juego
   */
  protected restoreProgress(gameId: string): GameProgress | null {
    try {
      const stored = localStorage.getItem(`game_progress_${gameId}`);
      if (stored) {
        const progress: GameProgress = JSON.parse(stored);
        console.log('📂 Progreso restaurado para:', gameId);
        return progress;
      }
    } catch (error) {
      console.error('❌ Error al restaurar progreso:', error);
    }
    return null;
  }

  /**
   * Verifica si el juego ya fue jugado hoy
   */
  protected isGamePlayedToday(gameId: string): boolean {
    try {
      const stored = localStorage.getItem(`game_progress_${gameId}`);
      if (stored) {
        const progress: GameProgress = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        return progress.date === today && progress.gameWon;
      }
    } catch (error) {
      console.error('❌ Error al verificar estado diario:', error);
    }
    return false;
  }

  /**
   * Obtiene el estado del juego del día actual
   */
  protected getTodayGameState(gameId: string): any {
    try {
      const stored = localStorage.getItem(`game_progress_${gameId}`);
      if (stored) {
        const progress: GameProgress = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        if (progress.date === today) {
          return progress;
        }
      }
    } catch (error) {
      console.error('❌ Error al obtener estado diario:', error);
    }
    return null;
  }

  /**
   * Revela las columnas del tablero con animación
   */
  protected revealColumns(revealedColumns: number[], maxColumns: number): void {
    if (revealedColumns.length === 0) return;
    
    const reveal = (col: number) => {
      if (col == 0) {
        setTimeout(() => {}, 0);
      }
      if (col < maxColumns) {
        setTimeout(() => {
          revealedColumns[0] = col + 1;
          reveal(col + 1);
        }, 300);
      }
    };
    reveal(0);
  }

  /**
   * Obtiene la clase CSS para el estado de comparación
   */
  protected getComparisonClass(status: CompareStatus): string {
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white';
      case 'partial':
        return 'bg-yellow-400 text-white';
      case 'wrong':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  /**
   * Compara texto con opción de coincidencia parcial
   */
  protected compareText(guess: string, target: string, allowPartial = true): CompareStatus {
    if (guess === target) return 'correct';
    
    if (allowPartial && guess && target) {
      if (guess.toLowerCase() === target.toLowerCase()) return 'correct';
      if (guess.toLowerCase().includes(target.toLowerCase()) || 
          target.toLowerCase().includes(guess.toLowerCase())) return 'partial';
    }
    
    return 'wrong';
  }

  /**
   * Compara arrays (para campos como posición, especie, etc.)
   */
  protected compareArrays(guess: string[], target: string[]): CompareStatus {
    if (!guess || !target) return 'wrong';
    
    const guessSet = new Set(guess.map(h => h.toLowerCase()));
    const targetSet = new Set(target.map(h => h.toLowerCase()));
    
    if (guessSet.size === targetSet.size && 
        [...guessSet].every(h => targetSet.has(h))) {
      return 'correct';
    }
    
    const hasCommon = [...guessSet].some(h => targetSet.has(h));
    if (hasCommon) return 'partial';
    
    return 'wrong';
  }

  /**
   * Compara valores numéricos y retorna flecha de dirección
   */
  protected compareNumeric(guess: number, target: number): { status: CompareStatus; arrow: 'up' | 'down' | null } {
    if (guess === target) return { status: 'correct', arrow: null };
    if (guess < target) return { status: 'wrong', arrow: 'up' };
    return { status: 'wrong', arrow: 'down' };
  }

  /**
   * Formatea valores para mostrar
   */
  protected formatValue(field: string, value: any): string {
    if (!value || value === 'N/A') return 'N/A';
    
    switch (field) {
      case 'ultima_recompensa':
        return this.formatReward(value);
      case 'altura':
        return this.formatHeight(value);
      case 'anio_de_lanzamiento':
        return this.formatYear(value);
      default:
        return value.toString();
    }
  }

  /**
   * Formatea recompensas (para One Piece)
   */
  private formatReward(reward: number): string {
    if (!reward || reward === 0) return 'N/A';
    if (reward >= 1000000) {
      const millions = reward / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else if (reward >= 1000) {
      const thousands = reward / 1000;
      return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    return reward.toString();
  }

  /**
   * Formatea altura (para One Piece)
   */
  private formatHeight(height: number): string {
    if (!height || height === 0) return 'N/A';
    const meters = height / 100;
    return `${meters.toFixed(2)}M`;
  }

  /**
   * Formatea año (para LoL)
   */
  private formatYear(year: number): string {
    if (!year || year === 0) return 'N/A';
    return year.toString();
  }

  /**
   * Limpia todos los datos del juego
   */
  protected clearGameData(gameId: string): void {
    try {
      localStorage.removeItem(`game_progress_${gameId}`);
      console.log('🗑️ Datos del juego eliminados:', gameId);
    } catch (error) {
      console.error('❌ Error al limpiar datos del juego:', error);
    }
  }
} 