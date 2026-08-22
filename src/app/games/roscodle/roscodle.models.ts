export type RoscoCategory = 'players' | 'teams' | 'boca' | 'river';

export type RoscoLetterStatus = 'pending' | 'current' | 'correct' | 'wrong';

export interface RoscoQuestion {
  letter: string;
  relation: 'starts' | 'contains';
  clue: string;
  answer: string;
  aliases?: string[];
}

export interface RoscoLetter extends RoscoQuestion {
  status: RoscoLetterStatus;
}

export interface RoscoResult {
  correct: number;
  wrong: number;
  unanswered: number;
}
