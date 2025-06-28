/**
 * Interfaz para representar el estado de un juego
 */
export interface GameState {
  /** ID único del juego */
  id: string;
  /** Nombre del juego */
  name: string;
  /** Descripción del juego */
  description: string;
  /** Ruta del juego */
  route: string;
  /** Icono del juego (clase CSS) */
  icon: string;
  /** Fecha de la última jugada */
  lastPlayed?: string;
  /** Estado del juego del día actual */
  dailyState?: DailyGameState;
  /** Estadísticas del juego */
  stats?: GameStats;
  /** Progreso actual del juego (se limpia cada 24h) */
  currentProgress?: GameProgress;
}

/**
 * Interfaz para el estado del juego del día
 */
export interface DailyGameState {
  /** Fecha del juego (YYYY-MM-DD) */
  date: string;
  /** Si el juego fue completado */
  completed: boolean;
  /** Resultado del juego (ganó/perdió) */
  won?: boolean;
  /** Número de intentos realizados */
  attempts?: number;
  /** Máximo número de intentos permitidos */
  maxAttempts?: number;
  /** Datos específicos del juego */
  gameData?: any;
}

/**
 * Interfaz para el progreso actual del juego
 * Se guarda en localStorage y se limpia cada 24 horas
 */
export interface GameProgress {
  /** Fecha de creación del progreso (YYYY-MM-DD) */
  date: string;
  /** Número de intentos actuales */
  currentAttempt: number;
  /** Máximo número de intentos */
  maxAttempts: number;
  /** Si el juego fue ganado */
  gameWon: boolean;
  /** Si el juego fue perdido */
  gameLost: boolean;
  /** Intentos realizados (datos específicos del juego) */
  attempts: any[];
  /** Datos adicionales específicos del juego */
  gameData?: any;
  /** Timestamp de la última actualización */
  lastUpdated: number;
}

/**
 * Interfaz para las estadísticas del juego
 */
export interface GameStats {
  /** Total de juegos jugados */
  totalGames: number;
  /** Total de victorias */
  wins: number;
  /** Racha actual de victorias */
  currentStreak: number;
  /** Mejor racha de victorias */
  bestStreak: number;
  /** Distribución de intentos (índice = intentos, valor = cantidad) */
  guessDistribution: number[];
} 