export type MusicdleFilterKind = 'all' | 'collection' | 'genre' | 'decade' | 'language';
export type MusicdleRoundStatus = 'active' | 'won' | 'lost';
export type MusicdleAttemptKind = 'guess' | 'pass';

export interface MusicdleSong {
  id: string;
  title: string;
  artist: string;
  aliases: string[];
  collection: string;
  genres: string[];
  decade: number;
  language: string;
  youtubeVideoId: string;
  startSeconds: number;
  enabled: boolean;
}

export interface MusicdleFilter {
  kind: MusicdleFilterKind;
  value: string;
  label: string;
}

export interface MusicdleAttempt {
  kind: MusicdleAttemptKind;
  songId?: string;
  label: string;
  correct: boolean;
  listenedSeconds: number;
  createdAt: number;
}

export interface MusicdleRoundState {
  version: 2;
  roundId: string;
  songId: string;
  filter: MusicdleFilter;
  attempts: MusicdleAttempt[];
  unlockedSeconds: number;
  status: MusicdleRoundStatus;
  createdAt: number;
  updatedAt: number;
}

export interface MusicdleCooldownEntry {
  songId: string;
  reason: 'played' | 'unavailable';
  expiresAt: number;
}

export interface MusicdleFilterOption extends MusicdleFilter {
  key: string;
}
