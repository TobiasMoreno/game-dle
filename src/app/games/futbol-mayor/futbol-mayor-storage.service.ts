import { Injectable } from '@angular/core';
import { FutbolMayorGameState } from './futbol-mayor.models';

@Injectable({ providedIn: 'root' })
export class FutbolMayorStorageService {
  private readonly key = 'game-dle-futbol-mayor-v1';

  load(): FutbolMayorGameState | null {
    try {
      const raw = globalThis.localStorage?.getItem(this.key);
      if (!raw) return null;
      const value = JSON.parse(raw) as FutbolMayorGameState;
      return value.version === 1 && value.round >= 0 && value.round < 10
        ? value
        : null;
    } catch {
      return null;
    }
  }

  save(state: FutbolMayorGameState): void {
    try {
      globalThis.localStorage?.setItem(this.key, JSON.stringify(state));
    } catch {
      // El juego sigue funcionando aunque el navegador bloquee el almacenamiento local.
    }
  }
}
