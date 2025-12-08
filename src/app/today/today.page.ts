import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAlert,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  checkboxOutline,
  checkmarkCircle,
  ellipsisVertical,
  flame,
  timeOutline,
} from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Habit } from 'src/app/interfaces/habit.interface';
import { HabitService } from 'src/app/services/habit.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-today',
  templateUrl: 'today.page.html',
  styleUrls: ['today.page.scss'],
  imports: [
    IonToast,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    IonCheckbox,
    IonIcon,
    IonFab,
    IonFabButton,
    IonAlert,
  ],
})
export class TodayPage implements OnInit {
  todaysHabits$: Observable<(Habit & { completedToday: boolean })[]>;
  isAlertOpen = false;
  isToastOpen = false;
  toastMessage = '';

  newHabit = {
    title: '',
    description: '',
    reminderEnabled: false,
    reminder_time: '',
    is_active: true,
    streak_count: 0,
  };

  alertInputs = [
    {
      name: 'title',
      type: 'text',
      placeholder: 'Habit title',
    },
    {
      name: 'description',
      type: 'textarea',
      placeholder: 'Description (optional)',
    },
    {
      name: 'reminderTime',
      type: 'time',
      placeholder: 'Reminder time (optional)',
    },
  ];

  alertButtons = [
    {
      text: 'Cancel',
      role: 'cancel',
      handler: () => this.onAddHabitCancel(),
    },
    {
      text: 'Create',
      role: 'confirm',
      handler: (data: any) => this.handleAddHabit(data),
    },
  ];

  constructor(
    private habitService: HabitService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    addIcons({ add, checkmarkCircle, ellipsisVertical, flame, timeOutline, checkboxOutline });
    this.todaysHabits$ = this.habitService.getTodaysHabits();
  }

  ngOnInit() {
    // Initialize habits
  }

  async toggleHabitCompletion(habit: Habit & { completedToday: boolean }, event: any) {
    if (event.detail.checked && !habit.completedToday) {
      // Complete the habit
      this.habitService.completeHabit(habit.id!).subscribe({
        next: () => {
          this.showToast(`${habit.title} completed! 🎉`);
          // Check for streak achievements
          this.checkStreakAchievement(habit);
        },
        error: (error) => {
          console.error('Error completing habit:', error);
          this.showToast('Error completing habit. Please try again.');
        },
      });
    }
  }

  private async checkStreakAchievement(habit: Habit) {
    const stats = await this.habitService.getHabitStatistics(habit.id!).toPromise();
    if (stats) {
      await this.notificationService.scheduleEncouragementNotification(
        habit.title,
        stats.current_streak,
      );
    }
  }

  openAddHabitAlert() {
    this.router.navigate(['/tabs/habit-detail']);
  }

  editHabit(habitId: string) {
    this.router.navigate(['/tabs/habit-detail', habitId]);
  }

  async onAddHabitConfirm() {
    if (this.newHabit.title.trim()) {
      // Map form data to Habit interface
      const habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'> = {
        title: this.newHabit.title,
        description: this.newHabit.description,
        icon: undefined,
        color: undefined,
        reminder_time: this.newHabit.reminder_time || undefined,
        reminder_enabled: this.newHabit.reminderEnabled,
        is_active: true,
        streak_count: 0,
      };

      this.habitService.createHabit(habitData).subscribe({
        next: (habit) => {
          this.showToast(`${habit.title} created successfully!`);
          // Reset form
          this.newHabit = {
            title: '',
            description: '',
            reminderEnabled: false,
            reminder_time: '',
            is_active: true,
            streak_count: 0,
          };
        },
        error: (error) => {
          console.error('Error creating habit:', error);
          this.showToast('Error creating habit. Please try again.');
        },
      });
    }
    this.isAlertOpen = false;
  }

  onAddHabitCancel() {
    this.isAlertOpen = false;
    this.newHabit = {
      title: '',
      description: '',
      reminderEnabled: false,
      reminder_time: '',
      is_active: true,
      streak_count: 0,
    };
  }

  handleAddHabit(data: any) {
    this.newHabit.title = data.title || '';
    this.newHabit.description = data.description || '';
    this.newHabit.reminder_time = data.reminderTime || '';
    this.newHabit.reminderEnabled = !!data.reminderTime;
    this.onAddHabitConfirm();
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }

  getTodayDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getCompletedCount(habits: (Habit & { completedToday: boolean })[]): number {
    return habits.filter((h) => h.completedToday).length;
  }

  getProgressPercentage(habits: (Habit & { completedToday: boolean })[]): number {
    if (habits.length === 0) return 0;
    return Math.round((this.getCompletedCount(habits) / habits.length) * 100);
  }

  getCircumference(): number {
    return 2 * Math.PI * 26; // radius = 26
  }

  getProgress(habits: (Habit & { completedToday: boolean })[]): number {
    const percentage = this.getProgressPercentage(habits);
    const circumference = this.getCircumference();
    return circumference - (percentage / 100) * circumference;
  }
}
