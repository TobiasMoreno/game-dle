export const ADMOB_CONFIG = {
  enabled: true,
  testAdsOnly: true,
  appIds: {
    android: 'ca-app-pub-3940256099942544~3347511713',
    ios: 'ca-app-pub-3940256099942544~1458002511',
  },
  rewardedAdUnitIds: {
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  },
  loadTimeoutMs: 15_000,
  showTimeoutMs: 120_000,
} as const;
