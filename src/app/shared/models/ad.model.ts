export type RewardedAdPlacement = 'hint' | 'extra_attempt' | 'continue';

export type AdRewardType = 'hint' | 'extra_attempt' | 'continue';

export interface RewardedAdRequest {
  gameId: string;
  placement: RewardedAdPlacement;
  rewardType: AdRewardType;
}

export type RewardedAdFailureReason =
  | 'not_native'
  | 'inactive'
  | 'offline'
  | 'consent_required'
  | 'not_ready'
  | 'busy'
  | 'load_failed'
  | 'show_failed'
  | 'timeout'
  | 'grant_failed'
  | 'invalid_request';

export interface RewardedAdOutcome {
  status: 'granted' | 'dismissed' | 'unavailable' | 'failed';
  transactionId?: string;
  reason?: RewardedAdFailureReason;
}

export type RewardGrant = (transactionId: string) => void | Promise<void>;
