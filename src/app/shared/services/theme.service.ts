import { Injectable, signal } from '@angular/core';

export type FooterTheme = 'default' | 'onepiece' | 'wordle' | 'colorle' | 'numberle';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private footerTheme = signal<FooterTheme>('onepiece');

  getFooterTheme() {
    return this.footerTheme();
  }

  setFooterTheme(theme: FooterTheme) {
    this.footerTheme.set(theme);
  }
} 