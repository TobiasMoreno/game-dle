import { MusicdleEngineService } from './musicdle-engine.service';
import { MusicdleStorageService } from './musicdle-storage.service';
import { TestBed } from '@angular/core/testing';

describe('MusicdleStorageService', () => {
  let service: MusicdleStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
    service = createService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('restaura una ronda activa con su progreso exacto', () => {
    const engine = new MusicdleEngineService();
    const filter = { kind: 'all' as const, value: '*', label: 'Todas las canciones' };
    const round = engine.pass(engine.createRound('song-1', filter, 100), 200);

    service.saveRound(round);

    expect(service.getRound()).toEqual(round);
  });

  it('excluye una canción durante 24 horas y luego limpia la entrada', () => {
    const start = 1_000;
    const oneDay = 24 * 60 * 60 * 1_000;

    service.addCooldown('song-1', 'played', start);

    expect(service.getCooldownSongIds(start + oneDay - 1).has('song-1')).toBeTrue();
    expect(service.getCooldownSongIds(start + oneDay).has('song-1')).toBeFalse();
  });

  it('conserva la selección múltiple y el filtro de la ronda al recargar', () => {
    const filter = {
      kind: 'collection' as const,
      value: 'Cuarteto',
      values: ['Cuarteto', 'Rock nacional'],
      label: 'Cuarteto + Rock nacional',
    };
    const round = new MusicdleEngineService().createRound('song-1', filter, 100);
    service.saveFilter(filter);
    service.saveRound(round);

    const restored = createService();
    expect(restored.getFilter()).toEqual(filter);
    expect(restored.getRound()?.filter).toEqual(filter);
  });

  it('reemplaza el motivo y renueva el vencimiento sin duplicar la canción', () => {
    service.addCooldown('song-1', 'played', 1_000);
    service.addCooldown('song-1', 'unavailable', 2_000);

    const storedEntries = JSON.parse(
      localStorage.getItem('game-dle-musicdle-cooldown-v1') ?? '[]'
    );

    expect(storedEntries.length).toBe(1);
    expect(storedEntries[0].reason).toBe('unavailable');
  });

  it('mantiene el volumen elegido entre instancias', () => {
    expect(service.getVolume()).toBe(100);

    service.saveVolume(15);
    const restoredService = createService();

    expect(restoredService.getVolume()).toBe(15);
    expect(localStorage.getItem('game-dle-musicdle-volume-v1')).toBe('15');
  });

  it('limita el volumen persistido al rango permitido', () => {
    service.saveVolume(125);
    expect(service.getVolume()).toBe(100);

    service.saveVolume(-10);
    expect(service.getVolume()).toBe(0);
  });

  function createService(): MusicdleStorageService {
    return TestBed.runInInjectionContext(() => new MusicdleStorageService());
  }
});
