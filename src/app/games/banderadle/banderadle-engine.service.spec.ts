import { TestBed } from '@angular/core/testing';
import {
  BANDERADLE_PIXEL_RESOLUTION_LEVELS,
  BanderadleEngineService,
} from './banderadle-engine.service';
import { BanderadleCountry } from './banderadle.models';

describe('BanderadleEngineService', () => {
  let service: BanderadleEngineService;
  const argentina = country('AR', 'ARG', 'Argentina', ['Argentine Republic']);
  const japan = country('JP', 'JPN', 'Japón', ['Japan']);
  const swaziland = country('SZ', 'SWZ', 'Suazilandia', ['Swaziland']);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BanderadleEngineService);
  });

  it('aplica los nombres actuales sin perder los nombres anteriores como alias', () => {
    const [prepared] = service.prepareCountries([swaziland]);

    expect(prepared.name).toBe('Esuatini');
    expect(service.findCountry([prepared], 'suazilandia')?.code).toBe('SZ');
  });

  it('busca nombres sin depender de mayúsculas ni tildes', () => {
    expect(service.findCountry([argentina, japan], 'japon')?.code).toBe('JP');
    expect(service.filterCountries([argentina, japan], 'ARG', [])[0].code).toBe('AR');
  });

  it('excluye países ya intentados de las sugerencias', () => {
    expect(service.filterCountries([argentina], 'arg', ['AR'])).toEqual([]);
  });

  it('evita repetir el país de la ronda anterior', () => {
    spyOn(Math, 'random').and.returnValue(0);
    expect(service.getRandomCountry([argentina, japan], 'AR').code).toBe('JP');
  });

  it('aumenta la resolución pixelada y revela por completo al terminar', () => {
    expect(service.pixelResolutionFor(0, 'active')).toBe(BANDERADLE_PIXEL_RESOLUTION_LEVELS[0]);
    expect(service.pixelResolutionFor(5, 'active')).toBe(0.28);
    expect(service.pixelResolutionFor(6, 'lost')).toBe(1);
    expect(service.pixelResolutionFor(2, 'won')).toBe(1);
  });

  function country(code: string, code3: string, name: string, aliases: string[]): BanderadleCountry {
    return {
      code,
      code3,
      name,
      aliases,
      capital: '',
      continent: '',
      flagPath: `img_flags/${code.toLowerCase()}.svg`,
    };
  }
});
