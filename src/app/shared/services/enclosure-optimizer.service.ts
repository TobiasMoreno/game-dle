import { Injectable } from '@angular/core';

export type EnclosureTile = 'grass' | 'water' | 'horse' | 'wall';

export interface GridPosition {
  row: number;
  column: number;
}

export interface EnclosureResult {
  enclosedTileCount: number;
  wallPositions: GridPosition[];
  wallsUsed: number;
  region: GridPosition[];
}

export interface EnclosureValidation {
  isValid: boolean;
  enclosedTileCount: number;
  wallsUsed: number;
  region: GridPosition[];
  reason?: string;
}

interface BoardDescription {
  rows: number;
  columns: number;
  tiles: readonly (readonly EnclosureTile[])[];
  horseIndex: number;
}

interface Reachability {
  region: number[];
  escapePath: number[] | null;
}

interface CutBound {
  size: number;
  walls: number[];
}

interface FlowEdge {
  to: number;
  reverse: number;
  capacity: number;
}

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/**
 * Finds an exact vertex cut between the horse and the exterior of a rectangular grid.
 * Water and pre-existing walls are fixed barriers; proposed walls may only replace grass.
 */
@Injectable({ providedIn: 'root' })
export class EnclosureOptimizerService {
  findOptimalEnclosure(
    board: readonly (readonly EnclosureTile[])[],
    wallBudget: number
  ): EnclosureResult | null {
    const description = this.describeBoard(board);
    this.assertWallBudget(wallBudget);

    let best: EnclosureResult | null = null;
    const visited = new Set<string>();

    const search = (walls: Set<number>, forcedSource: Set<number>): void => {
      const key = `${this.wallKey(walls)}|${this.wallKey(forcedSource)}`;
      if (visited.has(key)) return;
      visited.add(key);

      const reachability = this.reachableFromHorse(description, walls);
      if (reachability.escapePath === null) {
        const candidate = this.toResult(description, walls, reachability.region);
        if (this.isBetter(candidate, best)) best = candidate;
        return;
      }

      const remainingBudget = wallBudget - walls.size;
      if (remainingBudget === 0) return;

      const cut = this.minimumAdditionalCut(description, walls, remainingBudget, forcedSource);
      if (cut.size > remainingBudget) return;

      const completedWalls = new Set([...walls, ...cut.walls]);
      const completedReachability = this.reachableFromHorse(description, completedWalls);
      if (completedReachability.escapePath === null) {
        const candidate = this.toResult(description, completedWalls, completedReachability.region);
        if (this.isBetter(candidate, best)) best = candidate;
      }

      const maximumPossibleArea = reachability.region.length - cut.size;
      if (best !== null && (
        maximumPossibleArea < best.enclosedTileCount ||
        (maximumPossibleArea === best.enclosedTileCount && walls.size + cut.size >= best.wallsUsed)
      )) return;

      if (cut.walls.length === 0 || cut.size === remainingBudget) return;

      // The closest minimum separator partitions every relevant solution:
      // it either contains this vertex or keeps it on the horse side. Enumerating
      // these two cases visits all important separators of size at most K.
      const branchVertex = cut.walls[0];
      const expandedSource = new Set(forcedSource);
      expandedSource.add(branchVertex);
      search(walls, expandedSource);

      const includedWalls = new Set(walls);
      includedWalls.add(branchVertex);
      search(includedWalls, forcedSource);
    };

    search(new Set<number>(), new Set<number>([description.horseIndex]));
    return best;
  }

  validateEnclosure(
    board: readonly (readonly EnclosureTile[])[],
    wallBudget: number,
    wallPositions: readonly GridPosition[]
  ): EnclosureValidation {
    const description = this.describeBoard(board);
    this.assertWallBudget(wallBudget);

    const walls = new Set<number>();
    for (const position of wallPositions) {
      if (!this.isInside(description, position.row, position.column)) {
        return this.invalid(walls.size, 'Hay una pared fuera del tablero.');
      }
      const index = this.indexOf(description, position.row, position.column);
      if (walls.has(index)) return this.invalid(walls.size, 'Hay posiciones de pared repetidas.');
      if (description.tiles[position.row][position.column] !== 'grass') {
        return this.invalid(walls.size, 'Las paredes nuevas solo pueden colocarse sobre césped.');
      }
      walls.add(index);
    }

    if (walls.size > wallBudget) {
      return this.invalid(walls.size, 'La configuración supera el presupuesto de paredes.');
    }

    const reachability = this.reachableFromHorse(description, walls);
    if (reachability.escapePath !== null) {
      return this.invalid(walls.size, 'La región del caballo todavía tiene conexión con el exterior.');
    }

    const region = this.toPositions(description, reachability.region);
    return {
      isValid: true,
      enclosedTileCount: region.length,
      wallsUsed: walls.size,
      region,
    };
  }

