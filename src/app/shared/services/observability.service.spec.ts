import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { PlatformService } from './platform.service';
import {
  AnalyticsClient,
  CrashlyticsClient,
  FIREBASE_ANALYTICS,
  FIREBASE_CRASHLYTICS,
  ObservabilityService,
} from './observability.service';

describe('ObservabilityService', () => {
  let service: ObservabilityService;
  let analytics: jasmine.SpyObj<AnalyticsClient>;
  let crashlytics: jasmine.SpyObj<CrashlyticsClient>;
  let routerEvents: Subject<NavigationEnd>;

  beforeEach(() => {
    analytics = jasmine.createSpyObj<AnalyticsClient>('FirebaseAnalytics', [
      'setConsent',
      'setCurrentScreen',
      'logEvent',
    ]);
    crashlytics = jasmine.createSpyObj<CrashlyticsClient>(
      'FirebaseCrashlytics',
      ['setCustomKey', 'recordException', 'crash']
    );
    analytics.setConsent.and.resolveTo();
    analytics.setCurrentScreen.and.resolveTo();
    analytics.logEvent.and.resolveTo();
    crashlytics.setCustomKey.and.resolveTo();
    crashlytics.recordException.and.resolveTo();
    crashlytics.crash.and.resolveTo();
    routerEvents = new Subject<NavigationEnd>();

    TestBed.configureTestingModule({
      providers: [
        ObservabilityService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: Router,
          useValue: { events: routerEvents, url: '/games/wordle?room=SECRET' },
        },
        {
          provide: PlatformService,
          useValue: { isNative: true, isWeb: false, platform: 'android' },
        },
        { provide: FIREBASE_ANALYTICS, useValue: analytics },
        { provide: FIREBASE_CRASHLYTICS, useValue: crashlytics },
      ],
    });
    service = TestBed.inject(ObservabilityService);
  });

  it('configures measurement-only consent and tracks a sanitized game screen', async () => {
    await service.initialize();
    await settlePromises();

    expect(analytics.setConsent).toHaveBeenCalledTimes(4);
    expect(analytics.setCurrentScreen).toHaveBeenCalledWith({
      screenName: '/games/wordle',
      screenClassOverride: 'AngularRoute',
    });
    expect(analytics.logEvent).toHaveBeenCalledWith({
      name: 'game_start',
      params: { game_id: 'wordle', platform: 'android' },
    });
    const forwardedValues = [
      ...analytics.setCurrentScreen.calls.allArgs(),
      ...analytics.logEvent.calls.allArgs(),
    ];
    expect(JSON.stringify(forwardedValues)).not.toContain('SECRET');
  });

  it('sends only the approved completion fields', async () => {
    await service.initialize();
    await service.trackGameCompleted('wordle', 'daily', true, 3, 42);

    expect(analytics.logEvent).toHaveBeenCalledWith({
      name: 'game_complete',
      params: {
        game_id: 'wordle',
        game_mode: 'daily',
        success: 1,
        attempts: 3,
        platform: 'android',
        score: 42,
      },
    });
  });

  it('rejects an unsafe game identifier instead of forwarding it', async () => {
    await service.initialize();
    await settlePromises();
    analytics.logEvent.calls.reset();

    await service.trackGameCompleted(
      'wordle:user@example.com',
      'daily',
      true,
      1
    );

    expect(analytics.logEvent).not.toHaveBeenCalled();
  });

  it('records a non-fatal without forwarding the original error message', async () => {
    await service.initialize();

    await service.recordNonFatal(new TypeError('respuesta-secreta'), 'angular');

    const payload = crashlytics.recordException.calls.mostRecent().args[0];
    expect(payload.message).toBe('angular:TypeError');
    expect(JSON.stringify(payload)).not.toContain('respuesta-secreta');
    expect(JSON.stringify(payload)).not.toContain('SECRET');
  });

  it('tracks each normalized route only once', async () => {
    await service.initialize();
    await settlePromises();
    analytics.setCurrentScreen.calls.reset();

    routerEvents.next(
      new NavigationEnd(1, '/games/wordle', '/games/wordle?again=1')
    );
    await settlePromises();

    expect(analytics.setCurrentScreen).not.toHaveBeenCalled();
  });
});

async function settlePromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
