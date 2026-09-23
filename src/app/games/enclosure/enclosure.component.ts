import { Component, OnInit, inject } from '@angular/core';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { GameEditorialContentComponent } from '../../shared/components/game-editorial-content/game-editorial-content.component';
import {
  EnclosureOptimizerService,
  EnclosureResult,
  EnclosureTile,
  GridPosition,
} from '../../shared/services/enclosure-optimizer.service';
import { ThemeService } from '../../shared/services/theme.service';

interface EnclosureLevel {
  name: string;
  label: string;
  description: string;
  size: number;
  wallCount: number;
  islandCount: number;
  islandRadius: readonly [minimum: number, maximum: number];
}

type FeedbackTone = 'neutral' | 'success' | 'warning';

const LEVELS: EnclosureLevel[] = [
  {
    name: 'La caleta',
    label: 'Iniciación',
    description: 'Ocho paredes y lagunas grandes con contornos fáciles de leer.',
    size: 30,
    wallCount: 8,
    islandCount: 10,
    islandRadius: [3, 4],
  },
  {
    name: 'Dos horizontes',
    label: 'Intermedio',
    description: 'Nueve paredes y una mezcla de cauces medianos con más rutas posibles.',
    size: 30,
    wallCount: 9,
    islandCount: 18,
    islandRadius: [2, 3],
  },
  {
    name: 'Los tres cauces',
    label: 'Experto',
    description: 'Diez paredes y agua fragmentada que multiplica los cerramientos candidatos.',
    size: 30,
    wallCount: 10,
    islandCount: 42,
    islandRadius: [1, 2],
  },
];

@Component({
  selector: 'app-enclosure',
  imports: [FooterComponent, GameEditorialContentComponent],
  templateUrl: './enclosure.component.html',
  styleUrl: './enclosure.component.css',
})
export class EnclosureComponent implements OnInit {
  readonly levels = LEVELS;

  private readonly optimizer = inject(EnclosureOptimizerService);
  private readonly theme = inject(ThemeService);
  private placedWalls = new Set<string>();
  private optimalWallKeys = new Set<string>();
  private optimalRegionKeys = new Set<string>();
  private activeBoard = createRandomBoard(LEVELS[0]);

  levelIndex = 0;
  wallBudget = LEVELS[0].wallCount;
  mapCode = createMapCode();
  solution: EnclosureResult | null = null;
  solving = false;
  checking = false;
  feedback = 'Marcá paredes sobre el césped y comprobá tu cerramiento.';
  feedbackTone: FeedbackTone = 'neutral';

  ngOnInit(): void {
    this.theme.setHeaderTheme('default');
    this.theme.setFooterTheme('default');
  }

  get level(): EnclosureLevel {
    return this.levels[this.levelIndex];
  }

  get board(): EnclosureTile[][] {
    return this.activeBoard;
  }

  get columns(): number {
    return this.board[0].length;
  }

  get wallsUsed(): number {
    return this.placedWalls.size;
  }

  get wallsRemaining(): number {
    return Math.max(0, this.wallBudget - this.wallsUsed);
  }

  get isBusy(): boolean {
    return this.solving || this.checking;
  }

  selectLevel(index: number): void {
    if (index === this.levelIndex) return;
    this.levelIndex = index;
    this.wallBudget = this.level.wallCount;
    this.activeBoard = createRandomBoard(this.level);
    this.mapCode = createMapCode();
    this.resetBoard();
  }

  generateNewMap(): void {
    this.activeBoard = createRandomBoard(this.level);
    let nextCode = createMapCode();
    while (nextCode === this.mapCode) nextCode = createMapCode();
    this.mapCode = nextCode;
    this.resetBoard();
  }

  toggleWall(row: number, column: number): void {
    if (this.board[row][column] !== 'grass') return;
    const key = this.positionKey(row, column);
    if (this.placedWalls.has(key)) {
      this.placedWalls.delete(key);
    } else {
      if (this.wallsUsed >= this.wallBudget) {
        this.setFeedback('No quedan paredes disponibles. Quitá una o aumentá el presupuesto.', 'warning');
        return;
      }
      this.placedWalls.add(key);
    }
    this.clearSolutionOverlay();
    this.setFeedback('Configuración lista para comprobar.', 'neutral');
  }

  evaluateWalls(): void {
    if (this.isBusy) return;
    this.checking = true;
    this.clearSolutionOverlay();
    this.setFeedback('Comprobando tu cerramiento contra el óptimo global…', 'neutral');

    window.setTimeout(() => {
      try {
        const validation = this.optimizer.validateEnclosure(
          this.board,
          this.wallBudget,
          this.wallPositions()
        );
        if (!validation.isValid) {
          this.setFeedback(validation.reason ?? 'El caballo todavía puede llegar al exterior.', 'warning');
          return;
        }

        const optimum = this.optimizer.findOptimalEnclosure(this.board, this.wallBudget);
        if (optimum && validation.enclosedTileCount === optimum.enclosedTileCount) {
          this.setFeedback(
            `Óptimo global: protegiste ${validation.enclosedTileCount} casillas con ${validation.wallsUsed} ${validation.wallsUsed === 1 ? 'pared' : 'paredes'}.`,
            'success'
          );
          this.solution = optimum;
          this.setRegionOverlay(validation.region);
          return;
        }

        this.setFeedback(
          `Cerramiento válido: ${validation.enclosedTileCount} casillas. Existe una solución de ${optimum?.enclosedTileCount ?? 0}.`,
          'neutral'
        );
        this.setRegionOverlay(validation.region);
      } finally {
        this.checking = false;
      }
    });
  }

