import { Injectable, inject } from '@angular/core';
import { Share } from '@capacitor/share';
import { PlatformService } from './platform.service';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export interface ShareContent {
  title: string;
  text: string;
  path?: string;
}

@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly platform = inject(PlatformService);

  async share(content: ShareContent): Promise<ShareOutcome> {
    const url = content.path ? this.platform.publicUrl(content.path) : undefined;
    const clipboardText = url && !content.text.includes(url) ? `${content.text}\n${url}` : content.text;

    try {
      if (this.platform.isNative) {
        await Share.share({ title: content.title, text: content.text, url, dialogTitle: content.title });
        return 'shared';
      }
      if (navigator.share) {
        await navigator.share({ title: content.title, text: content.text, ...(url ? { url } : {}) });
        return 'shared';
      }
      await navigator.clipboard.writeText(clipboardText);
      return 'copied';
    } catch (error) {
      if (this.isCancellation(error)) return 'cancelled';
      try {
        await navigator.clipboard.writeText(clipboardText);
        return 'copied';
      } catch {
        return 'failed';
      }
    }
  }

  private isCancellation(error: unknown): boolean {
    if (error instanceof DOMException && error.name === 'AbortError') return true;
    const message = error instanceof Error ? error.message : String(error ?? '');
    return /cancel|dismiss/i.test(message);
  }
}
