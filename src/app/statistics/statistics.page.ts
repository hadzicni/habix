import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendar,
  checkmark,
  checkmarkCircle,
  flame,
  statsChartOutline,
  trendingUp,
  trophy,
} from 'ionicons/icons';
import { from, map, Observable, switchMap } from 'rxjs';
import { Habit, HabitStatistics } from 'src/app/interfaces/habit.interface';
import { HabitService } from 'src/app/services/habit.service';

interface HabitWithStats {
  habit: Habit;
  stats: HabitStatistics;
}

@Component({
  selector: 'app-statistics',
  templateUrl: 'statistics.page.html',
  styleUrls: ['statistics.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CommonModule, IonIcon],
})
export class StatisticsPage implements OnInit {
  selectedSegment = 'overview';
  habitsWithStats$: Observable<HabitWithStats[]>;
  overallStats$: Observable<any>;

  constructor(private habitService: HabitService) {
    addIcons({
      flame,
      trophy,
      calendar,
      trendingUp,
      checkmark,
      checkmarkCircle,
      statsChartOutline,
    });

    this.habitsWithStats$ = this.habitService.habits$.pipe(
      switchMap((habits) =>
        from(
          Promise.all(
            habits.map(async (habit) => {
              const stats = await this.habitService.getHabitStatistics(habit.id!).toPromise();
              return {
                habit,
                stats:
                  stats ||
                  ({
                    habit_id: habit.id!,
                    current_streak: habit.streak_count,
                    longest_streak: habit.streak_count,
                    total_completions: 0,
                    weekly_data: [],
                    monthly_data: [],
                  } as HabitStatistics),
              };
            }),
          ),
        ),
      ),
    );

    this.overallStats$ = this.habitsWithStats$.pipe(
      map((habitsWithStats) => {
        const totalHabits = habitsWithStats.length;
        const activeStreaks = habitsWithStats.filter((h) => h.stats.current_streak > 0).length;
        const longestStreak = Math.max(...habitsWithStats.map((h) => h.stats.longest_streak), 0);
        const totalCompletions = habitsWithStats.reduce(
          (sum, h) => sum + h.stats.total_completions,
          0,
        );

        return {
          totalHabits,
          activeStreaks,
          longestStreak,
          totalCompletions,
          completionRate: totalHabits > 0 ? Math.round((activeStreaks / totalHabits) * 100) : 0,
        };
      }),
    );
  }

  ngOnInit() {}

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  getWeekDays(): string[] {
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    return days;
  }

  async getWeekData(habit: Habit): Promise<boolean[]> {
    try {
      const completions = await this.habitService.getHabitStatistics(habit.id!).toPromise();
      if (!completions) return Array(7).fill(false);

      const today = new Date();
      const weekData: boolean[] = [];

      // Get this week's data (Monday to Sunday)
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate offset to Monday
        checkDate.setDate(today.getDate() + mondayOffset + i);

        const dateStr = checkDate.toDateString();
        const hasCompletion = completions.weekly_data.some((week: any) =>
          week.completionDays.some((day: Date) => new Date(day).toDateString() === dateStr),
        );

        weekData.push(hasCompletion);
      }

      return weekData;
    } catch {
      return Array(7).fill(false);
    }
  }

  getStreakColor(streak: number): string {
    if (streak === 0) return 'medium';
    if (streak < 7) return 'primary';
    if (streak < 30) return 'warning';
    return 'success';
  }

  getStreakIcon(streak: number): string {
    if (streak === 0) return 'flame';
    if (streak < 7) return 'flame';
    if (streak < 30) return 'trophy';
    return 'trophy';
  }

  getCompletionRate(habitWithStats: HabitWithStats): number {
    const currentStreak = habitWithStats.stats.current_streak;
    const longestStreak = habitWithStats.stats.longest_streak;
    if (longestStreak === 0) return 0;
    return Math.min((currentStreak / longestStreak) * 100, 100);
  }
}
