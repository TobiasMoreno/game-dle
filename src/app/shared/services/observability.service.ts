import { isPlatformBrowser } from '@angular/common';
import {
  ErrorHandler,
  Inject,
  Injectable,
  InjectionToken,
  PLATFORM_ID,
  inject,
  isDevMode,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import {
  ConsentStatus,
  ConsentType,
  FirebaseAnalytics,
  LogEventOptions,
  SetConsentOptions,
  SetCurrentScreenOptions,
} from '@capacitor-firebase/analytics';
import {
  CrashOptions,
  FirebaseCrashlytics,
  RecordExceptionOptions,
  SetCustomKeyOptions,
} from '@capacitor-firebase/crashlytics';
import { filter } from 'rxjs';
import { firebaseApp } from '../config/firebase.config';
import { GameMode } from '../models/game.model';
import { PlatformService } from './platform.service';

type AnalyticsValue = string | number;
type AnalyticsParams = Record<string, AnalyticsValue>;
export type NonFatalContext =
  | 'angular'
  | 'window_error'
  | 'unhandled_rejection'
  | 'observability';

export interface AnalyticsClient {
  setConsent(options: SetConsentOptions): Promise<void>;
  setCurrentScreen(options: SetCurrentScreenOptions): Promise<void>;
  logEvent(options: LogEventOptions): Promise<void>;
}

export interface CrashlyticsClient {
  setCustomKey(options: SetCustomKeyOptions): Promise<void>;
  recordException(options: RecordExceptionOptions): Promise<void>;
  crash(options: CrashOptions): Promise<void>;
}

export const FIREBASE_ANALYTICS = new InjectionToken<AnalyticsClient>(
  'FIREBASE_ANALYTICS',
  {
    providedIn: 'root',
    factory: () => {
      // El plugin web usa la app Firebase por defecto; se inicializa antes de
      // que el initializer de observabilidad emita el primer evento.
      void firebaseApp;
      return {
        setConsent: (options) => FirebaseAnalytics.setConsent(options),
        setCurrentScreen: (options) =>
          FirebaseAnalytics.setCurrentScreen(options),
        logEvent: (options) => FirebaseAnalytics.logEvent(options),
      };
    },
  }
);

export const FIREBASE_CRASHLYTICS = new InjectionToken<CrashlyticsClient>(
  'FIREBASE_CRASHLYTICS',
  {
    providedIn: 'root',
    factory: () => ({
      setCustomKey: (options) => FirebaseCrashlytics.setCustomKey(options),
      recordException: (options) =>
        FirebaseCrashlytics.recordException(options),
      crash: (options) => FirebaseCrashlytics.crash(options),
    }),
  }
);

/**
 * Punto único de telemetría de GameDLE.
 *
 * Los parámetros se construyen aquí a partir de valores técnicos permitidos.
 * No se aceptan objetos libres, respuestas, nombres, UID ni datos de partida.
 */
@Injectable({ providedIn: 'root' })
export class ObservabilityService {
  private readonly router = inject(Router);
  private readonly platform = inject(PlatformService);
  private readonly analytics = inject(FIREBASE_ANALYTICS);
  private readonly crashlytics = inject(FIREBASE_CRASHLYTICS);
  private readonly isBrowser: boolean;
  private started = false;
  private ready: Promise<void> = Promise.resolve();
  private lastTrackedPath = '';

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  initialize(): Promise<void> {
    if (!this.isBrowser || this.started) return this.ready;
    this.started = true;
    this.ready = this.configure().catch(() => undefined);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => void this.trackNavigation(event.urlAfterRedirects));

    window.addEventListener('error', (event) => {
      void this.recordNonFatal(event.error, 'window_error');
    });
    window.addEventListener('unhandledrejection', (event) => {
      void this.recordNonFatal(event.reason, 'unhandled_rejection');
    });

    void this.trackNavigation(this.router.url);
    return this.ready;
  }

  async trackGameCompleted(
    gameId: string,
    mode: GameMode | undefined,
    won: boolean,
    attempts: number,
    score?: number
  ): Promise<void> {
    const safeGameId = this.safeGameId(gameId);
    if (!this.isBrowser || !safeGameId) return;

    const params: AnalyticsParams = {
      game_id: safeGameId,
      game_mode: mode ?? 'unlimited',
      success: won ? 1 : 0,
      attempts: this.safeInteger(attempts, 0, 1000),
      platform: this.platform.platform,
    };
    if (typeof score === 'number' && Number.isFinite(score)) {
      params['score'] = this.safeInteger(score, -1_000_000, 1_000_000);
    }

    await this.logEvent('game_complete', params);
  }

  async recordNonFatal(
    error: unknown,
    context: NonFatalContext
  ): Promise<void> {
    if (!this.isBrowser || !this.platform.isNative) return;
    await this.ready;
    try {
      await this.crashlytics.recordException({
        message: `${context}:${this.errorType(error)}`,
        keysAndValues: [
          { key: 'context', value: context, type: 'string' },
          {
            key: 'route',
            value: this.safePath(this.router.url),
            type: 'string',
          },
        ],
      });
    } catch {
      // La observabilidad nunca debe romper el flujo principal de la aplicación.
    }
  }

  /** Fuerza un crash sólo en builds de desarrollo para validar el pipeline. */
  async crashForTesting(): Promise<void> {
    if (!isDevMode())
      throw new Error('El crash de prueba sólo está disponible en desarrollo.');
    if (!this.platform.isNative)
      throw new Error('El crash de prueba requiere Android o iOS.');
    await this.ready;
    await this.crashlytics.crash({ message: 'GameDLE controlled test crash' });
  }

  private async configure(): Promise<void> {
    await this.analytics.setConsent({
      type: ConsentType.AdStorage,
      status: ConsentStatus.Denied,
    });
    await this.analytics.setConsent({
      type: ConsentType.AdUserData,
      status: ConsentStatus.Denied,
    });
    await this.analytics.setConsent({
      type: ConsentType.AdPersonalization,
      status: ConsentStatus.Denied,
    });
    await this.analytics.setConsent({
      type: ConsentType.AnalyticsStorage,
      status: ConsentStatus.Granted,
    });

    if (this.platform.isNative) {
      await this.crashlytics.setCustomKey({
        key: 'platform',
        value: this.platform.platform,
        type: 'string',
      });
    }
  }

  private async trackNavigation(rawUrl: string): Promise<void> {
    if (!this.isBrowser) return;
    const path = this.safePath(rawUrl);
    if (path === this.lastTrackedPath) return;
    this.lastTrackedPath = path;
    await this.ready;

    try {
      await this.analytics.setCurrentScreen({
        screenName: path,
        screenClassOverride: 'AngularRoute',
      });
      const gameId = path.match(/^\/games\/([a-z0-9-]+)$/)?.[1];
      if (gameId) {
        await this.analytics.logEvent({
          name: 'game_start',
          params: {
            game_id: gameId,
            platform: this.platform.platform,
          },
        });
      }
      if (this.platform.isNative) {
        await this.crashlytics.setCustomKey({
          key: 'route',
          value: path,
          type: 'string',
        });
      }
    } catch {
      // La navegación debe seguir funcionando aunque el SDK no esté disponible.
    }
  }

  private async logEvent(name: string, params: AnalyticsParams): Promise<void> {
    await this.ready;
    try {
      await this.analytics.logEvent({ name, params });
    } catch {
      // No se reintentan eventos para evitar duplicados y bloquear la UI.
    }
  }

  private safePath(rawUrl: string): string {
    const path = rawUrl.split('?')[0].split('#')[0] || '/';
    return /^\/[a-z0-9/-]*$/i.test(path) ? path.slice(0, 100) : '/unknown';
  }

  private safeGameId(gameId: string): string | null {
    return /^[a-z0-9-]{1,40}$/.test(gameId) ? gameId : null;
  }

  private safeInteger(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Math.round(value)));
  }

  private errorType(error: unknown): string {
    if (error instanceof Error) {
      const name = error.name || error.constructor.name;
      return /^[A-Za-z][A-Za-z0-9]{0,39}$/.test(name) ? name : 'Error';
    }
    return 'NonError';
  }
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly observability = inject(ObservabilityService);

  handleError(error: unknown): void {
    void this.observability.recordNonFatal(error, 'angular');
    console.error(error);
  }
}
