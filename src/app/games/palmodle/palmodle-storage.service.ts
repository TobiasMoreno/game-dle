import { Injectable } from '@angular/core';
import { PalmodleGameState } from './palmodle.models';

@Injectable({ providedIn: 'root' })
export class PalmodleStorageService {
  private readonly key = 'game-dle-palmodle-v1';

  load(): PalmodleGameState | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const value = JSON.parse(raw) as PalmodleGameState;
      return value.version === 1 && value.round >= 0 && value.round < 10 ? value : null;
    } catch {
      return null;
    }
  }

  save(state: PalmodleGameState): void {
    localStorage.setItem(this.key, JSON.stringify(state));
  }
}
