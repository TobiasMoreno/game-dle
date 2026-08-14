import { Injectable } from '@angular/core';
import {
  HexCoordinate,
  SerpentileBoardCell,
  SerpentileMove,
  SerpentilePlacement,
  SerpentileTile,
} from './serpentile.models';

const HEX_DIRECTIONS: readonly HexCoordinate[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

@Injectable({ providedIn: 'root' })
export class SerpentileEngineService {
  readonly boardRadius = 3;

  coordinateKey(coordinate: HexCoordinate): string {
    return `${coordinate.q},${coordinate.r}`;
  }

  createBoardCells(size = 52, centerX = 360, centerY = 310): SerpentileBoardCell[] {
    const cells: SerpentileBoardCell[] = [];
    for (let q = -this.boardRadius; q <= this.boardRadius; q += 1) {
      const minR = Math.max(-this.boardRadius, -q - this.boardRadius);
      const maxR = Math.min(this.boardRadius, -q + this.boardRadius);
      for (let r = minR; r <= maxR; r += 1) {
        cells.push({
          q,
          r,
          key: this.coordinateKey({ q, r }),
          x: centerX + size * Math.sqrt(3) * (q + r / 2),
          y: centerY + size * 1.5 * r,
        });
      }
    }
    return cells;
  }

  rotate(placement: SerpentilePlacement): SerpentilePlacement {
    return { ...placement, rotation: (placement.rotation + 1) % 6 };
  }

  nextMove(
    placement: SerpentilePlacement,
    tile: SerpentileTile,
    incomingSide: number
  ): SerpentileMove | null {
    const localIncomingSide = (incomingSide + placement.rotation) % 6;
    const path = tile.paths.find(({ from, to }) =>
      from === localIncomingSide || to === localIncomingSide
    );
    if (!path) return null;

    const localExitSide = path.from === localIncomingSide ? path.to : path.from;
    const exitSide = (localExitSide - placement.rotation + 6) % 6;
    const direction = HEX_DIRECTIONS[exitSide];
    const coordinate = {
      q: placement.q + direction.q,
      r: placement.r + direction.r,
    };

    if (!this.isInsideBoard(coordinate)) return null;
    return { coordinate, incomingSide: (exitSide + 3) % 6, exitSide };
  }

  isInsideBoard({ q, r }: HexCoordinate): boolean {
    const s = -q - r;
    return Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= this.boardRadius;
  }
}
