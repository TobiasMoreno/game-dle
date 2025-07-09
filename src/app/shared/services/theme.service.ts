import { Injectable, signal } from '@angular/core';

export type FooterTheme = 'default' | 'onepiece' | 'wordle' | 'colorle' | 'numberle' | 'loldle';
export type HeaderTheme = 'default' | 'onepiece' | 'wordle' | 'colorle' | 'numberle' | 'loldle';
export type ColorMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private footerTheme = signal<FooterTheme>('onepiece');
  private headerTheme = signal<HeaderTheme>('default');
  private colorMode = signal<ColorMode>('light');

  constructor() {
    // Inicializar con el tema guardado en localStorage o usar light por defecto
    const savedMode = localStorage.getItem('colorMode') as ColorMode;
    if (savedMode) {
      this.colorMode.set(savedMode);
      this.applyTheme(savedMode);
    }
  }

  getFooterTheme() {
    return this.footerTheme();
  }

  setFooterTheme(theme: FooterTheme) {
    this.footerTheme.set(theme);
  }

  getHeaderTheme() {
    return this.headerTheme();
  }

  setHeaderTheme(theme: HeaderTheme) {
    this.headerTheme.set(theme);
  }

  getColorMode() {
    return this.colorMode();
  }

  toggleColorMode() {
    const newMode = this.colorMode() === 'light' ? 'dark' : 'light';
    this.colorMode.set(newMode);
    localStorage.setItem('colorMode', newMode);
    this.applyTheme(newMode);
  }

  private applyTheme(mode: ColorMode) {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
} 