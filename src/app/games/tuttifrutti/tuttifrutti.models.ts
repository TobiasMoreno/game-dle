export type TuttiFruttiRoomStatus = 'waiting' | 'playing' | 'results';

export interface TuttiFruttiPlayer {
  name: string;
  online: boolean;
  joinedAt: number;
}

export interface TuttiFruttiRoundAnswers {
  values: Record<string, string>;
  submittedAt: number;
}

export interface TuttiFruttiRoom {
  code: string;
  hostId: string;
  status: TuttiFruttiRoomStatus;
  round: number;
  letter: string;
  durationMs: number;
  startedAt: number | null;
  stoppedAt: number | null;
  categories: string[];
  players: Record<string, TuttiFruttiPlayer>;
  answers?: Record<string, TuttiFruttiRoundAnswers>;
  createdAt: number;
}

export interface TuttiFruttiScore {
  total: number;
  byCategory: Record<string, number>;
}

export const TUTTIFRUTTI_CATEGORIES = [
  'Nombre',
  'Animal',
  'País o ciudad',
  'Comida',
  'Objeto',
  'Color',
];

export const TUTTIFRUTTI_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'L', 'M',
  'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'Y',
];
