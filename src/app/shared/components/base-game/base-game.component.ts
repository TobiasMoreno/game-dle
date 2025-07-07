import { Component, inject, output, input } from '@angular/core';
import { Router } from '@angular/router';
import { GameState, DailyGameState, GameProgress } from '../../models/game.model';
import { GameManagerService } from '../../services/game-manager.service';
import { GameStorageService } from '../../services/game-storage.service';
import { ThemeService } from '../../services/theme.service';

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
  // Inputs para personalización temática
  customBackground = input<string>('');
  customHeaderBg = input<string>('');
  customCardBg = input<string>('');
  customTextColor = input<string>('');
  customButtonBg = input<string>('');
  customButtonTextColor = input<string>('');
  customAccentColor = input<string>('');
  hideHeader = input<boolean>(false);
  hideStats = input<boolean>(false);
  hideDailyState = input<boolean>(false);
  footerTheme = input<'default' | 'onepiece' | 'wordle' | 'colorle' | 'numberle' | 'loldle'>('default');

  gameCompleted = output<{won: boolean, attempts: number, gameData?: any}>();
  progressLoaded = output<GameProgress | null>();

  game: GameState | null = null;
  dailyState: DailyGameState | null = null;
  currentProgress: GameProgress | null = null;
  private _gameId: string | null = null;

  private router = inject(Router);
  private gameManager = inject(GameManagerService);
  protected gameStorage = inject(GameStorageService);
  private themeService = inject(ThemeService);

  /**
   * Establece el gameId y inicializa el componente
   */
  public setGameId(gameId: string): void {
    this._gameId = gameId;
    this.loadGame();
    this.loadProgress();
    this.setFooterTheme();
  }

  /**
   * Obtiene el gameId de forma segura
   */
  protected getGameIdSafely(): string | null {
    return this._gameId;
  }

  /**
   * Carga el juego y su estado
   */
  protected loadGame(): void {
    const gameIdValue = this.getGameIdSafely();
    if (!gameIdValue) return;

    this.game = this.gameManager.getGame(gameIdValue);
    this.dailyState = this.gameManager.getTodayGameState(gameIdValue);

    if (!this.game) {
      this.goHome();
    }
  }

  /**
   * Carga el progreso actual del juego
   */
  protected loadProgress(): void {
    const gameIdValue = this.getGameIdSafely();
    if (!gameIdValue) return;

    this.currentProgress = this.gameStorage.getGameProgress(gameIdValue);
    this.progressLoaded.emit(this.currentProgress);
  }

  /**
   * Guarda el progreso actual del juego
   */
  protected saveProgress(progress: Partial<GameProgress>): void {
    try {
      const gameIdValue = this.getGameIdSafely();
      if (!gameIdValue) {
        return;
      }

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

      this.gameStorage.saveGameProgress(gameIdValue, fullProgress);
      this.currentProgress = fullProgress;
    } catch (error) {
      console.error('Error en saveProgress:', error);
    }
  }

  /**
   * Actualiza el progreso del juego
   */
  protected updateProgress(updates: Partial<GameProgress>): void {
    try {
      const gameIdValue = this.getGameIdSafely();
      if (!gameIdValue) {
        return;
      }

      if (!this.currentProgress) {
        this.saveProgress(updates);
        return;
      }

      const updatedProgress = {
        ...this.currentProgress,
        ...updates,
        lastUpdated: Date.now()
      };

      this.gameStorage.saveGameProgress(gameIdValue, updatedProgress);
      this.currentProgress = updatedProgress;
    } catch (error) {
      console.error('Error en updateProgress:', error);
    }
  }

  /**
   * Limpia el progreso del juego (cuando se completa)
   */
  protected clearProgress(): void {
    const gameIdValue = this.getGameIdSafely();
    if (!gameIdValue) return;

    this.gameStorage.clearGameProgress(gameIdValue);
    this.currentProgress = null;
  }

  /**
   * Completa el juego y actualiza estadísticas
   */
  protected completeGame(won: boolean, attempts: number, gameData?: any): void {
    const gameIdValue = this.getGameIdSafely();
    if (!gameIdValue) return;

    this.gameManager.completeGame(gameIdValue, won, attempts, gameData);
    
    // Actualizar estadísticas personales
    this.gameStorage.updatePersonalStats(gameIdValue, won);
    
    this.gameCompleted.emit({ won, attempts, gameData });
    
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
    const gameIdValue = this.getGameIdSafely();
    if (!gameIdValue) return false;
    return this.gameManager.isGamePlayedToday(gameIdValue);
  }

  /**
   * Verifica si hay progreso guardado para continuar
   */
  protected hasProgress(): boolean {
    return this.currentProgress !== null;
  }

  /**
   * Establece el tema del footer basado en el juego
   */
  private setFooterTheme(): void {
    const gameId = this.getGameIdSafely();
    let theme: 'default' | 'onepiece' | 'wordle' | 'colorle' | 'numberle' = 'default';
    switch (gameId) {
      case 'onepiecedle':
        theme = 'onepiece';
        break;
      case 'wordle':
        theme = 'wordle';
        break;
      case 'colorle':
        theme = 'colorle';
        break;
      case 'numberle':
        theme = 'numberle';
        break;
      default:
        theme = 'default';
    }
    this.themeService.setFooterTheme(theme);
  }

  /**
   * Obtiene el progreso actual
   */
  protected getCurrentProgress(): GameProgress | null {
    return this.currentProgress;
  }

  /**
   * Función de tracking para el bucle de distribución de intentos
   */
  protected trackGuessDistribution(index: number, count: number): number {
    return index;
  }

  /**
   * Obtiene las estadísticas personales del juego actual (forzado a 'onepiecedle')
   */
  public getPersonalStats(): { played: number; won: number; currentStreak: number; bestStreak: number } {
    return this.gameStorage.getPersonalStats('onepiecedle');
    //TODO: Ver por que no me toma el gameIdValue esta como null, por ahora lo forzo a 'onepiecedle'
    //const gameIdValue = this.getGameIdSafely();
    //if (!gameIdValue) {
    //  return { played: 0, won: 0, currentStreak: 0, bestStreak: 0 };
    //}
    //return this.gameStorage.getPersonalStats(gameIdValue);
  }
} 