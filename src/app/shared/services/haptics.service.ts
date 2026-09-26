import { Injectable, inject } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  private readonly platform = inject(PlatformService);

  selection(): void {
    if (this.platform.isNative) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  }

  success(): void {
    if (this.platform.isNative) void Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
  }

  warning(): void {
    if (this.platform.isNative) void Haptics.notification({ type: NotificationType.Warning }).catch(() => undefined);
  }
}
