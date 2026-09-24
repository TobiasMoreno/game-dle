export type FutbolMayorStatus = 'playing' | 'revealed' | 'finished';
export type FutbolMayorCategory =
  'Goles' | 'Asistencias' | 'Partidos' | 'Disciplina' | 'Títulos';

export interface FutbolMayorCompetitor {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  detail: string;
  value: number;
  accent: string;
}

export interface FutbolMayorComparison {
  id: string;
  category: FutbolMayorCategory;
  question: string;
  metric: string;
  scope: string;
  cutoff: string;
  unit: string;
  left: FutbolMayorCompetitor;
  right: FutbolMayorCompetitor;
  sourceLabel: string;
  sourceUrl: string;
}

export interface FutbolMayorAnswer {
  round: number;
  comparisonId: string;
  selectedId: string;
  correctId: string;
  correct: boolean;
}

export interface FutbolMayorGameState {
  version: 1;
  run: number;
  seed: number;
  round: number;
  lives: number;
  score: number;
  bestScore: number;
  status: FutbolMayorStatus;
  answers: FutbolMayorAnswer[];
}
