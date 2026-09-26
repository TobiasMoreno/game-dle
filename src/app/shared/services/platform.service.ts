import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

const PUBLIC_ORIGIN = 'https://game-dle.web.app';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  readonly platform = Capacitor.getPlatform();
  readonly isNative = Capacitor.isNativePlatform();
  readonly isWeb = !this.isNative;

  publicUrl(path = '/'): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return new URL(normalizedPath, PUBLIC_ORIGIN).toString();
  }
}
