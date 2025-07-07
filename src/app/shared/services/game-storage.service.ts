import { Injectable } from '@angular/core';
import { GameState, DailyGameState, GameStats, GameProgress } from '../models/game.model';

/**
 * Servicio para manejar el almacenamiento local de los juegos
 * Utiliza localStorage para persistir el estado de los juegos
 */
@Injectable({
  providedIn: 'root'
})
export class GameStorageService {
  private readonly GAMES_STORAGE_KEY = 'game-dle-games';
  private readonly PROGRESS_STORAGE_KEY = 'game-dle-progress';
  private readonly STATS_STORAGE_KEY = 'game-dle-stats';

  // ===== MÉTODOS PARA LOS JUEGOS Y ESTADÍSTICAS =====

  /**
   * Obtiene todos los juegos almacenados
   */
  getGames(): GameState[] {
    try {
      const data = localStorage.getItem(this.GAMES_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al cargar juegos del localStorage:', error);
      return [];
    }
  }

  /**
   * Guarda todos los juegos en localStorage
   */
  saveGames(games: GameState[]): void {
    try {
      localStorage.setItem(this.GAMES_STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error('Error al guardar juegos en localStorage:', error);
    }
  }

  /**
   * Obtiene un juego específico por ID
   */
  getGame(gameId: string): GameState | null {
    const games = this.getGames();
    return games.find(game => game.id === gameId) || null;
  }

  /**
   * Guarda o actualiza un juego específico
   */
  saveGame(game: GameState): void {
    const games = this.getGames();
    const index = games.findIndex(g => g.id === game.id);
    
    if (index >= 0) {
      games[index] = game;
    } else {
      games.push(game);
    }
    
    this.saveGames(games);
  }

  /**
   * Actualiza el estado del juego del día
   */
  updateDailyState(gameId: string, dailyState: DailyGameState): void {
    const game = this.getGame(gameId);
    if (game) {
      game.dailyState = dailyState;
      game.lastPlayed = dailyState.date;
      this.saveGame(game);
    }
  }

  /**
   * Actualiza las estadísticas del juego
   */
  updateStats(gameId: string, stats: GameStats): void {
    const game = this.getGame(gameId);
    if (game) {
      game.stats = stats;
      this.saveGame(game);
    }
  }

  /**
   * Verifica si un juego ya fue jugado hoy
   */
  isGamePlayedToday(gameId: string): boolean {
    const game = this.getGame(gameId);
    if (!game || !game.dailyState) {
      return false;
    }
    
    const today = new Date().toISOString().split('T')[0];
    return game.dailyState.date === today && game.dailyState.completed;
  }

  /**
   * Obtiene el estado del juego del día actual
   */
  getTodayGameState(gameId: string): DailyGameState | null {
    const game = this.getGame(gameId);
    if (!game || !game.dailyState) {
      return null;
    }
    
    const today = new Date().toISOString().split('T')[0];
    return game.dailyState.date === today ? game.dailyState : null;
  }

  /**
   * Resetea el estado del juego para un nuevo día
   */
  resetDailyState(gameId: string): void {
    const game = this.getGame(gameId);
    if (game) {
      game.dailyState = undefined;
      this.saveGame(game);
    }
  }

  // ===== MÉTODOS PARA ESTADÍSTICAS PERSONALES =====

  /**
   * Obtiene las estadísticas personales de un juego
   */
  getPersonalStats(gameId: string): { played: number; won: number; currentStreak: number; bestStreak: number } {
    try {
      const allStats = this.getAllPersonalStats();
      return allStats[gameId] || { played: 0, won: 0, currentStreak: 0, bestStreak: 0 };
    } catch (error) {
      console.error(`❌ Error al cargar estadísticas personales para ${gameId}:`, error);
      return { played: 0, won: 0, currentStreak: 0, bestStreak: 0 };
    }
  }

  /**
   * Actualiza las estadísticas personales de un juego
   */
  updatePersonalStats(gameId: string, won: boolean): void {
    try {
      
      const allStats = this.getAllPersonalStats();
      const currentStats = allStats[gameId] || { played: 0, won: 0, currentStreak: 0, bestStreak: 0 };
      
      // Incrementar partidas jugadas
      currentStats.played++;
      
      if (won) {
        // Incrementar partidas ganadas
        currentStats.won++;
        // Incrementar racha actual
        currentStats.currentStreak++;
        // Actualizar mejor racha si es necesario
        if (currentStats.currentStreak > currentStats.bestStreak) {
          currentStats.bestStreak = currentStats.currentStreak;
        }
      } else {
        // Resetear racha actual si perdió
        currentStats.currentStreak = 0;
      }
      
      allStats[gameId] = currentStats;
      localStorage.setItem(this.STATS_STORAGE_KEY, JSON.stringify(allStats));
      
    } catch (error) {
      console.error(`❌ Error al actualizar estadísticas personales para ${gameId}:`, error);
    }
  }

  /**
   * Obtiene todas las estadísticas personales
   */
  private getAllPersonalStats(): { [gameId: string]: { played: number; won: number; currentStreak: number; bestStreak: number } } {
    try {
      const data = localStorage.getItem(this.STATS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Error al cargar estadísticas personales:', error);
      return {};
    }
  }

  // ===== MÉTODOS PARA EL PROGRESO ACTUAL DEL JUEGO =====

  /**
   * Guarda el progreso actual del juego
   */
  saveGameProgress(gameId: string, progress: GameProgress): void {
    try {
      const allProgress = this.getAllProgress();
      allProgress[gameId] = {
        ...progress,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(this.PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error(`❌ Error al guardar progreso para ${gameId}:`, error);
    }
  }

  /**
   * Obtiene el progreso actual del juego
   */
  getGameProgress(gameId: string): GameProgress | null {
    try {
      const allProgress = this.getAllProgress();
      const progress = allProgress[gameId];
      
      if (!progress) {
        return null;
      }

      // Verificar si el progreso es del día actual
      const today = new Date().toISOString().split('T')[0];
      
      if (progress.date !== today) {
        return progress;
      }
      
      return progress;
    } catch (error) {
      console.error(`❌ Error al cargar progreso para ${gameId}:`, error);
      return null;
    }
  }

  /**
   * Limpia el progreso de un juego específico
   */
  clearGameProgress(gameId: string): void {
    try {
      
      const allProgress = this.getAllProgress();
      delete allProgress[gameId];
      
      localStorage.setItem(this.PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error(`❌ Error al limpiar progreso para ${gameId}:`, error);
    }
  }

  /**
   * Limpia solo el progreso antiguo (de días anteriores)
   */
  clearOldProgress(gameId: string): void {
    try {
      
      const allProgress = this.getAllProgress();
      const progress = allProgress[gameId];
      
      if (!progress) {
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      if (progress.date !== today) {
        delete allProgress[gameId];
        localStorage.setItem(this.PROGRESS_STORAGE_KEY, JSON.stringify(allProgress));
      } else {
      }
    } catch (error) {
      console.error(`❌ Error al limpiar progreso antiguo para ${gameId}:`, error);
    }
  }

  /**
   * Verifica si hay progreso guardado para un juego
   */
  hasGameProgress(gameId: string): boolean {
    return this.getGameProgress(gameId) !== null;
  }

  /**
   * Obtiene todos los progresos almacenados
   */
  private getAllProgress(): { [gameId: string]: GameProgress } {
    try {
      const data = localStorage.getItem(this.PROGRESS_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('❌ Error al cargar progresos:', error);
      return {};
    }
  }

  /**
   * Limpia todos los datos almacenados (útil para testing)
   */
  clearAllData(): void {
    localStorage.removeItem(this.GAMES_STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_STORAGE_KEY);
    localStorage.removeItem(this.STATS_STORAGE_KEY);
  }

  /**
   * Obtiene información sobre el espacio disponible en localStorage
   */
  private getLocalStorageQuota(): any {
    try {
      const testKey = '__localStorage_test__';
      const testValue = 'x'.repeat(1024); // 1KB
      let totalSize = 0;
      
      // Intentar escribir hasta que falle
      while (true) {
        try {
          localStorage.setItem(testKey + totalSize, testValue);
          totalSize++;
        } catch (e) {
          break;
        }
      }
      
      // Limpiar datos de prueba
      for (let i = 0; i < totalSize; i++) {
        localStorage.removeItem(testKey + i);
      }
      
      return {
        availableSpace: totalSize * 1024, // en bytes
        totalSize: totalSize * 1024
      };
    } catch (error) {
      return { error: 'No se pudo determinar el espacio disponible' };
    }
  }
} 