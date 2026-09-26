import { Injectable, inject, signal } from '@angular/core';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { Subject } from 'rxjs';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class AppLifecycleService {
  private readonly platform = inject(PlatformService);
  private readonly stateChangeSubject = new Subject<boolean>();
  readonly active = signal(true);
  readonly connected = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly stateChanges = this.stateChangeSubject.asObservable();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    if (this.platform.isNative) {
      try {
        const status = await Network.getStatus();
        this.connected.set(status.connected);
        await App.addListener('appStateChange', ({ isActive }) => this.updateActive(isActive));
        await Network.addListener('networkStatusChange', ({ connected }) => this.connected.set(connected));
      } catch (error) {
        console.error('No se pudo inicializar el lifecycle nativo:', error);
      }
      return;
    }

    document.addEventListener('visibilitychange', () => this.updateActive(!document.hidden));
    window.addEventListener('online', () => this.connected.set(true));
    window.addEventListener('offline', () => this.connected.set(false));
  }

  private updateActive(isActive: boolean): void {
    if (this.active() === isActive) return;
    this.active.set(isActive);
    this.stateChangeSubject.next(isActive);
  }
}
