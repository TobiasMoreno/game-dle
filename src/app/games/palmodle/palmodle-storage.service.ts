import { Injectable } from '@angular/core';
import { PalmodleGameState } from './palmodle.models';

@Injectable({ providedIn: 'root' })
export class PalmodleStorageService {
  private readonly key = 'game-dle-palmodle-v1';

  load(): PalmodleGameState | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const value = JSON.parse(raw) as PalmodleGameState | (Omit<PalmodleGameState, 'version' | 'seed'> & { version: 1 });
      if (value.version === 2 && value.round >= 0 && value.round < 10) return value;
      if (value.version === 1) {
        return {
          version: 2,
          run: value.run + 1,
          seed: this.randomSeed(),
          round: 0,
          lives: 3,
          score: 0,
          bestScore: value.bestScore ?? 0,
          status: 'playing',
          answers: [],
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  save(state: PalmodleGameState): void {
    localStorage.setItem(this.key, JSON.stringify(state));
  }

  private randomSeed(): number {
    if (globalThis.crypto?.getRandomValues) {
      return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
    }
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }
}
