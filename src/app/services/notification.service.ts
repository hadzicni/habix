import { Injectable } from '@angular/core';
import {
  LocalNotifications,
  ScheduleOptions,
} from '@capacitor/local-notifications';
import { Habit } from '../interfaces/habit.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    // Request permission for notifications
    await LocalNotifications.requestPermissions();
  }

  async scheduleHabitReminder(habit: Habit): Promise<void> {
    if (!habit.reminder_enabled || !habit.reminder_time) {
      return;
    }

    // Parse reminder time (assuming format "HH:MM")
    const [hours, minutes] = habit.reminder_time.split(':').map(Number);

    // Create schedule for daily notifications
    const schedule: ScheduleOptions = {
      notifications: [
        {
          id: parseInt(habit.id!) || Date.now(),
          title: 'Habit Reminder',
          body: `Time to complete: ${habit.title}`,
          schedule: {
            every: 'day',
            at: new Date(new Date().setHours(hours, minutes, 0, 0)),
          },
          extra: {
            habitId: habit.id,
          },
        },
      ],
    };

    await LocalNotifications.schedule(schedule);
  }

  async cancelHabitReminder(habitId: string): Promise<void> {
    const notifications = await LocalNotifications.getPending();
    const habitNotifications = notifications.notifications.filter(
      (n) => n.extra?.habitId === habitId
    );

    if (habitNotifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: habitNotifications.map((n) => ({ id: n.id })),
      });
    }
  }

  async updateHabitReminder(habit: Habit): Promise<void> {
    // Cancel existing reminder
    await this.cancelHabitReminder(habit.id!);

    // Schedule new reminder if enabled
    if (habit.reminder_enabled) {
      await this.scheduleHabitReminder(habit);
    }
  }

  async scheduleEncouragementNotification(
    habitTitle: string,
    streakCount: number
  ): Promise<void> {
    let message = '';

    if (streakCount === 1) {
      message = `Great start! You've completed ${habitTitle} for 1 day.`;
    } else if (streakCount === 7) {
      message = `Amazing! You've kept up with ${habitTitle} for a whole week! 🎉`;
    } else if (streakCount === 30) {
      message = `Incredible! 30 days of ${habitTitle}! You're building a strong habit! 🏆`;
    } else if (streakCount % 10 === 0 && streakCount > 0) {
      message = `Fantastic! ${streakCount} days of ${habitTitle}! Keep it going! 💪`;
    }

    if (message) {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: 'Habit Streak Achievement!',
            body: message,
            schedule: { at: new Date(Date.now() + 2000) }, // Show after 2 seconds
          },
        ],
      });
    }
  }

  async getAllPendingNotifications() {
    return await LocalNotifications.getPending();
  }

  async cancelAllNotifications(): Promise<void> {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  }
}
