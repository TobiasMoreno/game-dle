import { TestBed } from '@angular/core/testing';
import { ChronodleStorageService } from './chronodle-storage.service';
import { ChronodleGameState } from './chronodle.models';

describe('ChronodleStorageService', () => {
  let service: ChronodleStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChronodleStorageService);
    localStorage.clear();
  });

  it('restores the current unlimited round', () => {
    const state: ChronodleGameState = {
      version: 2,
      round: 12,
      status: 'playing',
      order: ['a', 'b'],
      attempts: [],
    };

    service.save(state);

    expect(service.load()).toEqual(state);
  });

  it('ignores invalid stored rounds', () => {
    localStorage.setItem('game-dle-chronodle-state-v2', JSON.stringify({ version: 2, round: 0 }));

    expect(service.load()).toBeNull();
  });
});