  private describeBoard(board: readonly (readonly EnclosureTile[])[]): BoardDescription {
    if (board.length === 0 || board[0].length === 0) {
      throw new Error('El tablero debe tener al menos una casilla.');
    }
    const columns = board[0].length;
    let horseIndex = -1;
    let horseCount = 0;

    board.forEach((row, rowIndex) => {
      if (row.length !== columns) throw new Error('El tablero debe ser rectangular.');
      row.forEach((tile, columnIndex) => {
        if (!['grass', 'water', 'horse', 'wall'].includes(tile)) {
          throw new Error(`Tipo de casilla desconocido en ${rowIndex},${columnIndex}.`);
        }
        if (tile === 'horse') {
          horseCount += 1;
          horseIndex = rowIndex * columns + columnIndex;
        }
      });
    });

    if (horseCount !== 1) throw new Error('El tablero debe contener exactamente un caballo.');
    return { rows: board.length, columns, tiles: board, horseIndex };
  }

  private assertWallBudget(wallBudget: number): void {
    if (!Number.isInteger(wallBudget) || wallBudget < 0) {
      throw new Error('wallBudget debe ser un entero mayor o igual que cero.');
    }
  }

  private reachableFromHorse(description: BoardDescription, walls: ReadonlySet<number>): Reachability {
    const parents = new Int32Array(description.rows * description.columns);
    parents.fill(-2);
    parents[description.horseIndex] = -1;
    const queue = [description.horseIndex];
    const region: number[] = [];
    let firstBoundary = -1;

    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const index = queue[cursor];
      region.push(index);
      const { row, column } = this.positionOf(description, index);
      if (firstBoundary < 0 && this.isBoundary(description, row, column)) firstBoundary = index;

      for (const [rowOffset, columnOffset] of DIRECTIONS) {
        const nextRow = row + rowOffset;
        const nextColumn = column + columnOffset;
        if (!this.isInside(description, nextRow, nextColumn)) continue;
        const nextIndex = this.indexOf(description, nextRow, nextColumn);
        if (parents[nextIndex] !== -2 || walls.has(nextIndex)) continue;
        const tile = description.tiles[nextRow][nextColumn];
        if (tile === 'water' || tile === 'wall') continue;
        parents[nextIndex] = index;
        queue.push(nextIndex);
      }
    }

    if (firstBoundary < 0) return { region, escapePath: null };
    const escapePath: number[] = [];
    for (let index = firstBoundary; index >= 0; index = parents[index]) escapePath.push(index);
    escapePath.reverse();
    return { region, escapePath };
  }

  private minimumAdditionalCut(
    description: BoardDescription,
    walls: ReadonlySet<number>,
    remainingBudget: number,
    forcedSource: ReadonlySet<number>
  ): CutBound {
    const tileCount = description.rows * description.columns;
    const source = tileCount * 2;
    const sink = source + 1;
    const flow = new Dinic(sink + 1);
    // One wall is more expensive than excluding every tile. This preserves the
    // cardinality minimum and, among equal cuts, keeps the largest horse region.
    const wallScale = tileCount + 1;
    const limit = (remainingBudget + 1) * wallScale;

    for (let index = 0; index < tileCount; index += 1) {
      const { row, column } = this.positionOf(description, index);
      const tile = description.tiles[row][column];
      if (tile === 'water' || tile === 'wall' || walls.has(index)) continue;

      const input = index * 2;
      const output = input + 1;
      flow.addEdge(input, output, index === description.horseIndex ? limit : wallScale);
      if (index !== description.horseIndex) flow.addEdge(source, input, 1);
      if (forcedSource.has(index)) {
        flow.addEdge(source, input, limit);
        flow.addEdge(source, output, limit);
      }
      if (this.isBoundary(description, row, column)) flow.addEdge(output, sink, limit);

      for (const [rowOffset, columnOffset] of DIRECTIONS) {
        const nextRow = row + rowOffset;
        const nextColumn = column + columnOffset;
        if (!this.isInside(description, nextRow, nextColumn)) continue;
        const nextIndex = this.indexOf(description, nextRow, nextColumn);
        const nextTile = description.tiles[nextRow][nextColumn];
        if (nextTile === 'water' || nextTile === 'wall' || walls.has(nextIndex)) continue;
        flow.addEdge(output, nextIndex * 2, limit);
      }
    }

    flow.addEdge(source, description.horseIndex * 2, limit);
    const weightedSize = flow.maxFlow(source, sink, limit);
    if (weightedSize >= limit) return { size: remainingBudget + 1, walls: [] };

    const reachable = flow.residualReachableFrom(source);
    const cutWalls: number[] = [];
    for (let index = 0; index < tileCount; index += 1) {
      if (index === description.horseIndex || walls.has(index)) continue;
      const { row, column } = this.positionOf(description, index);
      if (description.tiles[row][column] !== 'grass') continue;
      if (reachable[index * 2] && !reachable[index * 2 + 1]) cutWalls.push(index);
    }
    return { size: cutWalls.length, walls: cutWalls };
  }

  private toResult(
    description: BoardDescription,
    walls: ReadonlySet<number>,
    region: readonly number[]
  ): EnclosureResult {
    const wallIndexes = [...walls].sort((left, right) => left - right);
    return {
      enclosedTileCount: region.length,
      wallPositions: this.toPositions(description, wallIndexes),
      wallsUsed: wallIndexes.length,
      region: this.toPositions(description, [...region].sort((left, right) => left - right)),
    };
  }

  private isBetter(candidate: EnclosureResult, best: EnclosureResult | null): boolean {
    if (best === null || candidate.enclosedTileCount !== best.enclosedTileCount) {
      return best === null || candidate.enclosedTileCount > best.enclosedTileCount;
    }
    if (candidate.wallsUsed !== best.wallsUsed) return candidate.wallsUsed < best.wallsUsed;
    return this.positionsKey(candidate.wallPositions) < this.positionsKey(best.wallPositions);
  }

  private invalid(wallsUsed: number, reason: string): EnclosureValidation {
    return { isValid: false, enclosedTileCount: 0, wallsUsed, region: [], reason };
  }

  private toPositions(description: BoardDescription, indexes: readonly number[]): GridPosition[] {
    return indexes.map((index) => this.positionOf(description, index));
  }

  private positionOf(description: BoardDescription, index: number): GridPosition {
    return { row: Math.floor(index / description.columns), column: index % description.columns };
  }

  private indexOf(description: BoardDescription, row: number, column: number): number {
    return row * description.columns + column;
  }

  private isInside(description: BoardDescription, row: number, column: number): boolean {
    return row >= 0 && row < description.rows && column >= 0 && column < description.columns;
  }

  private isBoundary(description: BoardDescription, row: number, column: number): boolean {
    return row === 0 || row === description.rows - 1 || column === 0 || column === description.columns - 1;
  }

  private wallKey(walls: ReadonlySet<number>): string {
    return [...walls].sort((left, right) => left - right).join(',');
  }

  private positionsKey(positions: readonly GridPosition[]): string {
    return positions.map(({ row, column }) => `${row},${column}`).join(';');
  }
}

