import { SerpentileStorageService } from './serpentile-storage.service';

describe('SerpentileStorageService', () => {
  let service: SerpentileStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new SerpentileStorageService();
  });

  afterEach(() => localStorage.clear());

  it('restaura el progreso del día exacto', () => {
    const state = {
      version: 2 as const,
      date: '2026-08-13',
      status: 'running' as const,
      placements: [{ tileId: 'tile-1', q: 0, r: 0, rotation: 2 }],
      snake: { q: 0, r: 0, incomingSide: 3, trail: [{ q: 0, r: 0 }] },
      target: { q: 1, r: 0 },
      collected: 0,
      targetCount: 7,
      moves: 0,
    };

    service.save(state);

    expect(service.load('2026-08-13')).toEqual(state);
    expect(service.load('2026-08-14')).toBeNull();
  });

  it('ignora datos corruptos', () => {
    localStorage.setItem('game-dle-serpentile-state-v2', '{not-json');

    expect(service.load('2026-08-13')).toBeNull();
  });
});
