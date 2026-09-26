import { Injectable, inject } from '@angular/core';
import { AppStorageService } from '../../shared/services/app-storage.service';
import { RankdleGameState } from './rankdle.models';

@Injectable({ providedIn: 'root' })
export class RankdleStorageService {
  private readonly storage = inject(AppStorageService);
  private readonly storageKey = 'game-dle-rankdle-state-v1';

  load(): RankdleGameState | null {
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) return null;
      const state = JSON.parse(raw) as RankdleGameState;
      return state.version === 1 && Number.isInteger(state.round) && state.round > 0 ? state : null;
    } catch {
      return null;
    }
  }

  save(state: RankdleGameState): void {
    this.storage.setItem(this.storageKey, JSON.stringify(state));
  }
}
