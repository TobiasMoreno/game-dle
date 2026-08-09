import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  input,
  isDevMode,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  ADSENSE_CONFIG,
  isAdsenseSlotConfigured,
} from '../../config/adsense.config';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

@Component({
  selector: 'app-ad-slot',
  templateUrl: './ad-slot.component.html',
  styleUrl: './ad-slot.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdSlotComponent implements AfterViewInit {
  slot = input.required<string>();
  placement = input<string>('display-responsive');
  compact = input<boolean>(false);

  readonly publisherId = ADSENSE_CONFIG.publisherId;
  readonly hasConfiguredSlot = computed(() => isAdsenseSlotConfigured(this.slot()));
  readonly showDevelopmentPreview = computed(
    () => this.isBrowser && (isDevMode() || this.isLocalHostname)
  );

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private hasRequestedAd = false;

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.showDevelopmentPreview() || !this.hasConfiguredSlot()) {
      return;
    }

    queueMicrotask(() => this.requestAd());
  }

  private get isLocalHostname(): boolean {
    if (!this.isBrowser) return false;
    return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  }

  private requestAd(): void {
    if (this.hasRequestedAd) return;

    try {
      window.adsbygoogle = window.adsbygoogle ?? [];
      window.adsbygoogle.push({});
      this.hasRequestedAd = true;
    } catch (error) {
      console.warn('AdSense no pudo inicializar esta unidad.', error);
    }
  }
}
