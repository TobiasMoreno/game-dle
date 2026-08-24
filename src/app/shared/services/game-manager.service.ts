import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameState, DailyGameState, GameStats } from '../models/game.model';
import { GameStorageService } from './game-storage.service';
import { DailyActivityService } from './daily-activity.service';
import { argentinaDateKey, normalizeLegacyUtcDateKey } from '../utils/daily-activity.utils';

/**
 * Servicio principal para gestionar los juegos
 * Maneja la lógica de negocio y la comunicación entre componentes
 */
@Injectable({
  providedIn: 'root'
})
export class GameManagerService {
  private gamesSubject = new BehaviorSubject<GameState[]>([]);
  public games$ = this.gamesSubject.asObservable();

  // Lista de juegos disponibles
  private readonly availableGames: GameState[] = [
    {
      id: 'wordle',
      name: 'Wordle',
      description: 'Adivina la palabra en 6 intentos',
      route: '/games/wordle',
      icon: 'fas fa-font',
      mode: 'daily',
      durationLabel: '3–5 min',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      }
    },
    {
      id: 'onepiecedle',
      name: 'One Piece DLE',
      description: 'Adivina el personaje de One Piece',
      route: '/games/onepiecedle',
      icon: 'fas fa-skull-crossbones',
      mode: 'daily',
      durationLabel: '5–8 min',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      }
    },
    {
      id: 'loldle',
      name: 'LoL DLE',
      description: 'Adivina el campeón de League of Legends',
      route: '/games/loldle',
      icon: 'fas fa-solid fa-l',
      mode: 'daily',
      durationLabel: '5–8 min',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      }
    },
    {
      id: 'musicdle',
      name: 'MusicDLE',
      description: 'Reconoce canciones en fragmentos de hasta 12 segundos',
      route: '/games/musicdle',
      icon: 'fas fa-headphones',
      mode: 'unlimited',
      durationLabel: '2–4 min'
    },
    {
      id: 'serpentile',
      name: 'Serpentile',
      description: 'Girá los bloques y guiá a la serpiente sin salir del tablero',
      route: '/games/serpentile',
      icon: 'fas fa-bezier-curve',
      mode: 'daily',
      durationLabel: '3–6 min',
      scoreBased: true,
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: []
      }
    },
    {
      id: 'tuttifrutti',
      name: 'Tutti Frutti',
      description: 'Competí en vivo con amigos usando la misma letra',
      route: '/games/tuttifrutti',
      icon: 'fas fa-users',
      mode: 'multiplayer',
      durationLabel: '10–20 min'
    },
    {
      id: 'geodle',
      name: 'GeoDLE',
      description: 'Encontrá el país oculto siguiendo pistas geográficas',
      route: '/games/geodle',
      icon: 'fas fa-earth-americas',
      mode: 'unlimited',
      durationLabel: '3–5 min',
      badge: 'Actualizado'
    },
    {
      id: 'chronodle',
      name: 'ChronoDLE',
      description: 'Ordená cinco acontecimientos de la historia',
      route: '/games/chronodle',
      icon: 'fas fa-hourglass-half',
      mode: 'unlimited',
      durationLabel: '3–6 min',
      badge: 'Nuevo',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0]
      }
    },
    {
      id: 'futboldle',
      name: 'FutbolDLE',
      description: 'Descubrí el apellido de 5 letras del futbolista oculto',
      route: '/games/futboldle',
      icon: 'fas fa-futbol',
      mode: 'unlimited',
      durationLabel: '2–4 min',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      }
    },
    {
      id: 'rankdle',
      name: 'RankDLE',
      description: 'Ordená cinco elementos según el desafío de cada ronda',
      route: '/games/rankdle',
      icon: 'fas fa-ranking-star',
      mode: 'unlimited',
      durationLabel: '3–6 min',
      badge: 'Nuevo',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0]
      }
    },
    {
      id: 'roscodle',
      name: 'RoscoDLE',
      description: 'Completá el abecedario general o jugá un especial dedicado a tu club',
      route: '/games/roscodle',
      icon: 'fas fa-circle-nodes',
      mode: 'unlimited',
      durationLabel: '8–15 min'
    }
  ];

  constructor(
    private storageService: GameStorageService,
    private dailyActivity: DailyActivityService
  ) {
    this.initializeGames();
  }

  /**
   * Inicializa los juegos cargando datos del localStorage
   */
  private initializeGames(): void {
    const storedGames = this.storageService.getGames();
    
    // Combinar juegos disponibles con datos almacenados
    const games = this.availableGames.map(availableGame => {
      const storedGame = storedGames.find(g => g.id === availableGame.id);
      if (storedGame) {
        const normalizedDailyState = storedGame.dailyState
          ? {
              ...storedGame.dailyState,
              date: normalizeLegacyUtcDateKey(storedGame.dailyState.date),
            }
          : undefined;
        return {
          ...availableGame,
          ...storedGame,
          // La modalidad pertenece a la configuración actual, no al estado persistido.
          mode: availableGame.mode,
          // Verificar si necesitamos resetear el estado diario
          dailyState: this.shouldResetDailyState(normalizedDailyState) ? undefined : normalizedDailyState
        };
      }
      return availableGame;
    });

    this.gamesSubject.next(games);
  }

  /**
   * Verifica si el estado diario debe ser reseteado (nuevo día)
   */
  private shouldResetDailyState(dailyState?: DailyGameState): boolean {
    if (!dailyState) return false;
    
    const today = argentinaDateKey();
    return normalizeLegacyUtcDateKey(dailyState.date) !== today;
  }

  /**
   * Obtiene todos los juegos
   */
  getGames(): GameState[] {
    return this.gamesSubject.value;
  }

  /**
   * Obtiene un juego específico por ID
   */
  getGame(gameId: string): GameState | null {
    return this.gamesSubject.value.find(game => game.id === gameId) || null;
  }

  /**
   * Verifica si un juego ya fue jugado hoy
   */
  isGamePlayedToday(gameId: string): boolean {
    return this.storageService.isGamePlayedToday(gameId);
  }

  /**
   * Obtiene el estado del juego del día actual
   */
  getTodayGameState(gameId: string): DailyGameState | null {
    return this.storageService.getTodayGameState(gameId);
  }

  /**
   * Completa un juego y actualiza estadísticas
   */
  completeGame(gameId: string, won: boolean, attempts: number, gameData?: any): void {
    const game = this.getGame(gameId);
    if (!game) return;

    const today = argentinaDateKey();
    const isRepeatRound = game.mode === 'daily' &&
      game.dailyState?.completed === true &&
      normalizeLegacyUtcDateKey(game.dailyState.date) === today;
    const roundResult: DailyGameState = {
      date: today,
      completed: true,
      won,
      attempts,
      maxAttempts: typeof gameData?.maxAttempts === 'number' ? gameData.maxAttempts : 6,
      gameData
    };
    const dailyState = isRepeatRound ? game.dailyState! : roundResult;

    // Actualizar estado diario
    // Persist after calculating stats so newly added games are stored too.

    // Actualizar estadísticas
    const stats = this.updateGameStats(game, won, attempts);
    this.storageService.saveGame({ ...game, dailyState, stats, lastPlayed: today });

    // Actualizar el observable
    this.updateGameInList(gameId, { dailyState, stats });

    if (game.mode === 'daily' && !isRepeatRound) {
      const score = typeof gameData?.score === 'number' ? gameData.score : undefined;
      void this.dailyActivity.recordDailyGame(gameId, won, attempts, score);
    }
  }

  /** Completa un desafío diario cuyo resultado principal es un puntaje. */
  completeScoreGame(gameId: string, score: number, gameData?: any, date?: string): void {
    const game = this.getGame(gameId);
    if (!game) return;

    const today = date ?? argentinaDateKey();
    const isRepeatRound = game.mode === 'daily' &&
      game.dailyState?.completed === true &&
      normalizeLegacyUtcDateKey(game.dailyState.date) === today;
    const roundResult: DailyGameState = {
      date: today,
      completed: true,
      gameData: { ...gameData, score }
    };
    const dailyState = isRepeatRound ? game.dailyState! : roundResult;
    const previousStats = game.stats ?? {
      totalGames: 0,
      wins: 0,
      currentStreak: 0,
      bestStreak: 0,
      guessDistribution: []
    };
    const stats: GameStats = {
      ...previousStats,
      totalGames: previousStats.totalGames + 1
    };

    this.storageService.saveGame({ ...game, dailyState, stats, lastPlayed: today });
    this.updateGameInList(gameId, { dailyState, stats });
    if (game.mode === 'daily' && !isRepeatRound) {
      void this.dailyActivity.recordDailyGame(gameId, true, 0, score);
    }
  }

  /**
   * Actualiza las estadísticas del juego
   */
  private updateGameStats(game: GameState, won: boolean, attempts: number): GameStats {
    const stats = game.stats || {
      totalGames: 0,
      wins: 0,
      currentStreak: 0,
      bestStreak: 0,
      guessDistribution: [0, 0, 0, 0, 0, 0]
    };

    stats.totalGames++;
    
    if (won) {
      stats.wins++;
      stats.currentStreak++;
      stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
      
      // Actualizar distribución de intentos (índice 0-5 para 1-6 intentos)
      if (attempts >= 1 && attempts <= 6) {
        stats.guessDistribution[attempts - 1]++;
      }
    } else {
      stats.currentStreak = 0;
    }

    return stats;
  }

  /**
   * Actualiza un juego en la lista y emite el cambio
   */
  private updateGameInList(gameId: string, updates: Partial<GameState>): void {
    const games = this.gamesSubject.value;
    const index = games.findIndex(g => g.id === gameId);
    
    if (index >= 0) {
      games[index] = { ...games[index], ...updates };
      this.gamesSubject.next([...games]);
    }
  }

  /**
   * Resetea el estado diario de un juego (útil para testing)
   */
  resetGameDailyState(gameId: string): void {
    this.storageService.resetDailyState(gameId);
    this.updateGameInList(gameId, { dailyState: undefined });
  }

  /**
   * Limpia todos los datos (útil para testing)
   */
  clearAllData(): void {
    this.storageService.clearAllData();
    this.initializeGames();
  }
}
