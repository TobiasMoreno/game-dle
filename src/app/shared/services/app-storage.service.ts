import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';
import { NativePreferencesService } from './native-preferences.service';
import { AppLifecycleService } from './app-lifecycle.service';

const MIGRATION_KEY = 'game-dle-preferences-migration-v1';

@Injectable({ providedIn: 'root' })
export class AppStorageService {
  private readonly cache = new Map<string, string>();
  private pendingWrite: Promise<void> = Promise.resolve();

  constructor(
    private readonly platform: PlatformService,
    private readonly preferences: NativePreferencesService,
    lifecycle: AppLifecycleService,
  ) {
    lifecycle.stateChanges.subscribe((isActive) => {
      if (!isActive) void this.flush();
    });
  }

  async initialize(): Promise<void> {
    if (!this.platform.isNative) return;

    try {
      const { keys } = await this.preferences.keys();
      await Promise.all(keys.map(async (key) => {
        const { value } = await this.preferences.get(key);
        if (value !== null) this.cache.set(key, value);
      }));
      await this.migrateLegacyLocalStorage();
    } catch (error) {
      console.error('No se pudo inicializar el almacenamiento nativo:', error);
    }
  }

  getItem(key: string): string | null {
    if (!this.platform.isNative) return this.browserStorage?.getItem(key) ?? null;
    if (this.cache.has(key)) return this.cache.get(key) ?? null;

    const legacyValue = this.browserStorage?.getItem(key) ?? null;
    if (legacyValue !== null) {
      this.cache.set(key, legacyValue);
      this.enqueue(() => this.preferences.set(key, legacyValue));
    }
    return legacyValue;
  }

  setItem(key: string, value: string): void {
    if (!this.platform.isNative) {
      this.browserStorage?.setItem(key, value);
      return;
    }
    this.cache.set(key, value);
    this.enqueue(() => this.preferences.set(key, value));
  }

  removeItem(key: string): void {
    if (!this.platform.isNative) {
      this.browserStorage?.removeItem(key);
      return;
    }
    this.cache.delete(key);
    this.enqueue(() => this.preferences.remove(key));
  }

  async flush(): Promise<void> {
    await this.pendingWrite;
  }

  private async migrateLegacyLocalStorage(): Promise<void> {
    if (this.cache.get(MIGRATION_KEY) === 'complete') return;
    const storage = this.browserStorage;
    if (!storage) return;

    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key || !this.isGameDleKey(key) || this.cache.has(key)) continue;
      const value = storage.getItem(key);
      if (value === null) continue;
      await this.preferences.set(key, value);
      this.cache.set(key, value);
    }

    await this.preferences.set(MIGRATION_KEY, 'complete');
    this.cache.set(MIGRATION_KEY, 'complete');
  }

  private isGameDleKey(key: string): boolean {
    return key === 'colorMode' || /^(game-dle-|game_progress_|tuttifrutti-)/.test(key);
  }

  private enqueue(operation: () => Promise<unknown>): void {
    this.pendingWrite = this.pendingWrite
      .then(() => operation())
      .then(() => undefined)
      .catch((error) => console.error('No se pudo persistir un dato de GameDLE:', error));
  }

  private get browserStorage(): Storage | null {
    try {
      return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
      return null;
    }
  }
}
