import { Injectable, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Habit,
  HabitCompletion,
  HabitStatistics,
  MonthlyCompletions,
  WeeklyCompletions,
} from '../interfaces/habit.interface';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class HabitService {
  private supabase: SupabaseClient = createClient(
    environment.supabase.url,
    environment.supabase.anonKey,
  );

  private storageService = inject(StorageService);
  private networkService = inject(NetworkService);

  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  public habits$ = this.habitsSubject.asObservable();

  constructor() {
    this.initializeHabits();
  }

  private async initializeHabits() {
    try {
      // Load from local storage first
      const localHabits = await this.storageService.getHabits();
      if (localHabits.length > 0) {
        this.habitsSubject.next(localHabits);
      }

      // Then sync with remote if online
      if (await this.networkService.isOnline()) {
        await this.syncHabits();
      }
    } catch (error) {
      console.error('Error initializing habits:', error);
    }
  }

  createHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Observable<Habit> {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      created_at: new Date(),
      updated_at: new Date(),
      streak_count: 0,
    };

    return from(this.networkService.isOnline()).pipe(
      switchMap(async (isOnline) => {
        if (isOnline) {
          try {
            const { data, error } = await this.supabase
              .from('habits')
              .insert([newHabit])
              .select()
              .single();

            if (error) throw error;
            return data as Habit;
          } catch (error) {
            console.error('Error creating habit remotely:', error);
            return newHabit; // Fall back to local creation
          }
        } else {
          return newHabit; // Create locally when offline
        }
      }),
      tap((habit) => {
        const currentHabits = this.habitsSubject.value;
        this.habitsSubject.next([...currentHabits, habit]);
        this.storageService.saveHabits([...currentHabits, habit]);
      }),
    );
  }

  updateHabit(id: string, updates: Partial<Habit>): Observable<Habit> {
    const updatedHabit = { ...updates, id, updated_at: new Date() };

    return from(this.networkService.isOnline()).pipe(
      switchMap(async (isOnline) => {
        if (isOnline) {
          try {
            const { data, error } = await this.supabase
              .from('habits')
              .update(updatedHabit)
              .eq('id', id)
              .select()
              .single();

            if (error) throw error;
            return data as Habit;
          } catch (error) {
            console.error('Error updating habit remotely:', error);
            return updatedHabit as Habit; // Fall back to local update
          }
        } else {
          return updatedHabit as Habit; // Update locally when offline
        }
      }),
      tap((habit) => {
        const currentHabits = this.habitsSubject.value;
        const updatedHabits = currentHabits.map((h) => (h.id === id ? { ...h, ...habit } : h));
        this.habitsSubject.next(updatedHabits);
        this.storageService.saveHabits(updatedHabits);
      }),
    );
  }

  deleteHabit(id: string): Observable<boolean> {
    return from(this.networkService.isOnline()).pipe(
      switchMap(async (isOnline) => {
        if (isOnline) {
          try {
            const { error } = await this.supabase.from('habits').delete().eq('id', id);

            if (error) throw error;
            return true;
          } catch (error) {
            console.error('Error deleting habit remotely:', error);
            return true; // Proceed with local deletion
          }
        } else {
          return true; // Delete locally when offline
        }
      }),
      tap(() => {
        const currentHabits = this.habitsSubject.value;
        const updatedHabits = currentHabits.filter((h) => h.id !== id);
        this.habitsSubject.next(updatedHabits);
        this.storageService.saveHabits(updatedHabits);
      }),
    );
  }

  getHabit(id: string): Observable<Habit | undefined> {
    return this.habits$.pipe(map((habits) => habits.find((h) => h.id === id)));
  }

  completeHabit(habitId: string, notes?: string): Observable<HabitCompletion> {
    const completion: HabitCompletion = {
      id: crypto.randomUUID(),
      habit_id: habitId,
      completed_at: new Date(),
      notes,
    };

    return from(this.networkService.isOnline()).pipe(
      switchMap(async (isOnline) => {
        if (isOnline) {
          try {
            const { data, error } = await this.supabase
              .from('habit_completions')
              .insert([completion])
              .select()
              .single();

            if (error) throw error;
            return data as HabitCompletion;
          } catch (error) {
            console.error('Error completing habit remotely:', error);
            return completion; // Fall back to local completion
          }
        } else {
          return completion; // Complete locally when offline
        }
      }),
      tap(() => {
        // Update streak
        this.updateHabitStreak(habitId);
        // Store completion locally
        this.storageService.saveHabitCompletion(completion);
      }),
    );
  }

  getHabitStatistics(habitId: string): Observable<HabitStatistics> {
    return from(this.storageService.getHabitCompletions(habitId)).pipe(
      map((completions) => this.calculateStatistics(habitId, completions)),
    );
  }

  getTodaysHabits(): Observable<(Habit & { completedToday: boolean })[]> {
    const today = new Date().toDateString();

    return this.habits$.pipe(
      switchMap((habits) =>
        Promise.all(
          habits.map(async (habit) => {
            const completions = await this.storageService.getHabitCompletions(habit.id!);
            const completedToday = completions.some(
              (c) => new Date(c.completed_at).toDateString() === today,
            );
            return { ...habit, completedToday };
          }),
        ),
      ),
    );
  }

  private async syncHabits() {
    try {
      const { data: remoteHabits, error } = await this.supabase
        .from('habits')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error syncing habits:', error);
        return;
      }

      if (remoteHabits) {
        this.habitsSubject.next(remoteHabits);
        await this.storageService.saveHabits(remoteHabits);
      }
    } catch (error) {
      console.error('Error syncing habits:', error);
    }
  }

  private async updateHabitStreak(habitId: string) {
    try {
      const completions = await this.storageService.getHabitCompletions(habitId);
      const streak = this.calculateStreak(completions);

      this.updateHabit(habitId, { streak_count: streak }).subscribe({
        error: (error) => console.error('Error updating streak:', error),
      });
    } catch (error) {
      console.error('Error updating habit streak:', error);
    }
  }

  private calculateStatistics(habitId: string, completions: HabitCompletion[]): HabitStatistics {
    const totalCompletions = completions.length;
    const streak = this.calculateStreak(completions);
    const longestStreak = this.calculateLongestStreak(completions);

    // Calculate weekly data
    const weeklyData = this.calculateWeeklyData(completions);

    // Calculate monthly data
    const monthlyData = this.calculateMonthlyData(completions);

    return {
      habit_id: habitId,
      current_streak: streak,
      longest_streak: longestStreak,
      total_completions: totalCompletions,
      weekly_data: weeklyData,
      monthly_data: monthlyData,
    };
  }

  private calculateStreak(completions: HabitCompletion[]): number {
    if (completions.length === 0) return 0;

    const sortedCompletions = completions
      .map((c) => new Date(c.completed_at).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = currentDate.toDateString();

      if (sortedCompletions.includes(completionDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(completions: HabitCompletion[]): number {
    if (completions.length === 0) return 0;

    const sortedDates = completions
      .map((c) => new Date(c.completed_at).toDateString())
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const previousDate = new Date(sortedDates[i - 1]);
      const dayDifference = Math.floor(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (dayDifference === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  }

  private calculateWeeklyData(completions: HabitCompletion[]): WeeklyCompletions[] {
    if (completions.length === 0) return [];

    const weeklyMap = new Map<string, { completions: number; dates: Date[] }>();

    completions.forEach((completion) => {
      const date = new Date(completion.completed_at);
      const weekKey = this.getISOWeek(date);

      if (weeklyMap.has(weekKey)) {
        const existing = weeklyMap.get(weekKey)!;
        existing.completions++;
        existing.dates.push(date);
      } else {
        weeklyMap.set(weekKey, { completions: 1, dates: [date] });
      }
    });

    return Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        completions: data.completions,
        completionDays: data.dates,
      }))
      .sort((a, b) => b.week.localeCompare(a.week))
      .slice(0, 12); // Last 12 weeks
  }

  private calculateMonthlyData(completions: HabitCompletion[]): MonthlyCompletions[] {
    if (completions.length === 0) return [];

    const monthlyMap = new Map<string, number>();

    completions.forEach((completion) => {
      const date = new Date(completion.completed_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-').map(Number);
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const completionRate = (count / daysInMonth) * 100;

        return {
          month,
          completions: count,
          completionRate: Math.round(completionRate),
        };
      })
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6); // Last 6 months
  }

  private getISOWeek(date: Date): string {
    const tempDate = new Date(date.getTime());
    tempDate.setHours(0, 0, 0, 0);
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
    const week1 = new Date(tempDate.getFullYear(), 0, 4);
    const weekNumber =
      1 +
      Math.round(
        ((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7,
      );
    return `${tempDate.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }

  // Generate test data for demonstration purposes
  async generateTestData(): Promise<void> {
    const testHabits = [
      {
        title: 'Morning Exercise',
        description: 'Do 20 minutes of exercise every morning',
        icon: 'fitness',
        color: '#10b981',
        reminder_time: '07:00',
        reminder_enabled: true,
        is_active: true,
      },
      {
        title: 'Read Book',
        description: 'Read at least 20 pages daily',
        icon: 'book',
        color: '#667eea',
        reminder_time: '20:00',
        reminder_enabled: true,
        is_active: true,
      },
      {
        title: 'Meditation',
        description: 'Meditate for 10 minutes',
        icon: 'planet',
        color: '#764ba2',
        reminder_time: '06:30',
        reminder_enabled: false,
        is_active: true,
      },
      {
        title: 'Drink Water',
        description: 'Drink 8 glasses of water',
        icon: 'water',
        color: '#3b82f6',
        reminder_time: '09:00',
        reminder_enabled: true,
        is_active: true,
      },
      {
        title: 'Learn German',
        description: 'Practice German for 15 minutes',
        icon: 'school',
        color: '#f59e0b',
        reminder_time: '18:00',
        reminder_enabled: false,
        is_active: true,
      },
    ];

    // Create habits
    const createdHabits: Habit[] = [];
    for (const habitData of testHabits) {
      const habit = await this.createHabit(habitData).toPromise();
      if (habit) {
        createdHabits.push(habit);
      }
    }

    // Generate completions for the last 90 days
    const today = new Date();
    for (const habit of createdHabits) {
      const completions: HabitCompletion[] = [];
      
      // Random success rate between 60-95%
      const successRate = 0.6 + Math.random() * 0.35;
      
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Randomly decide if habit was completed on this day
        if (Math.random() < successRate) {
          // Random time of day
          date.setHours(Math.floor(Math.random() * 12) + 8); // Between 8am and 8pm
          date.setMinutes(Math.floor(Math.random() * 60));
          
          completions.push({
            habit_id: habit.id!,
            completed_at: date,
            notes: '',
          });
        }
      }

      // Save completions
      for (const completion of completions) {
        await this.completeHabit(completion.habit_id, completion.completed_at).toPromise();
      }
    }

    // Trigger refresh
    await this.syncHabits();
  }

  // Clear all data (useful for testing)
  async clearAllData(): Promise<void> {
    // Clear from Supabase
    if (await this.networkService.isOnline()) {
      await this.supabase.from('habit_completions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await this.supabase.from('habits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // Clear local storage
    await this.storageService.saveHabits([]);
    await this.storageService.clearAllCompletions();

    // Update subject
    this.habitsSubject.next([]);
  }
}
