import { Injectable } from '@angular/core';
import {
  MusicdleCooldownEntry,
  MusicdleFilter,
  MusicdleRoundState,
} from './musicdle.models';

const COOLDOWN_DURATION_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class MusicdleStorageService {
  private readonly roundKey = 'game-dle-musicdle-round-v2';
  private readonly legacyRoundKey = 'game-dle-musicdle-round-v1';
  private readonly cooldownKey = 'game-dle-musicdle-cooldown-v1';
  private readonly filterKey = 'game-dle-musicdle-filter-v1';

  getRound(): MusicdleRoundState | null {
    const round = this.read<MusicdleRoundState>(this.roundKey);
    if (!round) this.remove(this.legacyRoundKey);
    return round;
  }

  saveRound(round: MusicdleRoundState): void {
    this.write(this.roundKey, round);
  }

  clearRound(): void {
    this.remove(this.roundKey);
  }

  getFilter(): MusicdleFilter | null {
    return this.read<MusicdleFilter>(this.filterKey);
  }

  saveFilter(filter: MusicdleFilter): void {
    this.write(this.filterKey, filter);
  }

  addCooldown(
    songId: string,
    reason: MusicdleCooldownEntry['reason'],
    now = Date.now()
  ): void {
    const entries = this.getCooldownEntries(now).filter((entry) => entry.songId !== songId);
    entries.push({ songId, reason, expiresAt: now + COOLDOWN_DURATION_MS });
    this.write(this.cooldownKey, entries);
  }

  getCooldownSongIds(now = Date.now()): Set<string> {
    return new Set(this.getCooldownEntries(now).map((entry) => entry.songId));
  }

  private getCooldownEntries(now: number): MusicdleCooldownEntry[] {
    const entries = this.read<MusicdleCooldownEntry[]>(this.cooldownKey) ?? [];
    const activeEntries = entries.filter((entry) => entry.expiresAt > now);

    if (activeEntries.length !== entries.length) {
      this.write(this.cooldownKey, activeEntries);
    }

    return activeEntries;
  }

  private read<T>(key: string): T | null {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) as T : null;
    } catch (error) {
      console.error(`No se pudo leer ${key}:`, error);
      return null;
    }
  }

  private write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`No se pudo guardar ${key}:`, error);
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`No se pudo eliminar ${key}:`, error);
    }
  }
}
