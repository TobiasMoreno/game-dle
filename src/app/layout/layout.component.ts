import { Component, ElementRef, HostListener, OnDestroy, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from '../shared/services/theme.service';
import { SupportDialogComponent } from '../shared/components/support-dialog/support-dialog.component';
import { SupportDialogService } from '../shared/services/support-dialog.service';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet, SidebarComponent, SupportDialogComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnDestroy {
  @ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild(SidebarComponent) private sidebar?: SidebarComponent;

  isSidebarOpen = false;
  private themeService = inject(ThemeService);
  readonly supportDialog = inject(SupportDialogService);

  get colorMode() {
    return this.themeService.getColorMode();
  }

  get headerTheme() {
    return this.themeService.getHeaderTheme();
  }

  toggleSidebar(): void {
    this.isSidebarOpen ? this.closeSidebar() : this.openSidebar();
  }

  openSidebar(): void {
    this.isSidebarOpen = true;
    this.syncScrollLock();
    window.setTimeout(() => this.sidebar?.focusCloseButton());
  }

  closeSidebar(returnFocus = true): void {
    if (!this.isSidebarOpen) return;
    this.isSidebarOpen = false;
    this.syncScrollLock();
    if (returnFocus) window.setTimeout(() => this.menuButton?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') document.body.style.removeProperty('overflow');
  }

  toggleColorMode() {
    this.themeService.toggleColorMode();
  }

  getHeaderClasses(): string {
    switch (this.headerTheme) {
      case 'onepiece':
        return 'bg-gradient-to-r from-orange-900 to-red-900 border-orange-500';
      case 'wordle':
        return 'bg-gray-900 border-gray-600';
      case 'loldle':
        return 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500';
      case 'musicdle':
        return this.colorMode === 'dark'
          ? 'bg-stone-950 border-amber-500'
          : 'bg-amber-50 border-amber-300';
      case 'serpentile':
        return 'bg-emerald-950 border-emerald-700';
      case 'geodle':
        return 'bg-[#173b4a] border-[#d85d45]';
      default:
        return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  }

  getHeaderTextClasses(): string {
    switch (this.headerTheme) {
      case 'onepiece':
        return 'text-orange-100';
      case 'wordle':
        return 'text-gray-300';
      case 'loldle':
        return 'text-blue-100';
      case 'musicdle':
        return this.colorMode === 'dark' ? 'text-amber-100' : 'text-amber-950';
      case 'serpentile':
        return 'text-emerald-50';
      case 'geodle':
        return 'text-[#f3ead7]';
      default:
        return 'text-gray-900 dark:text-white';
    }
  }

  getHeaderButtonClasses(): string {
    switch (this.headerTheme) {
      case 'onepiece':
        return 'text-orange-300 hover:text-yellow-300';
      case 'wordle':
        return 'text-gray-400 hover:text-white';
      case 'loldle':
        return 'text-blue-200 hover:text-purple-300';
      case 'musicdle':
        return this.colorMode === 'dark'
          ? 'text-amber-200 hover:text-amber-400'
          : 'text-amber-800 hover:text-amber-950';
      case 'serpentile':
        return 'text-emerald-200 hover:text-amber-200';
      case 'geodle':
        return 'text-[#f3ead7] hover:text-[#e8b94f]';
      default:
        return 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400';
    }
  }

  getThemeToggleClasses(): string {
    switch (this.headerTheme) {
      case 'onepiece':
        return 'bg-orange-800/50 hover:bg-orange-700/50 text-orange-200';
      case 'wordle':
        return 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300';
      case 'loldle':
        return 'bg-blue-800/50 hover:bg-blue-700/50 text-blue-200';
      case 'musicdle':
        return this.colorMode === 'dark'
          ? 'bg-stone-800 hover:bg-stone-700 text-amber-200'
          : 'bg-amber-100 hover:bg-amber-200 text-amber-900';
      case 'serpentile':
        return 'bg-emerald-900 hover:bg-emerald-800 text-emerald-100';
      case 'geodle':
        return 'bg-[#244c5a] hover:bg-[#315d69] text-[#f3ead7]';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
  }

  private syncScrollLock(): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    document.body.style.overflow = this.isSidebarOpen && window.matchMedia('(max-width: 767px)').matches
      ? 'hidden'
      : '';
  }
}
