export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-9225896761341125',
  slots: {
    home: '1844562103',
    gameFooter: '6525063208',
  },
} as const;

export function isAdsenseSlotConfigured(slot: string): boolean {
  return /^\d{5,}$/.test(slot.trim());
}
