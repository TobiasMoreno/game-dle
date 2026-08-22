import { Injectable } from '@angular/core';
import { RankdleGameState } from './rankdle.models';

@Injectable({ providedIn: 'root' })
export class RankdleStorageService {
  private readonly storageKey = 'game-dle-rankdle-state-v1';

  load(): RankdleGameState | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const state = JSON.parse(raw) as RankdleGameState;
      return state.version === 1 && Number.isInteger(state.round) && state.round > 0 ? state : null;
    } catch {
      return null;
    }
  }

  save(state: RankdleGameState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }
}
