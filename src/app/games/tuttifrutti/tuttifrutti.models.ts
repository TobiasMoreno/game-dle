export type TuttiFruttiRoomStatus =
  | 'waiting'
  | 'playing'
  | 'voting'
  | 'roundResults'
  | 'finished';

export interface TuttiFruttiPlayer {
  name: string;
  online: boolean;
  joinedAt: number;
}

export interface TuttiFruttiRoundAnswers {
  values: Record<string, string>;
  submittedAt: number;
}

export interface TuttiFruttiScore {
  total: number;
  byCategory: Record<string, number>;
}

export type TuttiFruttiVote = 'yes' | 'no';
export type TuttiFruttiVotes = Record<
  string,
  Record<string, Record<string, TuttiFruttiVote>>
>;
export type TuttiFruttiValidationResults = Record<
  string,
  Record<string, boolean>
>;

export interface TuttiFruttiVotingWord {
  ownerId: string;
  categoryIndex: number;
}

export interface TuttiFruttiRoom {
  code: string;
  hostId: string;
  status: TuttiFruttiRoomStatus;
  round: number;
  totalRounds: number;
  letter: string;
  durationMs: number;
  startedAt: number | null;
  stoppedAt: number | null;
  votingStartedAt: number | null;
  votingCursor: number;
  votingWords?: TuttiFruttiVotingWord[];
  categories: string[];
  players: Record<string, TuttiFruttiPlayer>;
  answers?: Record<string, TuttiFruttiRoundAnswers>;
  votes?: TuttiFruttiVotes;
  validationResults?: TuttiFruttiValidationResults;
  roundScores?: Record<string, TuttiFruttiScore>;
  totals?: Record<string, number>;
  createdAt: number;
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
