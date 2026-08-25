import { TestBed } from '@angular/core/testing';
import { PalmodleEngineService } from './palmodle-engine.service';
import { PalmodlePair, PalmodlePerson } from './palmodle.models';

describe('PalmodleEngineService', () => {
  let service: PalmodleEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PalmodleEngineService);
  });

  it('creates stable pairs with two different people', () => {
    expect(service.createPair(3, 4)).toEqual(service.createPair(3, 4));
    expect(service.createPair(3, 4).left.id).not.toBe(service.createPair(3, 4).right.id);
    expect(service.createPair(3, 5)).not.toEqual(service.createPair(3, 4));
  });

  it('identifies who died first and calculates the year gap', () => {
    const pair: PalmodlePair = { left: person('old', '1900-01-01'), right: person('new', '1950-01-01') };
    expect(service.firstToDie(pair).id).toBe('old');
    expect(service.isCorrect(pair, 'old')).toBeTrue();
    expect(service.yearsApart(pair)).toBe(50);
  });

  it('builds a spoiler-free share result', () => {
    const text = service.buildShareText(2, [{ correct: true }, { correct: false }, { correct: true }]);
    expect(text).toContain('2/10');
    expect(text).toContain('🟩🟥🟩');
  });

  function person(id: string, deathDate: string): PalmodlePerson {
    return { id, deathDate, name: id, shortName: id, initials: id, field: '', country: '', born: 0, deathLabel: '', accent: '' };
  }
});
