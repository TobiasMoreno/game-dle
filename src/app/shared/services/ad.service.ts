import {
  Injectable,
  InjectionToken,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  AdLoadInfo,
  AdMob,
  AdMobError,
  AdMobRewardItem,
  AdmobConsentInfo,
  AdmobConsentStatus,
  RewardAdOptions,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { ADMOB_CONFIG } from '../config/admob.config';
import {
  RewardGrant,
  RewardedAdFailureReason,
  RewardedAdOutcome,
  RewardedAdRequest,
} from '../models/ad.model';
import { AppLifecycleService } from './app-lifecycle.service';
import { AppStorageService } from './app-storage.service';
import { ObservabilityService } from './observability.service';
import { PlatformService } from './platform.service';

const TRANSACTION_STORAGE_KEY = 'game-dle-ad-reward-transaction-v1';

type AdServiceState =
  | 'unsupported'
  | 'initializing'
  | 'ready'
  | 'consent_required'
  | 'error';

type TransactionState =
  | 'pending'
  | 'rewarded'
  | 'granted'
  | 'dismissed'
  | 'failed'
  | 'interrupted';

interface StoredTransaction extends RewardedAdRequest {
  id: string;
  state: TransactionState;
  createdAt: number;
}

interface ActiveTransaction extends StoredTransaction {
  grantReward: RewardGrant;
  resolve: (outcome: RewardedAdOutcome) => void;
  settled: boolean;
  settling: boolean;
  rewardIssued: boolean;
  timeoutId: ReturnType<typeof setTimeout>;
}

export interface AdMobClient {
  initialize(): Promise<void>;
  requestConsentInfo(): Promise<AdmobConsentInfo>;
  showConsentForm(): Promise<AdmobConsentInfo>;
  showPrivacyOptionsForm(): Promise<void>;
  prepareRewardVideoAd(options: RewardAdOptions): Promise<AdLoadInfo>;
  showRewardVideoAd(options: { adId: string }): Promise<AdMobRewardItem>;
  onRewarded(listener: (reward: AdMobRewardItem) => void): Promise<void>;
  onDismissed(listener: () => void): Promise<void>;
  onFailedToShow(listener: (error: AdMobError) => void): Promise<void>;
}

export const ADMOB_CLIENT = new InjectionToken<AdMobClient>('ADMOB_CLIENT', {
  providedIn: 'root',
  factory: () => ({
    initialize: () => AdMob.initialize(),
    requestConsentInfo: () => AdMob.requestConsentInfo(),
    showConsentForm: () => AdMob.showConsentForm(),
    showPrivacyOptionsForm: () => AdMob.showPrivacyOptionsForm(),
    prepareRewardVideoAd: (options) => AdMob.prepareRewardVideoAd(options),
    showRewardVideoAd: (options) => AdMob.showRewardVideoAd(options),
    onRewarded: async (listener) => {
      await AdMob.addListener(RewardAdPluginEvents.Rewarded, listener);
    },
    onDismissed: async (listener) => {
      await AdMob.addListener(RewardAdPluginEvents.Dismissed, listener);
    },
    onFailedToShow: async (listener) => {
      await AdMob.addListener(RewardAdPluginEvents.FailedToShow, listener);
    },
  }),
});

@Injectable({ providedIn: 'root' })
export class AdService {
  private readonly platform = inject(PlatformService);
  private readonly lifecycle = inject(AppLifecycleService);
  private readonly storage = inject(AppStorageService);
  private readonly observability = inject(ObservabilityService);
  private readonly client = inject(ADMOB_CLIENT);

  readonly state = signal<AdServiceState>('unsupported');
  readonly privacyOptionsRequired = signal(false);

  private initialization?: Promise<void>;
  private preloadPromise?: Promise<string | null>;
  private loadedAdId: string | null = null;
  private activeTransaction?: ActiveTransaction;
  private lastRequest?: RewardedAdRequest;
  private sequence = 0;

  constructor() {
    effect(() => {
      const shouldPreload =
        this.state() === 'ready' &&
        this.lifecycle.active() &&
        this.lifecycle.connected() &&
        !!this.lastRequest &&
        !this.activeTransaction;
      if (shouldPreload) {
        queueMicrotask(() => void this.preload(this.lastRequest!));
      }
    });
  }

  initialize(): Promise<void> {
    if (
      !ADMOB_CONFIG.enabled ||
      !this.platform.isNative ||
      typeof window === 'undefined'
    ) {
      this.state.set('unsupported');
      return Promise.resolve();
    }
    if (!this.initialization) {
      this.state.set('initializing');
      this.initialization = this.configure().catch(() => {
        this.state.set('error');
      });
    }
    return this.initialization;
  }

  async showPrivacyOptions(): Promise<void> {
    await this.initialize();
    if (!this.platform.isNative || !this.privacyOptionsRequired()) return;

    try {
      await this.client.showPrivacyOptionsForm();
      await this.refreshConsent();
    } catch {
      this.state.set('error');
    }
  }

  async showRewardedAd(
    request: RewardedAdRequest,
    grantReward: RewardGrant
  ): Promise<RewardedAdOutcome> {
    if (!this.isValidRequest(request)) {
      return { status: 'unavailable', reason: 'invalid_request' };
    }

    this.lastRequest = request;
    await this.observability.trackAdEvent('rewarded_ad_requested', request);
    await this.initialize();

    const unavailableReason = this.unavailableReason();
    if (unavailableReason) {
      await this.trackFailure(request, unavailableReason);
      return { status: 'unavailable', reason: unavailableReason };
    }

    const adId = await this.preload(request);
    if (!adId) {
      return { status: 'unavailable', reason: 'load_failed' };
    }

    const transaction = this.createTransaction(request, grantReward);
    this.activeTransaction = transaction;
    this.loadedAdId = null;
    await this.persistTransaction(transaction, 'pending');

    const outcome = new Promise<RewardedAdOutcome>((resolve) => {
      transaction.resolve = resolve;
    });
    transaction.timeoutId = setTimeout(
      () => void this.failActive('timeout'),
      ADMOB_CONFIG.showTimeoutMs
    );

    void this.client
      .showRewardVideoAd({ adId })
      .then((reward) => this.handleReward(reward))
      .catch(() => this.failActive('show_failed'));

    return outcome;
  }

  private async configure(): Promise<void> {
    await this.recoverInterruptedTransaction();
    await Promise.all([
      this.client.onRewarded((reward) => void this.handleReward(reward)),
      this.client.onDismissed(() => void this.dismissActive()),
      this.client.onFailedToShow(() => void this.failActive('show_failed')),
    ]);
    await this.client.initialize();
    await this.refreshConsent(true);
  }

  private async refreshConsent(showRequiredForm = false): Promise<void> {
    let consent = await this.client.requestConsentInfo();
    if (
      showRequiredForm &&
      consent.status === AdmobConsentStatus.REQUIRED &&
      consent.isConsentFormAvailable
    ) {
      consent = await this.client.showConsentForm();
    }

    this.privacyOptionsRequired.set(
      consent.privacyOptionsRequirementStatus === 'REQUIRED'
    );
    this.state.set(consent.canRequestAds ? 'ready' : 'consent_required');
  }

  private unavailableReason(): RewardedAdFailureReason | null {
    if (!this.platform.isNative) return 'not_native';
    if (!this.lifecycle.active()) return 'inactive';
    if (!this.lifecycle.connected()) return 'offline';
    if (this.activeTransaction) return 'busy';
    if (this.state() === 'consent_required') return 'consent_required';
    if (this.state() !== 'ready') return 'not_ready';
    return null;
  }

  private preload(request: RewardedAdRequest): Promise<string | null> {
    if (this.loadedAdId) return Promise.resolve(this.loadedAdId);
    if (this.preloadPromise) return this.preloadPromise;
    if (
      this.state() !== 'ready' ||
      !this.lifecycle.active() ||
      !this.lifecycle.connected()
    ) {
      return Promise.resolve(null);
    }

    const adId = this.rewardedAdUnitId;
    if (!adId) return Promise.resolve(null);

    this.preloadPromise = this.withTimeout(
      this.client.prepareRewardVideoAd({
        adId,
        isTesting: ADMOB_CONFIG.testAdsOnly,
        npa: true,
        immersiveMode: true,
      }),
      ADMOB_CONFIG.loadTimeoutMs
    )
      .then(async ({ adUnitId }) => {
        this.loadedAdId = adUnitId;
        await this.observability.trackAdEvent('rewarded_ad_loaded', request);
        return adUnitId;
      })
      .catch(async () => {
        await this.trackFailure(request, 'load_failed');
        return null;
      })
      .finally(() => {
        this.preloadPromise = undefined;
      });

    return this.preloadPromise;
  }

  private async handleReward(_reward: AdMobRewardItem): Promise<void> {
    const transaction = this.activeTransaction;
    if (!transaction || transaction.settled || transaction.rewardIssued) return;
    transaction.rewardIssued = true;

    await this.persistTransaction(transaction, 'rewarded');
    await this.observability.trackAdEvent('rewarded_ad_completed', transaction);

    try {
      await transaction.grantReward(transaction.id);
      await this.observability.trackAdEvent('reward_granted', transaction);
      await this.settleActive(
        { status: 'granted', transactionId: transaction.id },
        'granted'
      );
    } catch {
      await this.trackFailure(transaction, 'grant_failed');
      await this.settleActive(
        {
          status: 'failed',
          transactionId: transaction.id,
          reason: 'grant_failed',
        },
        'failed'
      );
    }
  }

  private async dismissActive(): Promise<void> {
    const transaction = this.activeTransaction;
    if (
      !transaction ||
      transaction.settled ||
      transaction.settling ||
      transaction.rewardIssued
    )
      return;
    transaction.settling = true;
    await this.settleActive(
      { status: 'dismissed', transactionId: transaction.id },
      'dismissed'
    );
  }

  private async failActive(reason: RewardedAdFailureReason): Promise<void> {
    const transaction = this.activeTransaction;
    if (
      !transaction ||
      transaction.settled ||
      transaction.settling ||
      transaction.rewardIssued
    )
      return;
    transaction.settling = true;
    await this.trackFailure(transaction, reason);
    await this.settleActive(
      { status: 'failed', transactionId: transaction.id, reason },
      'failed'
    );
  }

  private async settleActive(
    outcome: RewardedAdOutcome,
    finalState: TransactionState
  ): Promise<void> {
    const transaction = this.activeTransaction;
    if (!transaction || transaction.settled) return;
    transaction.settled = true;
    clearTimeout(transaction.timeoutId);
    await this.persistTransaction(transaction, finalState);
    this.activeTransaction = undefined;
    transaction.resolve(outcome);

    if (this.lastRequest) {
      queueMicrotask(() => void this.preload(this.lastRequest!));
    }
  }

  private createTransaction(
    request: RewardedAdRequest,
    grantReward: RewardGrant
  ): ActiveTransaction {
    const id = this.createTransactionId();
    return {
      ...request,
      id,
      state: 'pending',
      createdAt: Date.now(),
      grantReward,
      resolve: () => undefined,
      settled: false,
      settling: false,
      rewardIssued: false,
      timeoutId: 0 as unknown as ReturnType<typeof setTimeout>,
    };
  }

  private async persistTransaction(
    transaction: StoredTransaction,
    state: TransactionState
  ): Promise<void> {
    transaction.state = state;
    const stored: StoredTransaction = {
      id: transaction.id,
      gameId: transaction.gameId,
      placement: transaction.placement,
      rewardType: transaction.rewardType,
      state,
      createdAt: transaction.createdAt,
    };
    this.storage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(stored));
    await this.storage.flush();
  }

  private async recoverInterruptedTransaction(): Promise<void> {
    const raw = this.storage.getItem(TRANSACTION_STORAGE_KEY);
    if (!raw) return;
    try {
      const transaction = JSON.parse(raw) as StoredTransaction;
      if (transaction.state === 'pending' || transaction.state === 'rewarded') {
        await this.persistTransaction(transaction, 'interrupted');
      }
    } catch {
      this.storage.removeItem(TRANSACTION_STORAGE_KEY);
      await this.storage.flush();
    }
  }

  private async trackFailure(
    request: RewardedAdRequest,
    reason: RewardedAdFailureReason
  ): Promise<void> {
    await this.observability.trackAdEvent(
      'rewarded_ad_failed',
      request,
      reason
    );
  }

  private isValidRequest(request: RewardedAdRequest): boolean {
    return (
      /^[a-z0-9-]{1,40}$/.test(request.gameId) &&
      ['hint', 'extra_attempt', 'continue'].includes(request.placement) &&
      ['hint', 'extra_attempt', 'continue'].includes(request.rewardType)
    );
  }

  private createTransactionId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    this.sequence += 1;
    return `ad-${Date.now()}-${this.sequence}`;
  }

  private get rewardedAdUnitId(): string | null {
    if (this.platform.platform === 'android') {
      return ADMOB_CONFIG.rewardedAdUnitIds.android;
    }
    if (this.platform.platform === 'ios') {
      return ADMOB_CONFIG.rewardedAdUnitIds.ios;
    }
    return null;
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(
        () => reject(new Error('timeout')),
        timeoutMs
      );
      promise.then(
        (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }
}
