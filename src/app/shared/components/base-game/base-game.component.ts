import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { GameState, DailyGameState, GameProgress } from '../../models/game.model';
import { GameManagerService } from '../../services/game-manager.service';
import { GameStorageService } from '../../services/game-storage.service';

/**
 * Componente base para todos los juegos
 * Proporciona funcionalidad común como manejo de estado, estadísticas y navegación
 */
@Component({
  selector: 'app-base-game',
  imports: [],
  templateUrl: './base-game.component.html',
  styles: []
})
export class BaseGameComponent {
  @Input() gameId: string = '';
  @Output() gameCompleted = new EventEmitter<{won: boolean, attempts: number, gameData?: any}>();
  @Output() progressLoaded = new EventEmitter<GameProgress | null>();

  game: GameState | null = null;
  dailyState: DailyGameState | null = null;
  currentProgress: GameProgress | null = null;

  constructor(
    protected router: Router,
    protected gameManager: GameManagerService,
    protected gameStorage: GameStorageService
  ) {}

  ngOnInit(): void {
    this.loadGame();
    this.loadProgress();
  }

  /**
   * Carga el juego y su estado
   */
  protected loadGame(): void {
    if (!this.gameId) return;

    this.game = this.gameManager.getGame(this.gameId);
    this.dailyState = this.gameManager.getTodayGameState(this.gameId);

    if (!this.game) {
      this.goHome();
    }
  }

  /**
   * Carga el progreso actual del juego
   */
  protected loadProgress(): void {
    if (!this.gameId) return;

    this.currentProgress = this.gameStorage.getGameProgress(this.gameId);
    this.progressLoaded.emit(this.currentProgress);
  }

  /**
   * Guarda el progreso actual del juego
   */
  protected saveProgress(progress: Partial<GameProgress>): void {
    if (!this.gameId) return;

    const today = new Date().toISOString().split('T')[0];
    const fullProgress: GameProgress = {
      date: today,
      currentAttempt: 0,
      maxAttempts: 6,
      gameWon: false,
      gameLost: false,
      attempts: [],
      lastUpdated: Date.now(),
      ...progress
    };

    this.gameStorage.saveGameProgress(this.gameId, fullProgress);
    this.currentProgress = fullProgress;
  }

  /**
   * Actualiza el progreso del juego
   */
  protected updateProgress(updates: Partial<GameProgress>): void {
    if (!this.currentProgress) {
      this.saveProgress(updates);
      return;
    }

    const updatedProgress = {
      ...this.currentProgress,
      ...updates,
      lastUpdated: Date.now()
    };

    this.gameStorage.saveGameProgress(this.gameId, updatedProgress);
    this.currentProgress = updatedProgress;
  }

  /**
   * Limpia el progreso del juego (cuando se completa)
   */
  protected clearProgress(): void {
    if (!this.gameId) return;

    this.gameStorage.clearGameProgress(this.gameId);
    this.currentProgress = null;
  }

  /**
   * Completa el juego y actualiza estadísticas
   */
  protected completeGame(won: boolean, attempts: number, gameData?: any): void {
    if (!this.gameId) return;

    this.gameManager.completeGame(this.gameId, won, attempts, gameData);
    this.gameCompleted.emit({ won, attempts, gameData });
    
    // Limpiar progreso al completar el juego
    this.clearProgress();
    
    // Recargar el estado
    this.loadGame();
  }

  /**
   * Navega a la página de inicio
   */
  protected goHome(): void {
    this.router.navigate(['/home']);
  }

  /**
   * Calcula el porcentaje para la barra de distribución de intentos
   */
  protected getGuessPercentage(count: number): number {
    if (!this.game?.stats?.totalGames || this.game.stats.totalGames === 0) return 0;
    return (count / this.game.stats.totalGames) * 100;
  }

  /**
   * Verifica si el juego ya fue jugado hoy
   */
  protected isGamePlayedToday(): boolean {
    return this.gameManager.isGamePlayedToday(this.gameId);
  }

  /**
   * Verifica si hay progreso guardado para continuar
   */
  protected hasProgress(): boolean {
    return this.currentProgress !== null;
  }

  /**
   * Obtiene el progreso actual
   */
  protected getCurrentProgress(): GameProgress | null {
    return this.currentProgress;
  }
} 