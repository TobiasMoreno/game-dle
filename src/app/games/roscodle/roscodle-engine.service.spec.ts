import { TestBed } from '@angular/core/testing';
import { RoscoEngineService } from './roscodle-engine.service';
import { RoscoQuestion } from './roscodle.models';

describe('RoscoEngineService', () => {
  let service: RoscoEngineService;
  const question: RoscoQuestion = {
    letter: 'A', relation: 'starts', clue: 'Pista', answer: 'Agüero', aliases: ['Kun Agüero'],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoscoEngineService);
  });

  it('accepts answers without accents and configured aliases', () => {
    expect(service.isCorrect(question, 'aguero')).toBeTrue();
    expect(service.isCorrect(question, ' Kun Agüero ')).toBeTrue();
    expect(service.isCorrect(question, 'Messi')).toBeFalse();
  });

  it('finds the next unresolved letter and wraps around', () => {
    const letters = service.createLetters([question, { ...question, letter: 'B' }, { ...question, letter: 'C' }]);
    letters[0].status = 'pending';
    letters[1].status = 'correct';
    letters[2].status = 'current';
    expect(service.nextPendingIndex(letters, 2)).toBe(0);
  });
});
