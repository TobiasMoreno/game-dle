export type PalmodleStatus = 'playing' | 'revealed' | 'finished';

export interface PalmodlePerson {
  id: string;
  name: string;
  shortName: string;
  initials: string;
  field: string;
  country: string;
  born: number;
  deathDate: string;
  deathLabel: string;
  accent: string;
}

export interface PalmodlePair {
  left: PalmodlePerson;
  right: PalmodlePerson;
}

export interface PalmodleAnswer {
  round: number;
  leftId: string;
  rightId: string;
  selectedId: string;
  correctId: string;
  correct: boolean;
}

export interface PalmodleGameState {
  version: 1;
  run: number;
  round: number;
  lives: number;
  score: number;
  bestScore: number;
  status: PalmodleStatus;
  answers: PalmodleAnswer[];
}
