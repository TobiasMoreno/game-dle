import { TestBed } from '@angular/core/testing';
import { AppStorageService } from './app-storage.service';
import { PlatformService } from './platform.service';
import { NativePreferencesService } from './native-preferences.service';

describe('AppStorageService', () => {
  let preferences: jasmine.SpyObj<NativePreferencesService>;

  beforeEach(() => {
    localStorage.clear();
    preferences = jasmine.createSpyObj<NativePreferencesService>('NativePreferencesService', [
      'keys', 'get', 'set', 'remove',
    ]);
    TestBed.configureTestingModule({
      providers: [
        AppStorageService,
        { provide: PlatformService, useValue: { isNative: true } },
        { provide: NativePreferencesService, useValue: preferences },
      ],
    });
  });

  afterEach(() => localStorage.clear());

  it('migra las claves existentes de GameDLE a Preferences sin copiar claves ajenas', async () => {
    localStorage.setItem('game-dle-progress', '{"wordle":true}');
    localStorage.setItem('unrelated-key', 'private');
    preferences.keys.and.resolveTo({ keys: [] });
    preferences.get.and.resolveTo({ value: null });
    preferences.set.and.resolveTo();

    const service = createNativeService();
    await service.initialize();

    expect(service.getItem('game-dle-progress')).toBe('{"wordle":true}');
    expect(preferences.set).toHaveBeenCalledWith('game-dle-progress', '{"wordle":true}');
    expect(preferences.set).not.toHaveBeenCalledWith('unrelated-key', 'private');
  });

  it('conserva el valor nativo cuando también existe una copia legacy', async () => {
    localStorage.setItem('colorMode', 'light');
    preferences.keys.and.resolveTo({ keys: ['colorMode'] });
    preferences.get.and.resolveTo({ value: 'dark' });
    preferences.set.and.resolveTo();

    const service = createNativeService();
    await service.initialize();

    expect(service.getItem('colorMode')).toBe('dark');
  });

  it('actualiza la caché inmediatamente y completa la escritura nativa al hacer flush', async () => {
    preferences.keys.and.resolveTo({ keys: [] });
    preferences.get.and.resolveTo({ value: null });
    preferences.set.and.resolveTo();
    const service = createNativeService();
    await service.initialize();

    service.setItem('game-dle-test', 'saved');
    expect(service.getItem('game-dle-test')).toBe('saved');
    await service.flush();

    expect(preferences.set).toHaveBeenCalledWith('game-dle-test', 'saved');
  });

  function createNativeService(): AppStorageService {
    return TestBed.inject(AppStorageService);
  }
});
