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
  private readonly STORAGE_KEY = 'game-dle-data';
  private readonly GAMES_KEY = 'games';
  private readonly PROGRESS_KEY = 'game-progress';

  constructor() {
    // Limpiar progresos antiguos al inicializar el servicio
    this.cleanOldProgress();
  }

  /**
   * Obtiene todos los juegos almacenados
   */
  getGames(): GameState[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed[this.GAMES_KEY] || [];
      }
    } catch (error) {
      console.error('Error al cargar juegos del localStorage:', error);
    }
    return [];
  }

  /**
   * Guarda todos los juegos en localStorage
   */
  saveGames(games: GameState[]): void {
    try {
      const data = {
        [this.GAMES_KEY]: games,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
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

  // ===== MÉTODOS PARA EL PROGRESO ACTUAL DEL JUEGO =====

  /**
   * Guarda el progreso actual del juego
   */
  saveGameProgress(gameId: string, progress: GameProgress): void {
    try {
      console.log(`Guardando progreso para ${gameId}:`, progress);
      
      const allProgress = this.getAllProgress();
      allProgress[gameId] = {
        ...progress,
        lastUpdated: Date.now()
      };
      
      const dataToSave = JSON.stringify(allProgress);
      console.log(`Datos a guardar en localStorage:`, dataToSave);
      
      localStorage.setItem(this.PROGRESS_KEY, dataToSave);
      
      // Verificar que se guardó correctamente
      const savedData = localStorage.getItem(this.PROGRESS_KEY);
      console.log(`Datos guardados en localStorage:`, savedData);
      
      if (savedData === dataToSave) {
        console.log('Progreso guardado exitosamente en localStorage');
      } else {
        console.error('Error: Los datos guardados no coinciden con los datos originales');
      }
    } catch (error) {
      console.error('Error al guardar progreso del juego:', error);
      console.error('Detalles del error:', {
        gameId,
        progress,
        localStorageAvailable: typeof localStorage !== 'undefined',
        localStorageQuota: this.getLocalStorageQuota()
      });
    }
  }

  /**
   * Obtiene el progreso actual del juego
   */
  getGameProgress(gameId: string): GameProgress | null {
    try {
      console.log(`Obteniendo progreso para ${gameId}...`);
      
      const allProgress = this.getAllProgress();
      console.log('Todos los progresos almacenados:', allProgress);
      
      const progress = allProgress[gameId];
      console.log(`Progreso encontrado para ${gameId}:`, progress);
      
      if (!progress) {
        console.log(`No hay progreso guardado para ${gameId}`);
        return null;
      }

      // Verificar si el progreso es del día actual
      const today = new Date().toISOString().split('T')[0];
      console.log(`Fecha del progreso: ${progress.date}, Hoy: ${today}`);
      
      if (progress.date !== today) {
        console.log(`Progreso es de otro día, limpiando...`);
        // Limpiar progreso antiguo
        this.clearGameProgress(gameId);
        return null;
      }

      console.log(`Progreso válido encontrado para ${gameId}:`, progress);
      return progress;
    } catch (error) {
      console.error('Error al cargar progreso del juego:', error);
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
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error al limpiar progreso del juego:', error);
    }
  }

  /**
   * Limpia todos los progresos antiguos (no del día actual)
   */
  cleanOldProgress(): void {
    try {
      const allProgress = this.getAllProgress();
      const today = new Date().toISOString().split('T')[0];
      let hasChanges = false;

      Object.keys(allProgress).forEach(gameId => {
        if (allProgress[gameId].date !== today) {
          delete allProgress[gameId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress));
      }
    } catch (error) {
      console.error('Error al limpiar progresos antiguos:', error);
    }
  }

  /**
   * Obtiene todos los progresos almacenados
   */
  private getAllProgress(): { [gameId: string]: GameProgress } {
    try {
      const data = localStorage.getItem(this.PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error al cargar progresos:', error);
      return {};
    }
  }

  /**
   * Verifica si hay progreso guardado para un juego
   */
  hasGameProgress(gameId: string): boolean {
    return this.getGameProgress(gameId) !== null;
  }

  /**
   * Limpia todos los datos almacenados (útil para testing)
   */
  clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
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