class Dinic {
  private readonly graph: FlowEdge[][];
  private levels: Int32Array;
  private edgesSeen: Int32Array;

  constructor(nodeCount: number) {
    this.graph = Array.from({ length: nodeCount }, () => []);
    this.levels = new Int32Array(nodeCount);
    this.edgesSeen = new Int32Array(nodeCount);
  }

  addEdge(from: number, to: number, capacity: number): void {
    const forward: FlowEdge = { to, reverse: this.graph[to].length, capacity };
    const backward: FlowEdge = { to: from, reverse: this.graph[from].length, capacity: 0 };
    this.graph[from].push(forward);
    this.graph[to].push(backward);
  }

  maxFlow(source: number, sink: number, limit: number): number {
    let total = 0;
    while (total < limit && this.buildLevels(source, sink)) {
      this.edgesSeen.fill(0);
      let pushed = this.pushFlow(source, sink, limit - total);
      while (pushed > 0) {
        total += pushed;
        if (total >= limit) return total;
        pushed = this.pushFlow(source, sink, limit - total);
      }
    }
    return total;
  }

  residualReachableFrom(source: number): boolean[] {
    const reachable = Array(this.graph.length).fill(false) as boolean[];
    const queue = [source];
    reachable[source] = true;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const node = queue[cursor];
      for (const edge of this.graph[node]) {
        if (edge.capacity <= 0 || reachable[edge.to]) continue;
        reachable[edge.to] = true;
        queue.push(edge.to);
      }
    }
    return reachable;
  }

  private buildLevels(source: number, sink: number): boolean {
    this.levels.fill(-1);
    this.levels[source] = 0;
    const queue = [source];
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const node = queue[cursor];
      for (const edge of this.graph[node]) {
        if (edge.capacity <= 0 || this.levels[edge.to] >= 0) continue;
        this.levels[edge.to] = this.levels[node] + 1;
        queue.push(edge.to);
      }
    }
    return this.levels[sink] >= 0;
  }

  private pushFlow(node: number, sink: number, available: number): number {
    if (node === sink) return available;
    for (; this.edgesSeen[node] < this.graph[node].length; this.edgesSeen[node] += 1) {
      const edge = this.graph[node][this.edgesSeen[node]];
      if (edge.capacity <= 0 || this.levels[edge.to] !== this.levels[node] + 1) continue;
      const pushed = this.pushFlow(edge.to, sink, Math.min(available, edge.capacity));
      if (pushed === 0) continue;
      edge.capacity -= pushed;
      this.graph[edge.to][edge.reverse].capacity += pushed;
      return pushed;
    }
    return 0;
  }
}
