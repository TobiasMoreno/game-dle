import { GameProgress, GameState } from '../models/game.model';
import {
  buildGamePresentationState,
  GamePresentationCandidate,
  groupGameCatalog,
  selectNextGameRecommendation,
} from './game-presentation.service';

describe('game presentation state', () => {
  const now = new Date('2026-08-23T18:00:00-03:00');
  const game = (overrides: Partial<GameState> = {}): GameState => ({
    id: 'wordle',
    name: 'Wordle',
    description: 'Adivina la palabra',
    route: '/games/wordle',
    icon: 'fas fa-font',
    mode: 'daily',
    ...overrides,
  });
  const progress = (overrides: Partial<GameProgress> = {}): GameProgress => ({
    date: '2026-08-23',
    currentAttempt: 2,
    maxAttempts: 6,
    gameWon: false,
    gameLost: false,
    attempts: [['A'], ['B']],
    lastUpdated: now.getTime(),
    ...overrides,
  });

  it('presents an untouched daily game as available', () => {
    expect(buildGamePresentationState(game(), null, now)).toEqual({
      status: 'available',
      modeLabel: 'Diario',
      statusLabel: 'Disponible hoy',
      actionLabel: 'Jugar',
      action: 'play',
      tone: 'neutral',
    });
  });

  it('presents current daily progress with the next attempt', () => {
    const state = buildGamePresentationState(game(), progress(), now);
    expect(state.statusLabel).toBe('Intento 3 de 6');
    expect(state.action).toBe('continue');
  });

  it('ignores stale progress for a daily game', () => {
    const state = buildGamePresentationState(game(), progress({ date: '2026-08-22' }), now);
    expect(state.status).toBe('available');
  });

  it('presents a won daily game without hardcoding six attempts', () => {
    const state = buildGamePresentationState(game({
      dailyState: { date: '2026-08-23', completed: true, won: true, attempts: 1, maxAttempts: 8 },
    }), null, now);
    expect(state.statusLabel).toBe('Completado en 1 intento');
    expect(state.tone).toBe('success');
  });

  it('presents a lost daily game as completed', () => {
    const state = buildGamePresentationState(game({
      dailyState: { date: '2026-08-23', completed: true, won: false, attempts: 8, maxAttempts: 8 },
    }), null, now);
    expect(state.statusLabel).toBe('Completado hoy');
    expect(state.tone).toBe('danger');
  });

  it('presents a score-based daily game using its score', () => {
    const state = buildGamePresentationState(game({
      id: 'serpentile',
      scoreBased: true,
      dailyState: { date: '2026-08-23', completed: true, gameData: { score: 500 } },
    }), null, now);
    expect(state.statusLabel).toBe('500 puntos hoy');
    expect(state.action).toBe('view-result');
  });

  it('presents active unlimited progress as continuable', () => {
    const state = buildGamePresentationState(game({ mode: 'unlimited' }), progress({ date: '2026-08-01' }), now);
    expect(state.modeLabel).toBe('Sin límite');
    expect(state.statusLabel).toBe('Partida en curso');
    expect(state.action).toBe('continue');
  });

  it('presents multiplayer as a distinct mode', () => {
    const state = buildGamePresentationState(game({ mode: 'multiplayer' }), null, now);
    expect(state.modeLabel).toBe('Con amigos');
    expect(state.actionLabel).toBe('Crear o unirse');
  });
});

describe('next game recommendation', () => {
  const makeCandidate = (
    id: string,
    mode: GameState['mode'],
    status: 'available' | 'in-progress' | 'completed',
    action: 'play' | 'continue' | 'view-result',
    lastUpdated = 0
  ): GamePresentationCandidate => ({
    game: {
      id,
      name: id,
      description: `${id} description`,
      route: `/games/${id}`,
      icon: 'fas fa-gamepad',
      mode,
    },
    presentation: {
      status,
      modeLabel: mode === 'daily' ? 'Diario' : mode === 'multiplayer' ? 'Con amigos' : 'Sin límite',
      statusLabel: status,
      actionLabel: action === 'continue' ? 'Continuar' : action === 'view-result' ? 'Ver resultado' : 'Jugar',
      action,
      tone: status === 'completed' ? 'success' : status === 'in-progress' ? 'progress' : 'neutral',
    },
    lastUpdated,
  });

  it('selects the most recently updated game in progress', () => {
    const result = selectNextGameRecommendation([
      makeCandidate('wordle', 'daily', 'in-progress', 'continue', 10),
      makeCandidate('geodle', 'unlimited', 'in-progress', 'continue', 20),
      makeCandidate('loldle', 'daily', 'available', 'play'),
    ]);
    expect(result?.game.id).toBe('geodle');
    expect(result?.reason).toBe('continue');
  });

  it('selects a pending daily game before an unlimited game', () => {
    const result = selectNextGameRecommendation([
      makeCandidate('wordle', 'daily', 'completed', 'view-result'),
      makeCandidate('loldle', 'daily', 'available', 'play'),
      makeCandidate('musicdle', 'unlimited', 'available', 'play'),
    ]);
    expect(result?.game.id).toBe('loldle');
    expect(result?.reason).toBe('daily');
  });

  it('selects an unlimited game when no daily challenge is pending', () => {
    const result = selectNextGameRecommendation([
      makeCandidate('wordle', 'daily', 'completed', 'view-result'),
      makeCandidate('musicdle', 'unlimited', 'available', 'play'),
    ]);
    expect(result?.game.id).toBe('musicdle');
    expect(result?.reason).toBe('unlimited');
  });

  it('falls back to multiplayer and handles an empty catalog', () => {
    const result = selectNextGameRecommendation([
      makeCandidate('tuttifrutti', 'multiplayer', 'available', 'play'),
    ]);
    expect(result?.reason).toBe('multiplayer');
    expect(selectNextGameRecommendation([])).toBeNull();
  });
});

describe('game catalog groups', () => {
  const game = (id: string, mode?: GameState['mode']): GameState => ({
    id,
    name: id,
    description: `${id} description`,
    route: `/games/${id}`,
    icon: 'fas fa-gamepad',
    mode,
  });

  it('groups games in daily, unlimited and multiplayer order', () => {
    const sections = groupGameCatalog([
      game('musicdle', 'unlimited'),
      game('tuttifrutti', 'multiplayer'),
      game('wordle', 'daily'),
      game('geodle', 'unlimited'),
    ]);

    expect(sections.map(({ id }) => id)).toEqual(['daily', 'unlimited', 'multiplayer']);
    expect(sections[1].games.map(({ id }) => id)).toEqual(['musicdle', 'geodle']);
  });

  it('treats legacy games as daily and omits empty sections', () => {
    const sections = groupGameCatalog([game('legacy')]);

    expect(sections).toHaveSize(1);
    expect(sections[0].id).toBe('daily');
    expect(sections[0].games[0].id).toBe('legacy');
  });
});
