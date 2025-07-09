import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ThemeService } from '../shared/services/theme.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent {
  isSidebarOpen = false;
  private themeService = inject(ThemeService);

  get colorMode() {
    return this.themeService.getColorMode();
  }

  get headerTheme() {
    return this.themeService.getHeaderTheme();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
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
      case 'colorle':
        return 'bg-gradient-to-r from-purple-900 to-pink-900 border-purple-500';
      case 'numberle':
        return 'bg-gradient-to-r from-blue-900 to-indigo-900 border-blue-500';
      case 'loldle':
        return 'bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500';
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
      case 'colorle':
        return 'text-purple-100';
      case 'numberle':
        return 'text-blue-100';
      case 'loldle':
        return 'text-blue-100';
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
      case 'colorle':
        return 'text-purple-200 hover:text-pink-300';
      case 'numberle':
        return 'text-blue-200 hover:text-indigo-300';
      case 'loldle':
        return 'text-blue-200 hover:text-purple-300';
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
      case 'colorle':
        return 'bg-purple-800/50 hover:bg-purple-700/50 text-purple-200';
      case 'numberle':
        return 'bg-blue-800/50 hover:bg-blue-700/50 text-blue-200';
      case 'loldle':
        return 'bg-blue-800/50 hover:bg-blue-700/50 text-blue-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
  }
}