  revealOptimal(): void {
    if (this.isBusy) return;
    this.solving = true;
    this.clearSolutionOverlay();
    this.setFeedback('Explorando todos los cortes posibles…', 'neutral');

    window.setTimeout(() => {
      const result = this.optimizer.findOptimalEnclosure(this.board, this.wallBudget);
      this.solution = result;
      this.solving = false;
      if (!result) {
        this.setFeedback(`No existe un cerramiento válido con K = ${this.wallBudget}.`, 'warning');
        return;
      }

      this.placedWalls = new Set(result.wallPositions.map(({ row, column }) => this.positionKey(row, column)));
      this.optimalWallKeys = new Set(this.placedWalls);
      this.setRegionOverlay(result.region);
      this.setFeedback(
        `Solución óptima: ${result.enclosedTileCount} casillas y ${result.wallsUsed} ${result.wallsUsed === 1 ? 'pared usada' : 'paredes usadas'}.`,
        'success'
      );
    });
  }

  resetBoard(): void {
    this.placedWalls = new Set<string>();
    this.solution = null;
    this.solving = false;
    this.checking = false;
    this.clearSolutionOverlay();
    this.setFeedback('Marcá paredes sobre el césped y comprobá tu cerramiento.', 'neutral');
  }

  isWall(row: number, column: number): boolean {
    return this.placedWalls.has(this.positionKey(row, column));
  }

  isOptimalWall(row: number, column: number): boolean {
    return this.optimalWallKeys.has(this.positionKey(row, column));
  }

  isProtected(row: number, column: number): boolean {
    return this.optimalRegionKeys.has(this.positionKey(row, column));
  }

  cellLabel(tile: EnclosureTile, row: number, column: number): string {
    if (this.isWall(row, column)) return `Pared en fila ${row + 1}, columna ${column + 1}`;
    return {
      grass: `Césped disponible en fila ${row + 1}, columna ${column + 1}`,
      water: `Agua en fila ${row + 1}, columna ${column + 1}`,
      horse: `Caballo en fila ${row + 1}, columna ${column + 1}`,
      wall: `Pared fija en fila ${row + 1}, columna ${column + 1}`,
    }[tile];
  }

  private wallPositions(): GridPosition[] {
    return [...this.placedWalls].map((key) => {
      const [row, column] = key.split(':').map(Number);
      return { row, column };
    });
  }

  private setRegionOverlay(region: readonly GridPosition[]): void {
    this.optimalRegionKeys = new Set(region.map(({ row, column }) => this.positionKey(row, column)));
  }

  private clearSolutionOverlay(): void {
    this.solution = null;
    this.optimalWallKeys = new Set<string>();
    this.optimalRegionKeys = new Set<string>();
  }

  private setFeedback(message: string, tone: FeedbackTone): void {
    this.feedback = message;
    this.feedbackTone = tone;
  }

  private positionKey(row: number, column: number): string {
    return `${row}:${column}`;
  }
}

function createRandomBoard(level: EnclosureLevel): EnclosureTile[][] {
  const { size, islandCount, islandRadius } = level;
  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, (): EnclosureTile => 'grass')
  );
  const horseRow = randomInteger(Math.floor(size * .35), Math.floor(size * .65));
  const horseColumn = randomInteger(Math.floor(size * .35), Math.floor(size * .65));
  for (let attempt = 0; attempt < islandCount; attempt += 1) {
    const originRow = randomInteger(2, size - 3);
    const originColumn = randomInteger(2, size - 3);
    if (Math.abs(originRow - horseRow) <= 3 && Math.abs(originColumn - horseColumn) <= 3) continue;
    const radiusRow = randomInteger(...islandRadius);
    const radiusColumn = randomInteger(...islandRadius);
    for (let row = originRow - radiusRow; row <= originRow + radiusRow; row += 1) {
      for (let column = originColumn - radiusColumn; column <= originColumn + radiusColumn; column += 1) {
        if (row <= 0 || row >= size - 1 || column <= 0 || column >= size - 1) continue;
        if (Math.max(Math.abs(row - horseRow), Math.abs(column - horseColumn)) <= 2) continue;
        const ellipse = ((row - originRow) / radiusRow) ** 2 + ((column - originColumn) / radiusColumn) ** 2;
        if (ellipse <= 1) board[row][column] = 'water';
      }
    }
  }

  board[horseRow][horseColumn] = 'horse';
  return board;
}

function randomInteger(minimum: number, maximum: number): number {
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}

function createMapCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase();
}
