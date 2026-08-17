import { buildActivitySummary } from './daily-activity.utils';
import { DailyActivityEntry } from '../models/daily-activity.model';

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
