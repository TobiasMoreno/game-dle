import { MusicdleEngineService } from './musicdle-engine.service';
import { MusicdleStorageService } from './musicdle-storage.service';

describe('MusicdleStorageService', () => {
  let service: MusicdleStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new MusicdleStorageService();
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
    const restoredService = new MusicdleStorageService();

    expect(restoredService.getVolume()).toBe(15);
    expect(localStorage.getItem('game-dle-musicdle-volume-v1')).toBe('15');
  });

  it('limita el volumen persistido al rango permitido', () => {
    service.saveVolume(125);
    expect(service.getVolume()).toBe(100);

    service.saveVolume(-10);
    expect(service.getVolume()).toBe(0);
  });
});
