import { ADSENSE_CONFIG, isAdsenseSlotConfigured } from './adsense.config';

describe('AdSense config', () => {
  it('acepta IDs de unidad numéricos', () => {
    expect(isAdsenseSlotConfigured('1234567890')).toBeTrue();
  });

  it('rechaza valores vacíos y el publisher ID', () => {
    expect(isAdsenseSlotConfigured('')).toBeFalse();
    expect(isAdsenseSlotConfigured('ca-pub-9225896761341125')).toBeFalse();
  });

  it('mantiene configuradas las dos ubicaciones de producción', () => {
    expect(isAdsenseSlotConfigured(ADSENSE_CONFIG.slots.home)).toBeTrue();
    expect(isAdsenseSlotConfigured(ADSENSE_CONFIG.slots.gameFooter)).toBeTrue();
  });
});
