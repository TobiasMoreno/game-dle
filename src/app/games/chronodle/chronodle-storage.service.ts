import { Injectable } from '@angular/core';
import { ChronodleGameState } from './chronodle.models';

@Injectable({ providedIn: 'root' })
export class ChronodleStorageService {
  private readonly storageKey = 'game-dle-chronodle-state-v2';

  load(): ChronodleGameState | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const state = JSON.parse(raw) as ChronodleGameState;
      return state.version === 2 && Number.isInteger(state.round) && state.round > 0 ? state : null;
    } catch {
      return null;
    }
  }

  save(state: ChronodleGameState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }
}
