import { isAdsenseSlotConfigured } from './adsense.config';

describe('AdSense config', () => {
  it('acepta IDs de unidad numéricos', () => {
    expect(isAdsenseSlotConfigured('1234567890')).toBeTrue();
  });

  it('rechaza valores vacíos y el publisher ID', () => {
    expect(isAdsenseSlotConfigured('')).toBeFalse();
    expect(isAdsenseSlotConfigured('ca-pub-9225896761341125')).toBeFalse();
  });
});
