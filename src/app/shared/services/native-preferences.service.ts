import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class NativePreferencesService {
  keys(): Promise<{ keys: string[] }> {
    return Preferences.keys();
  }

  get(key: string): Promise<{ value: string | null }> {
    return Preferences.get({ key });
  }

  set(key: string, value: string): Promise<void> {
    return Preferences.set({ key, value });
  }

  remove(key: string): Promise<void> {
    return Preferences.remove({ key });
  }
}
