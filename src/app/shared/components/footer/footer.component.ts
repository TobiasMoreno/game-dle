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
      case 'loldle':
        return 'bg-gradient-to-r from-blue-900 to-purple-900 text-blue-100 border-blue-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
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
