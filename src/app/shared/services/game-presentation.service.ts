import { Injectable, inject } from '@angular/core';
import {
  GameMode,
  GamePresentationState,
  GameProgress,
  GameState,
} from '../models/game.model';
import { argentinaDateKey, normalizeLegacyUtcDateKey } from '../utils/daily-activity.utils';
import { GameStorageService } from './game-storage.service';

export type NextGameRecommendationReason = 'continue' | 'daily' | 'unlimited' | 'multiplayer';

export interface GamePresentationCandidate {
  game: GameState;
  presentation: GamePresentationState;
  lastUpdated: number;
}

export interface NextGameRecommendation {
  game: GameState;
  presentation: GamePresentationState;
  reason: NextGameRecommendationReason;
  contextLabel: string;
  description: string;
}

export interface GameCatalogSection {
  id: GameMode;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  games: GameState[];
}

const CATALOG_SECTION_COPY: ReadonlyArray<Omit<GameCatalogSection, 'games'>> = [
  {
    id: 'daily',
    index: '01',
    eyebrow: 'Una vez por día',
    title: 'Desafíos de hoy',
    description: 'Una edición nueva cada medianoche. Jugá hoy para sostener tu racha.',
  },
  {
    id: 'unlimited',
    index: '02',
    eyebrow: 'Sin espera',
    title: 'Rondas ilimitadas',
    description: 'Repetí, practicá y mejorá a tu ritmo, sin esperar al próximo desafío.',
  },
  {
    id: 'multiplayer',
    index: '03',
    eyebrow: 'En compañía',
    title: 'Para jugar con amigos',
    description: 'Creá una sala, compartí el código y convertí el desafío en competencia.',
  },
];

/** Organiza el catálogo en un orden estable y conserva el orden de cada juego. */
export function groupGameCatalog(games: GameState[]): GameCatalogSection[] {
  return CATALOG_SECTION_COPY
    .map((section) => ({
      ...section,
      games: games.filter((game) => (game.mode ?? 'daily') === section.id),
    }))
    .filter((section) => section.games.length > 0);
}

export function buildGamePresentationState(
  game: GameState,
  progress: GameProgress | null = null,
  now = new Date()
): GamePresentationState {
  const mode = game.mode ?? 'daily';

  if (mode === 'multiplayer') {
    return {
      status: 'available',
      modeLabel: 'Con amigos',
      statusLabel: 'Partida multijugador',
      actionLabel: 'Crear o unirse',
      action: 'play',
      tone: 'progress',
    };
  }

  if (mode === 'unlimited') {
    if (hasActiveProgress(progress)) {
      return {
        status: 'in-progress',
        modeLabel: 'Sin límite',
        statusLabel: 'Partida en curso',
        actionLabel: 'Continuar',
        action: 'continue',
        tone: 'progress',
      };
    }

    return {
      status: 'available',
      modeLabel: 'Sin límite',
      statusLabel: 'Rondas ilimitadas',
      actionLabel: 'Jugar',
      action: 'play',
      tone: 'neutral',
    };
  }

  const dailyState = game.dailyState;
  if (dailyState?.completed) {
    if (game.scoreBased) {
      const score = typeof dailyState.gameData?.score === 'number'
        ? dailyState.gameData.score
        : 0;
      return {
        status: 'completed',
        modeLabel: 'Diario',
        statusLabel: `${score} puntos hoy`,
        actionLabel: 'Ver resultado',
        action: 'view-result',
        tone: 'success',
      };
    }

    const attempts = dailyState.attempts;
    return {
      status: 'completed',
      modeLabel: 'Diario',
      statusLabel: dailyState.won && attempts
        ? `Completado en ${attempts} ${attempts === 1 ? 'intento' : 'intentos'}`
        : 'Completado hoy',
      actionLabel: 'Ver resultado',
      action: 'view-result',
      tone: dailyState.won ? 'success' : 'danger',
    };
  }

  if (isCurrentDailyProgress(progress, now) && hasActiveProgress(progress)) {
    const maxAttempts = progress?.maxAttempts || 6;
    const nextAttempt = Math.min((progress?.currentAttempt ?? 0) + 1, maxAttempts);
    return {
      status: 'in-progress',
      modeLabel: 'Diario',
      statusLabel: `Intento ${nextAttempt} de ${maxAttempts}`,
      actionLabel: 'Continuar',
      action: 'continue',
      tone: 'progress',
    };
  }

  return {
    status: 'available',
    modeLabel: 'Diario',
    statusLabel: 'Disponible hoy',
    actionLabel: 'Jugar',
    action: 'play',
    tone: 'neutral',
  };
}

@Injectable({ providedIn: 'root' })
export class GamePresentationService {
  private readonly storage = inject(GameStorageService);

  getState(game: GameState): GamePresentationState {
    return buildGamePresentationState(game, this.storage.getGameProgress(game.id));
  }

  getNextGame(games: GameState[]): NextGameRecommendation | null {
    const candidates = games.map((game) => {
      const progress = this.storage.getGameProgress(game.id);
      return {
        game,
        presentation: buildGamePresentationState(game, progress),
        lastUpdated: progress?.lastUpdated ?? 0,
      };
    });

    return selectNextGameRecommendation(candidates);
  }
}

export function selectNextGameRecommendation(
  candidates: GamePresentationCandidate[]
): NextGameRecommendation | null {
  const continuable = candidates
    .filter(({ presentation }) => presentation.action === 'continue')
    .sort((left, right) => right.lastUpdated - left.lastUpdated)[0];
  if (continuable) {
    return recommendation(
      continuable,
      'continue',
      'Partida en curso',
      'Volvé exactamente donde la dejaste y terminá la ronda.'
    );
  }

  const pendingDaily = candidates.find(({ game, presentation }) =>
    game.mode === 'daily' && presentation.status === 'available'
  );
  if (pendingDaily) {
    return recommendation(
      pendingDaily,
      'daily',
      'Tu próximo desafío',
      'Todavía está pendiente. Completalo antes del reinicio de medianoche.'
    );
  }

  const unlimited = candidates.find(({ game }) => game.mode === 'unlimited');
  if (unlimited) {
    return recommendation(
      unlimited,
      'unlimited',
      'Diarios completos',
      'La racha está a salvo. Seguí jugando sin esperar al próximo día.'
    );
  }

  const multiplayer = candidates.find(({ game }) => game.mode === 'multiplayer');
  return multiplayer
    ? recommendation(
        multiplayer,
        'multiplayer',
        'Para compartir',
        'Armá una sala e invitá a tus amigos a la próxima partida.'
      )
    : null;
}

function hasActiveProgress(progress: GameProgress | null): boolean {
  return Boolean(
    progress &&
    !progress.gameWon &&
    !progress.gameLost &&
    (progress.currentAttempt > 0 || (progress.attempts?.length ?? 0) > 0)
  );
}

function isCurrentDailyProgress(progress: GameProgress | null, now: Date): boolean {
  return Boolean(
    progress &&
    normalizeLegacyUtcDateKey(progress.date, now) === argentinaDateKey(now)
  );
}

function recommendation(
  candidate: GamePresentationCandidate,
  reason: NextGameRecommendationReason,
  contextLabel: string,
  description: string
): NextGameRecommendation {
  return {
    game: candidate.game,
    presentation: candidate.presentation,
    reason,
    contextLabel,
    description,
  };
}
