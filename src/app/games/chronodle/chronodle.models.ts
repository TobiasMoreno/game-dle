export type ChronodleCategory = 'Ciencia' | 'Cultura' | 'Política' | 'Sociedad' | 'Deportes';
export type ChronodleDirection = 'correct' | 'up' | 'down';
export type ChronodleStatus = 'playing' | 'won' | 'lost';

export interface ChronodleEvent {
  id: string;
  title: string;
  date: string;
  displayDate: string;
  category: ChronodleCategory;
  region: string;
  summary: string;
  sourceUrl: string;
}

export interface ChronodlePuzzle {
  number: number;
  events: ChronodleEvent[];
  initialOrder: string[];
}

export interface ChronodleAttempt {
  order: string[];
  feedback: ChronodleDirection[];
}

export interface ChronodleGameState {
  version: 2;
  round: number;
  status: ChronodleStatus;
  order: string[];
  attempts: ChronodleAttempt[];
}
