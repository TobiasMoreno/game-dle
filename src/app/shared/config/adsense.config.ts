export const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-9225896761341125',
  slots: {
    home: '',
    gameFooter: '',
  },
} as const;

export function isAdsenseSlotConfigured(slot: string): boolean {
  return /^\d{5,}$/.test(slot.trim());
}
