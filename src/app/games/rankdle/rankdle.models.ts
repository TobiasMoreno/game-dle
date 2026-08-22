export type RankdleDirection = 'correct' | 'up' | 'down';
export type RankdleStatus = 'playing' | 'won' | 'lost';

export interface RankdleItem {
  id: string;
  name: string;
  value: number;
  displayValue: string;
  note: string;
}

export interface RankdlePuzzleDefinition {
  id: string;
  category: string;
  icon: string;
  question: string;
  lowerLabel: string;
  upperLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  items: readonly RankdleItem[];
}

export interface RankdlePuzzle {
  number: number;
  definition: RankdlePuzzleDefinition;
  initialOrder: string[];
}

export interface RankdleAttempt {
  order: string[];
  feedback: RankdleDirection[];
}

export interface RankdleGameState {
  version: 1;
  round: number;
  status: RankdleStatus;
  order: string[];
  attempts: RankdleAttempt[];
}
