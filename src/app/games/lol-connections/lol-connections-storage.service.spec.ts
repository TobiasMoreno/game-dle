import { TestBed } from '@angular/core/testing';
import { LolConnectionsState, LolConnectionsStorageService } from './lol-connections-storage.service';

describe('LolConnectionsStorageService', () => {
  let service: LolConnectionsStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LolConnectionsStorageService);
    localStorage.removeItem(service.storageKey);
  });

  it('stores readable connection groups', () => {
    const groups = Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      category: 'role',
      title: `Grupo ${index + 1}`,
      championIds: [1, 2, 3, 4].map((id) => id + index * 4),
      championNames: ['A', 'B', 'C', 'D'].map((name) => `${name}${index}`),
      qualifierChampionIds: [1, 2, 3, 4].map((id) => id + index * 4),
      qualifierChampionNames: ['A', 'B', 'C', 'D'].map((name) => `${name}${index}`),
    }));
    const state: LolConnectionsState = {
      version: 2,
      savedAt: new Date().toISOString(),
      groups,
      boardIds: groups.flatMap((group) => group.championIds),
      selectedIds: [],
      solvedGroupIds: [],
      imageUrls: [],
      score: 0,
      rounds: 0,
      errors: 0,
      roundComplete: false,
      feedback: '',
      feedbackKind: 'neutral',
    };

    service.save(state);

    expect(service.load()).toEqual(state);
  });

  it('ignores malformed stored connections', () => {
    localStorage.setItem(service.storageKey, JSON.stringify({ version: 2, groups: [] }));
    expect(service.load()).toBeNull();
  });
});
