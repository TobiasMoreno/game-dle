import { Component, input } from '@angular/core';
import { GameCellComponent, GameCellData, GameCellTheme } from '../game-cell/game-cell.component';

export interface GameColumn {
  key: string;
  label: string;
  icon: string;
  width?: string;
  height?: string;
  type?: 'text' | 'image' | 'numeric';
}

export interface GameRow {
  [key: string]: GameCellData;
}

export interface GameBoardTheme {
  headerBg?: string;
  headerText?: string;
  boardBg?: string;
  cellTheme?: GameCellTheme;
}

@Component({
  selector: 'app-game-board',
  imports: [GameCellComponent],
  styleUrls: ['./game-board.component.css'],
  templateUrl: './game-board.component.html',
})
export class GameBoardComponent {
  // Inputs
  columns = input.required<GameColumn[]>();
  rows = input.required<GameRow[]>();
  revealedColumns = input<number[]>([]);
  theme = input<GameBoardTheme>({});
  maxAttempts = input<number>(6);

  getHeaderClasses(): string {
    return this.theme()?.headerBg || 'bg-gradient-to-r from-yellow-400 to-orange-400';
  }

  getGridTemplateColumns(): string {
    return `repeat(${this.columns().length}, minmax(0, 1fr))`;
  }

  getMinWidth(): string {
    const columnCount = this.columns().length;
    // 6rem = 96px por columna + gap de 8px
    const baseWidth = columnCount * 104; // 96px + 8px gap
    return `${baseWidth}px`;
  }

  getCellData(row: GameRow, columnKey: string, colIndex: number): GameCellData {
    const cellData = row[columnKey];
    if (!cellData) {
      return {
        value: 'N/A',
        status: 'incorrect',
        delay: colIndex * 400
      };
    }
    
    return cellData;
  }
} 