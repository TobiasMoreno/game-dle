import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupportDialogService } from '../../services/support-dialog.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly supportDialog = inject(SupportDialogService);
  theme = input<'default' | 'onepiece' | 'wordle' | 'loldle' | 'musicdle' | 'serpentile' | 'geodle'>('default');
  compact = input<boolean>(false);
  year = new Date().getFullYear();

  getFooterClasses(): string {
    switch (this.theme()) {
      case 'onepiece':
        return 'bg-gradient-to-r from-orange-900 to-red-900 text-orange-100 border-orange-500';
      case 'wordle':
        return 'bg-gray-900 text-gray-300 border-gray-600';
      case 'loldle':
        return 'bg-gradient-to-r from-blue-900 to-purple-900 text-blue-100 border-blue-500';
      case 'musicdle':
        return 'musicdle-footer text-amber-100 border-amber-500';
      case 'serpentile':
        return 'serpentile-footer text-emerald-50 border-emerald-700';
      case 'geodle':
        return 'bg-[#173b4a] text-[#f3ead7] border-[#d85d45]';
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
      case 'loldle':
        return '💼';
      case 'musicdle':
        return '🎧';
      case 'serpentile':
        return '🐍';
      case 'geodle':
        return '🌎';
      default:
        return '💼';
    }
  }
}
