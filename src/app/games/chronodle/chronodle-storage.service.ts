import { Injectable, inject } from '@angular/core';
import { AppStorageService } from '../../shared/services/app-storage.service';
import { ChronodleGameState } from './chronodle.models';

@Injectable({ providedIn: 'root' })
export class ChronodleStorageService {
  private readonly storage = inject(AppStorageService);
  private readonly storageKey = 'game-dle-chronodle-state-v2';

  load(): ChronodleGameState | null {
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) return null;
      const state = JSON.parse(raw) as ChronodleGameState;
      return state.version === 2 && Number.isInteger(state.round) && state.round > 0 ? state : null;
    } catch {
      return null;
    }
  }

  save(state: ChronodleGameState): void {
    this.storage.setItem(this.storageKey, JSON.stringify(state));
  }
}
