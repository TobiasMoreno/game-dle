export const ADSENSE_CONFIG = {
  // Reactivar solo después de comprobar la CMP certificada y el estado Ready.
  // La meta de verificación y ads.txt siguen disponibles durante la revisión.
  enabled: false as boolean,
  publisherId: 'ca-pub-9225896761341125',
  slots: {
    home: '1844562103',
    gameFooter: '6525063208',
  },
} as const;

export function isAdsenseSlotConfigured(slot: string): boolean {
  return /^\d{5,}$/.test(slot.trim());
}
