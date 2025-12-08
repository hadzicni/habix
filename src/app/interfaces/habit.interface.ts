export interface Habit {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  reminder_time?: string;
  reminder_enabled: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  streak_count: number;
  completions?: HabitCompletion[];
}

export interface HabitCompletion {
  id?: string;
  habit_id: string;
  completed_at: Date;
  notes?: string;
}

export interface HabitStatistics {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  weekly_data: WeeklyCompletions[];
  monthly_data: MonthlyCompletions[];
}

export interface WeeklyCompletions {
  week: string; // ISO week string
  completions: number;
  completionDays: Date[];
}

export interface MonthlyCompletions {
  month: string; // YYYY-MM format
  completions: number;
  completionRate: number;
}

export interface AppSettings {
  dark_mode: boolean;
  notifications_enabled: boolean;
  reminder_time?: string;
  last_sync_time?: Date;
}
