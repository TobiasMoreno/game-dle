import { SerpentileEngineService } from './serpentile-engine.service';
import { SerpentileGeneratorService } from './serpentile-generator.service';

describe('SerpentileGeneratorService', () => {
  let service: SerpentileGeneratorService;

  beforeEach(() => service = new SerpentileGeneratorService(new SerpentileEngineService()));

  it('genera exactamente el mismo desafío para una fecha', () => {
    const first = service.createDailyPuzzle('2026-08-13');
    const second = service.createDailyPuzzle('2026-08-13');
    expect(second).toEqual(first);
    expect(first.tiles.length).toBe(37);
    expect(first.initialState.placements.length).toBe(37);
  });

  it('cambia los recorridos cuando cambia la fecha', () => {
    expect(service.createDailyPuzzle('2026-08-14').tiles)
      .not.toEqual(service.createDailyPuzzle('2026-08-13').tiles);
  });

  it('genera rondas libres distintas y reproducibles para la misma fecha', () => {
    const daily = service.createDailyPuzzle('2026-08-23');
    const freeRound = service.createDailyPuzzle('2026-08-23', 1);

    expect(service.createDailyPuzzle('2026-08-23', 1)).toEqual(freeRound);
    expect(freeRound.tiles).not.toEqual(daily.tiles);
    expect(freeRound.initialState.round).toBe(1);
  });

  it('genera objetivos reproducibles que no coinciden con la serpiente', () => {
    const first = service.targetFor('2026-08-13', 2, 10, { q: 1, r: 0 });
    const second = service.targetFor('2026-08-13', 2, 10, { q: 1, r: 0 });
    expect(second).toEqual(first);
    expect(first).not.toEqual({ q: 1, r: 0 });
  });

  it('cubre los seis lados de cada bloque', () => {
    service.createDailyPuzzle('2026-08-13').tiles.forEach((tile) => {
      const sides = tile.paths.flatMap(({ from, to }) => [from, to]).sort();
      expect(sides).toEqual([0, 1, 2, 3, 4, 5]);
    });
  });
});
