import { TestBed } from '@angular/core/testing';
import { GeodleEngineService } from './geodle-engine.service';
import { GeodleCountry } from './geodle.models';

describe('GeodleEngineService', () => {
  let service: GeodleEngineService;
  const argentina: GeodleCountry = {
    code: 'AR', code3: 'ARG', name: 'Argentina', aliases: ['Argentine Republic'], capital: 'Buenos Aires',
    continent: 'América', subregion: 'América del Sur', languages: ['español'], currencies: ['peso argentino'],
    areaKm2: 2780400, population: 45376763, coordinates: [-34, -64], borders: ['BOL', 'BRA', 'CHL', 'PRY', 'URY'],
    flagPath: 'img_flags/ar.svg',
  };
  const uruguay: GeodleCountry = {
    code: 'UY', code3: 'URY', name: 'Uruguay', aliases: ['Oriental Republic of Uruguay'], capital: 'Montevideo',
    continent: 'América', subregion: 'América del Sur', languages: ['español'], currencies: ['peso uruguayo'],
    areaKm2: 181034, population: 3473727, coordinates: [-33, -56], borders: ['ARG', 'BRA'],
    flagPath: 'img_flags/uy.svg',
  };
  const japan: GeodleCountry = {
    code: 'JP', code3: 'JPN', name: 'Japón', aliases: ['Japan'], capital: 'Tokyo', continent: 'Asia',
    subregion: 'Asia Oriental', languages: ['japonés'], currencies: ['yen japonés'], areaKm2: 377930,
    population: 125836021, coordinates: [36, 138], borders: [], flagPath: 'img_flags/jp.svg',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeodleEngineService);
  });

  it('elige el mismo país para la misma fecha sin depender del orden', () => {
    expect(service.getDailyCountry([argentina, uruguay, japan], '2026-08-17').code)
      .toBe(service.getDailyCountry([japan, argentina, uruguay], '2026-08-17').code);
  });

  it('elige un país aleatorio distinto al de la ronda anterior', () => {
    spyOn(Math, 'random').and.returnValue(0);
    expect(service.getRandomCountry([argentina, uruguay, japan], argentina.code).code).toBe('UY');
  });

  it('busca por nombre sin depender de mayúsculas o tildes', () => {
    expect(service.findCountry([argentina, japan], 'japon')?.code).toBe('JP');
    expect(service.filterCountries([argentina, japan], 'ARG', [])[0].code).toBe('AR');
  });

  it('compara coincidencias exactas, parciales y magnitudes', () => {
    const result = service.compare(uruguay, argentina);
    expect(result.continent.status).toBe('correct');
    expect(result.subregion.status).toBe('correct');
    expect(result.hemisphere.status).toBe('correct');
    expect(result.languages.status).toBe('correct');
    expect(result.area.arrow).toBe('up');
    expect(result.population.arrow).toBe('up');
    expect(result.borders.arrow).toBe('up');
  });

  it('marca hemisferio incorrecto cuando no comparte ningún eje', () => {
    expect(service.compare(japan, argentina).hemisphere.status).toBe('wrong');
    expect(service.compare(japan, uruguay).hemisphere.status).toBe('wrong');
  });
});
