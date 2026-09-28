import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AdMobRewardItem,
  AdMobError,
  AdmobConsentInfo,
  AdmobConsentStatus,
} from '@capacitor-community/admob';
import { Subject } from 'rxjs';
import { RewardedAdRequest } from '../models/ad.model';
import { AppLifecycleService } from './app-lifecycle.service';
import { AppStorageService } from './app-storage.service';
import { ADMOB_CLIENT, AdMobClient, AdService } from './ad.service';
import { ObservabilityService } from './observability.service';
import { PlatformService } from './platform.service';

describe('AdService', () => {
  let service: AdService;
  let client: jasmine.SpyObj<AdMobClient>;
  let storage: jasmine.SpyObj<AppStorageService>;
  let observability: jasmine.SpyObj<ObservabilityService>;
  let rewardedListener: (reward: AdMobRewardItem) => void;
  let dismissedListener: () => void;
  let failedToShowListener: (error: AdMobError) => void;
  const active = signal(true);
  const connected = signal(true);
  const stateChanges = new Subject<boolean>();
  const request: RewardedAdRequest = {
    gameId: 'wordle',
    placement: 'hint',
    rewardType: 'hint',
  };

  beforeEach(() => {
    active.set(true);
    connected.set(true);
    client = jasmine.createSpyObj<AdMobClient>('AdMobClient', [
      'initialize',
      'requestConsentInfo',
      'showConsentForm',
      'showPrivacyOptionsForm',
      'prepareRewardVideoAd',
      'showRewardVideoAd',
      'onRewarded',
      'onDismissed',
      'onFailedToShow',
    ]);
    storage = jasmine.createSpyObj<AppStorageService>('AppStorageService', [
      'getItem',
      'setItem',
      'removeItem',
      'flush',
    ]);
    observability = jasmine.createSpyObj<ObservabilityService>(
      'ObservabilityService',
      ['trackAdEvent']
    );

    client.initialize.and.resolveTo();
    client.requestConsentInfo.and.resolveTo(consent(true));
    client.showConsentForm.and.resolveTo(consent(true));
    client.showPrivacyOptionsForm.and.resolveTo();
    client.prepareRewardVideoAd.and.resolveTo({ adUnitId: 'test-rewarded' });
    client.showRewardVideoAd.and.returnValue(new Promise(() => undefined));
    client.onRewarded.and.callFake(async (listener) => {
      rewardedListener = listener;
    });
    client.onDismissed.and.callFake(async (listener) => {
      dismissedListener = listener;
    });
    client.onFailedToShow.and.callFake(async (listener) => {
      failedToShowListener = listener;
    });
    storage.getItem.and.returnValue(null);
    storage.flush.and.resolveTo();
    observability.trackAdEvent.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        AdService,
        { provide: ADMOB_CLIENT, useValue: client },
        {
          provide: PlatformService,
          useValue: { isNative: true, isWeb: false, platform: 'android' },
        },
        {
          provide: AppLifecycleService,
          useValue: { active, connected, stateChanges },
        },
        { provide: AppStorageService, useValue: storage },
        { provide: ObservabilityService, useValue: observability },
      ],
    });
    service = TestBed.inject(AdService);
  });

  it('initializes UMP and only becomes ready when ads may be requested', async () => {
    await service.initialize();

    expect(client.initialize).toHaveBeenCalledTimes(1);
    expect(client.requestConsentInfo).toHaveBeenCalledTimes(1);
    expect(client.showConsentForm).not.toHaveBeenCalled();
    expect(service.state()).toBe('ready');
  });

  it('shows a required consent form before enabling ads', async () => {
    client.requestConsentInfo.and.resolveTo(
      consent(false, AdmobConsentStatus.REQUIRED, true)
    );

    await service.initialize();

    expect(client.showConsentForm).toHaveBeenCalledTimes(1);
    expect(service.state()).toBe('ready');
  });

  it('grants a reward exactly once when native emits duplicate reward events', async () => {
    await service.initialize();
    const grant = jasmine.createSpy('grant').and.resolveTo();

    const outcomePromise = service.showRewardedAd(request, grant);
    await waitUntil(() => client.showRewardVideoAd.calls.count() === 1);
    rewardedListener({ type: 'hint', amount: 1 });
    rewardedListener({ type: 'hint', amount: 1 });

    const outcome = await outcomePromise;
    expect(outcome.status).toBe('granted');
    expect(outcome.transactionId).toBeTruthy();
    expect(grant).toHaveBeenCalledOnceWith(outcome.transactionId!);
    expect(observability.trackAdEvent).toHaveBeenCalledWith(
      'reward_granted',
      jasmine.objectContaining(request)
    );
    const states = storage.setItem.calls
      .allArgs()
      .map(([, value]) => JSON.parse(value).state);
    expect(states).toContain('pending');
    expect(states).toContain('rewarded');
    expect(states).toContain('granted');
  });

  it('does not grant anything when the ad is dismissed early', async () => {
    await service.initialize();
    const grant = jasmine.createSpy('grant').and.resolveTo();

    const outcomePromise = service.showRewardedAd(request, grant);
    await waitUntil(() => client.showRewardVideoAd.calls.count() === 1);
    dismissedListener();

    await expectAsync(outcomePromise).toBeResolvedTo(
      jasmine.objectContaining({ status: 'dismissed' })
    );
    expect(grant).not.toHaveBeenCalled();
  });

  it('fails closed while offline or backgrounded', async () => {
    await service.initialize();
    const grant = jasmine.createSpy('grant');
    connected.set(false);

    await expectAsync(service.showRewardedAd(request, grant)).toBeResolvedTo({
      status: 'unavailable',
      reason: 'offline',
    });

    connected.set(true);
    active.set(false);
    await expectAsync(service.showRewardedAd(request, grant)).toBeResolvedTo({
      status: 'unavailable',
      reason: 'inactive',
    });
    expect(client.showRewardVideoAd).not.toHaveBeenCalled();
    expect(grant).not.toHaveBeenCalled();
  });

  it('does not request an ad when consent does not allow it', async () => {
    client.requestConsentInfo.and.resolveTo(
      consent(false, AdmobConsentStatus.REQUIRED)
    );
    await service.initialize();

    await expectAsync(
      service.showRewardedAd(request, jasmine.createSpy('grant'))
    ).toBeResolvedTo({
      status: 'unavailable',
      reason: 'consent_required',
    });
    expect(client.prepareRewardVideoAd).not.toHaveBeenCalled();
  });

  it('settles a native show error without granting a reward', async () => {
    await service.initialize();
    const grant = jasmine.createSpy('grant');

    const outcomePromise = service.showRewardedAd(request, grant);
    await waitUntil(() => client.showRewardVideoAd.calls.count() === 1);
    failedToShowListener({ code: 0, message: 'test failure' });

    await expectAsync(outcomePromise).toBeResolvedTo(
      jasmine.objectContaining({ status: 'failed', reason: 'show_failed' })
    );
    expect(grant).not.toHaveBeenCalled();
  });

  it('marks an interrupted transaction without replaying its reward', async () => {
    storage.getItem.and.returnValue(
      JSON.stringify({
        ...request,
        id: 'previous-transaction',
        state: 'rewarded',
        createdAt: 1,
      })
    );

    await service.initialize();

    const recovered = storage.setItem.calls
      .allArgs()
      .map(([, value]) => JSON.parse(value))
      .find(({ id }) => id === 'previous-transaction');
    expect(recovered.state).toBe('interrupted');
    expect(client.showRewardVideoAd).not.toHaveBeenCalled();
  });
});

function consent(
  canRequestAds: boolean,
  status = AdmobConsentStatus.NOT_REQUIRED,
  isConsentFormAvailable = false
): AdmobConsentInfo {
  return {
    canRequestAds,
    status,
    isConsentFormAvailable,
    privacyOptionsRequirementStatus: 'NOT_REQUIRED' as never,
  };
}

async function waitUntil(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 20 && !predicate(); attempt += 1) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  expect(predicate()).toBeTrue();
}
