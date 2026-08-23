import {
  ActivityAchievement,
  ActivityCalendarDay,
  DailyActivityEntry,
  DailyActivitySummary,
  GameActivityStats,
} from '../models/daily-activity.model';

export function buildGameActivityStats(
  entries: DailyActivityEntry[],
  gameId: string
): GameActivityStats {
  const gameEntries = entries
    .filter((entry) => entry.gameId === gameId)
    .sort((a, b) => a.completedAt - b.completedAt);

  let currentStreak = 0;
  let bestStreak = 0;
  let won = 0;

  for (const entry of gameEntries) {
    if (entry.won) {
      won += 1;
      currentStreak += 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return { played: gameEntries.length, won, currentStreak, bestStreak };
}

export const ARGENTINA_TIME_ZONE = 'America/Argentina/Buenos_Aires';

export function argentinaDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ARGENTINA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

/**
 * Corrects date keys written by older versions with the UTC calendar date.
 * Between 21:00 and midnight in Argentina that legacy key points to tomorrow.
 */
export function normalizeLegacyUtcDateKey(dateKey: string, now = new Date()): string {
  const argentinaKey = argentinaDateKey(now);
  const utcKey = now.toISOString().slice(0, 10);
  return dateKey === utcKey ? argentinaKey : dateKey;
}

export function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function millisecondsUntilArgentinaMidnight(now = new Date()): number {
  const [year, month, day] = argentinaDateKey(now).split('-').map(Number);
  const nextMidnightUtc = Date.UTC(year, month - 1, day + 1, 3, 0, 0);
  return Math.max(0, nextMidnightUtc - now.getTime());
}

export function buildActivitySummary(
  entries: DailyActivityEntry[],
  now = new Date(),
  calendarLength = 14
): DailyActivitySummary {
  const today = argentinaDateKey(now);
  const validEntries = entries.filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.date));
  const activeDates = [...new Set(validEntries.map((entry) => entry.date))].sort();
  const activeDateSet = new Set(activeDates);
  const todayEntries = validEntries.filter((entry) => entry.date === today);
  const currentStreak = calculateCurrentStreak(activeDateSet, today);
  const bestStreak = calculateBestStreak(activeDates);
  const calendar = buildCalendar(validEntries, today, calendarLength);

  return {
    currentStreak,
    bestStreak,
    totalActiveDays: activeDates.length,
    totalGames: validEntries.length,
    totalWins: validEntries.filter((entry) => entry.won).length,
    todayGames: todayEntries.length,
    todayCompleted: todayEntries.length > 0,
    lastActiveDate: activeDates.at(-1) ?? null,
    calendar,
    achievements: buildAchievements(currentStreak, bestStreak, activeDates.length, validEntries),
  };
}

function calculateCurrentStreak(activeDates: Set<string>, today: string): number {
  let cursor = activeDates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (activeDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function calculateBestStreak(activeDates: string[]): number {
  let best = 0;
  let current = 0;
  let previous: string | null = null;
  for (const date of activeDates) {
    current = previous && addDays(previous, 1) === date ? current + 1 : 1;
    best = Math.max(best, current);
    previous = date;
  }
  return best;
}

function buildCalendar(
  entries: DailyActivityEntry[],
  today: string,
  length: number
): ActivityCalendarDay[] {
  const formatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short', timeZone: 'UTC' });
  return Array.from({ length }, (_, index) => addDays(today, index - length + 1)).map((date) => {
    const dayEntries = entries.filter((entry) => entry.date === date);
    const [year, month, day] = date.split('-').map(Number);
    return {
      date,
      dayNumber: day,
      weekday: formatter.format(new Date(Date.UTC(year, month - 1, day))).replace('.', ''),
      games: dayEntries.length,
      wins: dayEntries.filter((entry) => entry.won).length,
      isToday: date === today,
    };
  });
}

function buildAchievements(
  currentStreak: number,
  bestStreak: number,
  activeDays: number,
  entries: DailyActivityEntry[]
): ActivityAchievement[] {
  const wins = entries.filter((entry) => entry.won).length;
  const definitions = [
    { id: 'spark', label: 'La chispa', description: '3 días seguidos', icon: '✦', value: bestStreak, target: 3 },
    { id: 'week', label: 'Semana perfecta', description: '7 días seguidos', icon: '7', value: bestStreak, target: 7 },
    { id: 'habit', label: 'Ya es costumbre', description: '15 días activos', icon: '◒', value: activeDays, target: 15 },
    { id: 'legend', label: 'Leyenda diaria', description: '30 días seguidos', icon: '♛', value: bestStreak, target: 30 },
    { id: 'winner', label: 'En llamas', description: '10 victorias', icon: '✓', value: wins, target: 10 },
  ];
  return definitions.map(({ value, ...achievement }) => ({
    ...achievement,
    unlocked: value >= achievement.target,
    progress: Math.min(value, achievement.target),
  })).map((achievement) =>
    achievement.id === 'spark' && currentStreak > achievement.progress
      ? { ...achievement, progress: Math.min(currentStreak, achievement.target) }
      : achievement
  );
}
