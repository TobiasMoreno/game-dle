import { Component, input } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  theme = input<'default' | 'onepiece' | 'wordle' | 'colorle' | 'numberle' | 'loldle'>('default');
  year = new Date().getFullYear();

  getFooterClasses(): string {
    switch (this.theme()) {
      case 'onepiece':
        return 'bg-gradient-to-r from-orange-900 to-red-900 text-orange-100 border-orange-500';
      case 'wordle':
        return 'bg-gray-900 text-gray-300 border-gray-600';
      case 'colorle':
        return 'bg-gradient-to-r from-purple-900 to-pink-900 text-purple-100 border-purple-500';
      case 'numberle':
        return 'bg-gradient-to-r from-blue-900 to-indigo-900 text-blue-100 border-blue-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  }

  getLinkClasses(): string {
    switch (this.theme()) {
      case 'onepiece':
        return 'text-orange-200 hover:text-yellow-300';
      case 'wordle':
        return 'text-gray-400 hover:text-white';
      case 'colorle':
        return 'text-purple-200 hover:text-pink-300';
      case 'numberle':
        return 'text-blue-200 hover:text-indigo-300';
      case 'loldle':
        return 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400';
    }
  }

  getPortfolioClasses(): string {
    switch (this.theme()) {
      case 'onepiece':
        return 'text-orange-200';
      case 'wordle':
        return 'text-gray-500';
      case 'colorle':
        return 'text-purple-200';
      case 'numberle':
        return 'text-blue-200';
      case 'loldle':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  getDecorationClasses(): string {
    switch (this.theme()) {
      case 'onepiece':
        return 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-30';
      case 'wordle':
        return 'bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-30';
      case 'colorle':
        return 'bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-30';
      case 'numberle':
        return 'bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-30';
      case 'loldle':
        return 'bg-gradient-to-r from-transparent via-blue-400 dark:via-blue-500 to-transparent opacity-30';
      default:
        return 'bg-gradient-to-r from-transparent via-blue-400 dark:via-blue-500 to-transparent opacity-30';
    }
  }

  getIcon(): string {
    switch (this.theme()) {
      case 'onepiece':
        return '🏴‍☠️';
      case 'wordle':
        return '🎯';
      case 'colorle':
        return '🌈';
      case 'numberle':
        return '🧮';
      case 'loldle':
        return '💼';
      default:
        return '💼';
    }
  }
}
