import { Injectable } from '@angular/core';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Habit } from '../interfaces/habit.interface';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationId = 1;

  constructor() {
    this.initializeNotifications();
  }

  private async initializeNotifications() {
    // Request permission for notifications
    await LocalNotifications.requestPermissions();
  }

  async sendTestNotification(): Promise<void> {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.notificationId++,
          title: 'Test Notification',
          body: 'This is a test notification from Habix! 🎉',
          schedule: { at: new Date(Date.now() + 100) },
        },
      ],
    });
  }

  async sendTestHabitReminder(): Promise<void> {
    await LocalNotifications.requestPermissions();
    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.notificationId++,
          title: 'Habit Reminder',
          body: 'Time to complete: Morning Exercise 🏃',
          schedule: { at: new Date(Date.now() + 5000) }, // 5 seconds from now
        },
      ],
    });
  }

  async scheduleHabitReminder(habit: Habit): Promise<void> {
    if (!habit.reminder_enabled || !habit.reminder_time) {
      return;
    }

    // Parse reminder time (assuming format "HH:MM")
    const [hours, minutes] = habit.reminder_time.split(':').map(Number);

    // Generate unique notification ID from habit.id string
    const notificationId = this.generateNotificationId(habit.id!);

    // Calculate the next occurrence of this time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    // Schedule notification at specific time
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: 'Habit Reminder',
          body: `Time to complete: ${habit.title}`,
          schedule: {
            at: scheduledTime,
            every: 'day',
          },
          extra: {
            habitId: habit.id,
          },
        },
      ],
    });
  }

  private generateNotificationId(habitId: string): number {
    // Convert string to a consistent numeric ID
    let hash = 0;
    for (let i = 0; i < habitId.length; i++) {
      hash = (hash << 5) - hash + habitId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async cancelHabitReminder(habitId: string): Promise<void> {
    const notifications = await LocalNotifications.getPending();
    const habitNotifications = notifications.notifications.filter(
      (n) => n.extra?.habitId === habitId,
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

  async scheduleEncouragementNotification(habitTitle: string, streakCount: number): Promise<void> {
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
