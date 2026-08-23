import { Injectable } from '@angular/core';
import { normalizeLegacyUtcDateKey } from '../../shared/utils/daily-activity.utils';
import { SerpentileGameState } from './serpentile.models';

@Injectable({ providedIn: 'root' })
export class SerpentileStorageService {
  private readonly storageKey = 'game-dle-serpentile-state-v2';

  load(date: string): SerpentileGameState | null {
    try {
      const rawState = localStorage.getItem(this.storageKey);
      if (!rawState) return null;

      const state = JSON.parse(rawState) as SerpentileGameState;
      if (state.version !== 2 || normalizeLegacyUtcDateKey(state.date) !== date) {
        return null;
      }

      return state.date === date ? state : { ...state, date };
    } catch {
      return null;
    }
  }

  save(state: SerpentileGameState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
