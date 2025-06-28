import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GameState, DailyGameState, GameStats } from '../models/game.model';
import { GameStorageService } from './game-storage.service';

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
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      }
    },
    {
      id: 'numberle',
      name: 'Numberle',
      description: 'Adivina el número en 6 intentos',
      route: '/games/numberle',
      icon: 'fas fa-hashtag',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      }
    },
    {
      id: 'colorle',
      name: 'Colorle',
      description: 'Adivina el color en 6 intentos',
      route: '/games/colorle',
      icon: 'fas fa-palette',
      stats: {
        totalGames: 0,
        wins: 0,
        currentStreak: 0,
        bestStreak: 0,
        guessDistribution: [0, 0, 0, 0, 0, 0]
      }
    }
  ];

  constructor(private storageService: GameStorageService) {
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
        return {
          ...availableGame,
          ...storedGame,
          // Verificar si necesitamos resetear el estado diario
          dailyState: this.shouldResetDailyState(storedGame.dailyState) ? undefined : storedGame.dailyState
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
    
    const today = new Date().toISOString().split('T')[0];
    return dailyState.date !== today;
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

    const today = new Date().toISOString().split('T')[0];
    const dailyState: DailyGameState = {
      date: today,
      completed: true,
      won,
      attempts,
      maxAttempts: 6,
      gameData
    };

    // Actualizar estado diario
    this.storageService.updateDailyState(gameId, dailyState);

    // Actualizar estadísticas
    const stats = this.updateGameStats(game, won, attempts);
    this.storageService.updateStats(gameId, stats);

    // Actualizar el observable
    this.updateGameInList(gameId, { dailyState, stats });
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