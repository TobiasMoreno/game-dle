import { Component, input } from '@angular/core';

export type ComparisonStatus = 'correct' | 'partial' | 'incorrect' | 'wrong';

export interface GameCellData {
  value: string;
  status: ComparisonStatus;
  arrow?: 'up' | 'down';
  imageUrl?: string;
  hasImage?: boolean;
  delay?: number;
}

export interface GameCellTheme {
  cellBg?: string;
  cellBorder?: string;
  cellText?: string;
  correctBg?: string;
  partialBg?: string;
  incorrectBg?: string;
  correctText?: string;
  partialText?: string;
  incorrectText?: string;
  imageOverlayBg?: string;
  imageOverlayText?: string;
}

@Component({
  selector: 'app-game-cell',
  templateUrl: './game-cell.component.html',
  styleUrls: ['./game-cell.component.css'],
})
export class GameCellComponent {
  // Inputs
  data = input.required<GameCellData>();
  isRevealed = input<boolean>(false);
  width = input<string>('w-24');
  height = input<string>('h-24');
  theme = input<GameCellTheme>({});
  cellType = input<'text' | 'image' | 'numeric'>('text');
  cellIndex = input<number>(0);

  getCellClasses(): string {
    const baseClasses = this.width() + ' ' + this.height();
    const comparisonClass = this.getComparisonClass(
      this.data()?.status || 'incorrect'
    );

    if (this.data()?.hasImage && this.data()?.imageUrl) {
      return `${baseClasses} ${comparisonClass} character-name-cell`;
    }

    return `${baseClasses} ${comparisonClass}`;
  }

  getContentClasses(): string {
    const status = this.data()?.status;
    const theme = this.theme();

    if (this.data()?.hasImage && this.data()?.imageUrl) {
      return `character-name-overlay ${
        theme?.imageOverlayBg || 'bg-black bg-opacity-50'
      } ${theme?.imageOverlayText || 'text-white'}`;
    }

    switch (status) {
      case 'correct':
        return theme?.correctText || 'text-white';
      case 'partial':
        return theme?.partialText || 'text-white';
      case 'incorrect':
      case 'wrong':
        return theme?.incorrectText || 'text-white';
      default:
        return theme?.cellText || '';
    }
  }

  getComparisonClass(status: ComparisonStatus): string {
    const theme = this.theme();

    switch (status) {
      case 'correct':
        return theme?.correctBg || 'bg-green-500';
      case 'partial':
        return theme?.partialBg || 'bg-yellow-400';
      case 'incorrect':
      case 'wrong':
        return theme?.incorrectBg || 'bg-red-500';
      default:
        return theme?.cellBg || '';
    }
  }

  getAnimationDelay(): string {
    const delay = this.data()?.delay || 0;
    return `${delay}ms`;
  }

  hasAnimationDelay(): boolean {
    return (this.data()?.delay || 0) > 0;
  }
}
