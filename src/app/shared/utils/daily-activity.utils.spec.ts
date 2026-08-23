import {
  argentinaDateKey,
  buildActivitySummary,
  buildGameActivityStats,
  millisecondsUntilArgentinaMidnight,
  normalizeLegacyUtcDateKey,
} from './daily-activity.utils';
import { DailyActivityEntry } from '../models/daily-activity.model';

describe('Argentina daily boundary', () => {
  it('keeps the same game day when UTC has already advanced', () => {
    expect(argentinaDateKey(new Date('2026-08-23T20:59:00-03:00'))).toBe('2026-08-23');
    expect(argentinaDateKey(new Date('2026-08-23T21:00:00-03:00'))).toBe('2026-08-23');
    expect(argentinaDateKey(new Date('2026-08-23T23:59:59-03:00'))).toBe('2026-08-23');
  });

  it('starts a new game day at midnight in Argentina', () => {
    expect(argentinaDateKey(new Date('2026-08-24T00:00:00-03:00'))).toBe('2026-08-24');
  });

  it('counts down to the same Argentina midnight boundary', () => {
    expect(millisecondsUntilArgentinaMidnight(new Date('2026-08-23T23:59:59-03:00'))).toBe(1000);
    expect(millisecondsUntilArgentinaMidnight(new Date('2026-08-24T00:00:00-03:00')))
      .toBe(24 * 60 * 60 * 1000);
  });

  it('normalizes date keys written by the previous UTC implementation', () => {
    const eveningInArgentina = new Date('2026-08-23T21:30:00-03:00');
    expect(normalizeLegacyUtcDateKey('2026-08-24', eveningInArgentina)).toBe('2026-08-23');
    expect(normalizeLegacyUtcDateKey('2026-08-22', eveningInArgentina)).toBe('2026-08-22');
  });
});

describe('daily activity summary', () => {
  const entry = (date: string, gameId = 'wordle', won = true): DailyActivityEntry => ({
    date,
    gameId,
    won,
    attempts: 3,
    completedAt: Date.parse(`${date}T15:00:00Z`),
  });

  it('keeps a streak alive until the end of the following day', () => {
    const summary = buildActivitySummary(
      [entry('2026-08-14'), entry('2026-08-15'), entry('2026-08-16')],
      new Date('2026-08-17T12:00:00-03:00')
    );
    expect(summary.currentStreak).toBe(3);
    expect(summary.todayCompleted).toBeFalse();
  });

  it('deduplicates active days while counting each completed game', () => {
    const summary = buildActivitySummary(
      [entry('2026-08-17'), entry('2026-08-17', 'loldle', false)],
      new Date('2026-08-17T12:00:00-03:00')
    );
    expect(summary.totalActiveDays).toBe(1);
    expect(summary.totalGames).toBe(2);
    expect(summary.totalWins).toBe(1);
    expect(summary.currentStreak).toBe(1);
  });

  it('calculates the best historical streak independently', () => {
    const summary = buildActivitySummary(
      [entry('2026-08-01'), entry('2026-08-02'), entry('2026-08-03'), entry('2026-08-16')],
      new Date('2026-08-17T12:00:00-03:00')
    );
    expect(summary.currentStreak).toBe(1);
    expect(summary.bestStreak).toBe(3);
  });
});

describe('game activity stats', () => {
  it('calculates stats only from the selected game in chronological order', () => {
    const entries: DailyActivityEntry[] = [
      { date: '2026-08-12', gameId: 'wordle', won: true, attempts: 3, completedAt: 2 },
      { date: '2026-08-11', gameId: 'wordle', won: true, attempts: 4, completedAt: 1 },
      { date: '2026-08-13', gameId: 'loldle', won: false, attempts: 6, completedAt: 3 },
      { date: '2026-08-14', gameId: 'wordle', won: false, attempts: 6, completedAt: 4 },
      { date: '2026-08-15', gameId: 'wordle', won: true, attempts: 2, completedAt: 5 },
    ];

    expect(buildGameActivityStats(entries, 'wordle')).toEqual({
      played: 4,
      won: 3,
      currentStreak: 1,
      bestStreak: 2,
    });
  });

  it('returns empty stats when the game has no activity', () => {
    expect(buildGameActivityStats([], 'wordle')).toEqual({
      played: 0,
      won: 0,
      currentStreak: 0,
      bestStreak: 0,
    });
  });
});
