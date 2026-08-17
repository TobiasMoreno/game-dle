export interface DailyActivityEntry {
  date: string;
  gameId: string;
  won: boolean;
  attempts: number;
  completedAt: number;
  score?: number;
}

export interface ActivityCalendarDay {
  date: string;
  dayNumber: number;
  weekday: string;
  games: number;
  wins: number;
  isToday: boolean;
}

export interface ActivityAchievement {
  id: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface DailyActivitySummary {
  currentStreak: number;
  bestStreak: number;
  totalActiveDays: number;
  totalGames: number;
  totalWins: number;
  todayGames: number;
  todayCompleted: boolean;
  lastActiveDate: string | null;
  calendar: ActivityCalendarDay[];
  achievements: ActivityAchievement[];
}
