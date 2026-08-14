export type SerpentileColor = 'coral' | 'gold' | 'mint';
export type SerpentileStatus = 'running' | 'paused' | 'won' | 'lost';

export interface HexCoordinate {
  q: number;
  r: number;
}

export interface SerpentilePath {
  from: number;
  to: number;
  color: SerpentileColor;
}

export interface SerpentileTile {
  id: string;
  paths: SerpentilePath[];
}

export interface SerpentilePlacement extends HexCoordinate {
  tileId: string;
  rotation: number;
}

export interface SerpentileSnake extends HexCoordinate {
  /** Lado por el que la serpiente entró al bloque actual. */
  incomingSide: number;
  trail: HexCoordinate[];
}

export interface SerpentileGameState {
  version: 2;
  date: string;
  status: SerpentileStatus;
  placements: SerpentilePlacement[];
  snake: SerpentileSnake;
  target: HexCoordinate;
  collected: number;
  targetCount: number;
  moves: number;
}

export interface SerpentilePuzzle {
  date: string;
  tiles: SerpentileTile[];
  initialState: SerpentileGameState;
}

export interface SerpentileBoardCell extends HexCoordinate {
  key: string;
  x: number;
  y: number;
}

export interface SerpentileMove {
  coordinate: HexCoordinate;
  incomingSide: number;
  exitSide: number;
}
