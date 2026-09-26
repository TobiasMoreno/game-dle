import { Injectable, inject, signal } from '@angular/core';
import { AppStorageService } from './app-storage.service';

export type FooterTheme = 'default' | 'onepiece' | 'wordle' | 'loldle' | 'musicdle' | 'serpentile' | 'geodle' | 'banderadle';
export type HeaderTheme = 'default' | 'onepiece' | 'wordle' | 'loldle' | 'musicdle' | 'serpentile' | 'geodle' | 'banderadle';
export type ColorMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storage = inject(AppStorageService);
  private footerTheme = signal<FooterTheme>('default');
  private headerTheme = signal<HeaderTheme>('default');
  private colorMode = signal<ColorMode>('light');

  constructor() {
    // Inicializar con el tema guardado en la plataforma o usar light por defecto.
    const savedMode = this.storage.getItem('colorMode') as ColorMode;
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
    this.storage.setItem('colorMode', newMode);
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
