import { TestBed } from '@angular/core/testing';
import { RankdleGameState } from './rankdle.models';
import { RankdleStorageService } from './rankdle-storage.service';

describe('RankdleStorageService', () => {
  let service: RankdleStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RankdleStorageService);
    localStorage.clear();
  });

  it('restores the current unlimited round', () => {
    const state: RankdleGameState = {
      version: 1,
      round: 9,
      status: 'playing',
      order: ['a', 'b'],
      attempts: [],
    };

    service.save(state);

    expect(service.load()).toEqual(state);
  });

  it('ignores invalid stored rounds', () => {
    localStorage.setItem('game-dle-rankdle-state-v1', JSON.stringify({ version: 1, round: 0 }));

    expect(service.load()).toBeNull();
  });
});
