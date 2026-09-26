import { Injectable, inject } from '@angular/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { PlatformService } from './platform.service';

@Injectable({ providedIn: 'root' })
export class NativeShellService {
  private readonly platform = inject(PlatformService);
  private initialized = false;

  initialize(): void {
    if (this.initialized || !this.platform.isNative || typeof document === 'undefined') {
      return;
    }

    this.initialized = true;
    document.addEventListener('click', this.openExternalLinkInSystemBrowser);
    void App.addListener('backButton', ({ canGoBack }) => {
      const openDialog = document.querySelector<HTMLDialogElement>('dialog[open]');
      if (openDialog) {
        openDialog.close();
        return;
      }

      const sidebarBackdrop = document.querySelector<HTMLButtonElement>('.sidebar-backdrop');
      if (sidebarBackdrop) {
        sidebarBackdrop.click();
        return;
      }

      if (canGoBack) {
        window.history.back();
        return;
      }

      void App.exitApp();
    });
  }

  private readonly openExternalLinkInSystemBrowser = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target;
    const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;
    if (!anchor) {
      return;
    }

    const url = new URL(anchor.href, window.location.href);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin === window.location.origin) {
      return;
    }

    event.preventDefault();
    void Browser.open({ url: url.href });
  };
}
