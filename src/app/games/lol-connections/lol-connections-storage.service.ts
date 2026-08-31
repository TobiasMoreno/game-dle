import { Injectable } from '@angular/core';

export interface StoredConnectionGroup {
  id: number;
  category: string;
  title: string;
  championIds: number[];
  championNames: string[];
  qualifierChampionIds: number[];
  qualifierChampionNames: string[];
}

export interface LolConnectionsState {
  version: 2;
  savedAt: string;
  groups: StoredConnectionGroup[];
  boardIds: number[];
  selectedIds: number[];
  solvedGroupIds: number[];
  imageUrls: Array<[number, string]>;
  score: number;
  rounds: number;
  errors: number;
  roundComplete: boolean;
  feedback: string;
  feedbackKind: 'neutral' | 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class LolConnectionsStorageService {
  readonly storageKey = 'game-dle-lol-connections-state-v2';
  private readonly legacyStorageKey = 'game-dle-lol-connections-state-v1';

  load(): LolConnectionsState | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const state = JSON.parse(raw) as LolConnectionsState;
      if (
        state.version !== 2
        || !Array.isArray(state.groups)
        || state.groups.length !== 4
        || state.groups.some((group) =>
          !Array.isArray(group.championIds)
          || group.championIds.length !== 4
          || !Array.isArray(group.qualifierChampionIds)
        )
        || !Array.isArray(state.boardIds)
        || !Array.isArray(state.selectedIds)
        || !Array.isArray(state.solvedGroupIds)
        || !Array.isArray(state.imageUrls)
      ) return null;
      return state;
    } catch {
      return null;
    }
  }

  save(state: LolConnectionsState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
    localStorage.removeItem(this.legacyStorageKey);
  }
}
