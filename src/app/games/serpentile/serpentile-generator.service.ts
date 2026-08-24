import { Injectable } from '@angular/core';
import { SerpentileColor, SerpentilePuzzle, SerpentileTile } from './serpentile.models';
import { SerpentileEngineService } from './serpentile-engine.service';

const PATH_PATTERNS: readonly (readonly (readonly [number, number])[])[] = [
  [[0, 1], [2, 4], [3, 5]],
  [[0, 2], [1, 5], [3, 4]],
  [[0, 4], [1, 3], [2, 5]],
  [[0, 5], [1, 4], [2, 3]],
];
const COLORS: readonly SerpentileColor[] = ['coral', 'gold', 'mint'];

@Injectable({ providedIn: 'root' })
export class SerpentileGeneratorService {
  constructor(private readonly engine: SerpentileEngineService) {}

  createDailyPuzzle(date: string, round = 0): SerpentilePuzzle {
    const seed = round === 0 ? date : `${date}:round:${round}`;
    const random = this.seededRandom(this.hash(seed));
    const cells = this.engine.createBoardCells();
    const tiles: SerpentileTile[] = cells.map((_, index) => {
      const pattern = PATH_PATTERNS[Math.floor(random() * PATH_PATTERNS.length)];
      const colors = this.shuffle([...COLORS], random);
      return {
        id: `tile-${index + 1}`,
        paths: pattern.map(([from, to], pathIndex) => ({ from, to, color: colors[pathIndex] })),
      };
    });
    const placements = cells.map((cell, index) => ({
      tileId: tiles[index].id,
      q: cell.q,
      r: cell.r,
      rotation: Math.floor(random() * 6),
    }));

    return {
      date,
      tiles,
      initialState: {
        version: 2,
        date,
        round,
        status: 'running',
        placements,
        snake: { q: 0, r: 0, incomingSide: 3, trail: [{ q: 0, r: 0 }] },
        target: this.targetFor(date, 0, 0, { q: 0, r: 0 }, round),
        collected: 0,
        targetCount: 7,
        moves: 0,
      },
    };
  }

  targetFor(date: string, collected: number, moves: number, exclude: { q: number; r: number }, round = 0) {
    const cells = this.engine.createBoardCells().filter(
      (cell) => cell.q !== exclude.q || cell.r !== exclude.r
    );
    const targetSeed = round === 0
      ? `${date}:${collected}:${moves}`
      : `${date}:${round}:${collected}:${moves}`;
    const random = this.seededRandom(this.hash(targetSeed));
    const cell = cells[Math.floor(random() * cells.length)];
    return { q: cell.q, r: cell.r };
  }

  private hash(value: string): number {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  private seededRandom(seed: number): () => number {
    let state = seed || 1;
    return () => {
      state += 0x6d2b79f5;
      let value = state;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  private shuffle<T>(values: T[], random: () => number): T[] {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(random() * (index + 1));
      [values[index], values[otherIndex]] = [values[otherIndex], values[index]];
    }
    return values;
  }
}
