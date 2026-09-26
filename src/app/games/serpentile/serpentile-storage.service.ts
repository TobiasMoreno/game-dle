import { Injectable, inject } from '@angular/core';
import { normalizeLegacyUtcDateKey } from '../../shared/utils/daily-activity.utils';
import { AppStorageService } from '../../shared/services/app-storage.service';
import { SerpentileGameState } from './serpentile.models';

@Injectable({ providedIn: 'root' })
export class SerpentileStorageService {
  private readonly storage = inject(AppStorageService);
  private readonly storageKey = 'game-dle-serpentile-state-v2';

  load(date: string): SerpentileGameState | null {
    try {
      const rawState = this.storage.getItem(this.storageKey);
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
    this.storage.setItem(this.storageKey, JSON.stringify(state));
  }

  clear(): void {
    this.storage.removeItem(this.storageKey);
  }
}
