import { Injectable, inject } from '@angular/core';
import { AppStorageService } from '../../shared/services/app-storage.service';
import { FutbolMayorGameState } from './futbol-mayor.models';

@Injectable({ providedIn: 'root' })
export class FutbolMayorStorageService {
  private readonly storage = inject(AppStorageService);
  private readonly key = 'game-dle-futbol-mayor-v1';

  load(): FutbolMayorGameState | null {
    try {
      const raw = this.storage.getItem(this.key);
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
      this.storage.setItem(this.key, JSON.stringify(state));
    } catch {
      // El juego sigue funcionando aunque el navegador bloquee el almacenamiento local.
    }
  }
}
