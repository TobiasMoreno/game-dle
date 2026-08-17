import { Injectable } from '@angular/core';
import {
  MusicdleAttempt,
  MusicdleFilter,
  MusicdleRoundState,
  MusicdleSong,
} from './musicdle.models';

export const MUSICDLE_MAX_ATTEMPTS = 6;
export const MUSICDLE_SECONDS_PER_ATTEMPT = 2;
export const MUSICDLE_MAX_SECONDS = 12;

@Injectable({ providedIn: 'root' })
export class MusicdleEngineService {
  createRound(songId: string, filter: MusicdleFilter, now = Date.now()): MusicdleRoundState {
    return {
      version: 2,
      roundId: `${now}-${songId}`,
      songId,
      filter,
      attempts: [],
      unlockedSeconds: MUSICDLE_SECONDS_PER_ATTEMPT,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
  }

  submitGuess(
    round: MusicdleRoundState,
    guessedSong: MusicdleSong,
    targetSong: MusicdleSong,
    now = Date.now()
  ): MusicdleRoundState {
    const correct = guessedSong.id === targetSong.id;
    const attempt: MusicdleAttempt = {
      kind: 'guess',
      songId: guessedSong.id,
      label: `${guessedSong.title} — ${guessedSong.artist}`,
      correct,
      artistMatch: this.normalize(guessedSong.artist) === this.normalize(targetSong.artist),
      categoryMatch: this.normalize(guessedSong.collection) === this.normalize(targetSong.collection),
      listenedSeconds: round.unlockedSeconds,
      createdAt: now,
    };

    return this.resolveAttempt(round, attempt, correct, now);
  }

  pass(round: MusicdleRoundState, now = Date.now()): MusicdleRoundState {
    const attempt: MusicdleAttempt = {
      kind: 'pass',
      label: 'Pasaste este intento',
      correct: false,
      listenedSeconds: round.unlockedSeconds,
      createdAt: now,
    };

    return this.resolveAttempt(round, attempt, false, now);
  }

  buildShareText(round: MusicdleRoundState): string {
    const result = round.status === 'won' ? '✅' : '❌';
    const marks = round.attempts
      .map((attempt) => attempt.correct ? '🟩' : attempt.kind === 'pass' ? '⏭️' : '⬛')
      .join(' ');

    return [
      'MusicDLE 🎵',
      `${result} ${round.attempts.length}/${MUSICDLE_MAX_ATTEMPTS} · ${round.unlockedSeconds}s`,
      marks,
      `Categoría: ${round.filter.label}`,
    ].join('\n');
  }

  private resolveAttempt(
    round: MusicdleRoundState,
    attempt: MusicdleAttempt,
    correct: boolean,
    now: number
  ): MusicdleRoundState {
    if (round.status !== 'active') return round;

    const attempts = [...round.attempts, attempt];
    const lost = !correct && attempts.length >= MUSICDLE_MAX_ATTEMPTS;
    const unlockedSeconds = correct
      ? round.unlockedSeconds
      : Math.min(
          MUSICDLE_MAX_SECONDS,
          MUSICDLE_SECONDS_PER_ATTEMPT * (attempts.length + 1)
        );

    return {
      ...round,
      attempts,
      unlockedSeconds,
      status: correct ? 'won' : lost ? 'lost' : 'active',
      updatedAt: now,
    };
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .trim();
  }
}
