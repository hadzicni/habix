import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import {
  AlertController,
  IonAlert,
  IonButton,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  addCircleOutline,
  barbell,
  bed,
  bicycle,
  book,
  brush,
  checkboxOutline,
  checkmarkCircle,
  ellipsisVertical,
  fitness,
  flame,
  flaskOutline,
  heart,
  leaf,
  medkit,
  moon,
  musicalNotes,
  pencil,
  phonePortraitOutline,
  planet,
  restaurant,
  school,
  sunny,
  timeOutline,
  trash,
  walk,
  water,
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
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCheckbox,
    IonIcon,
    IonFab,
    IonFabButton,
    IonButton,
    IonAlert,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class TodayPage implements OnInit {
  todaysHabits$: Observable<(Habit & { completedToday: boolean })[]>;
  isAlertOpen = false;
  userName: string = '';

  // Note dialog state
  isNoteAlertOpen = false;
  selectedHabit: (Habit & { completedToday: boolean }) | null = null;
  noteAlertInputs = [
    {
      name: 'note',
      type: 'textarea' as const,
      placeholder: 'How did it go? Any thoughts or achievements?',
      attributes: {
        maxlength: 500,
        rows: 4,
      },
    },
  ];
  noteAlertButtons = [
    {
      text: 'Skip',
      role: 'cancel',
      handler: () => this.completeHabitWithoutNote(),
    },
    {
      text: 'Save',
      role: 'confirm',
      handler: (data: any) => this.completeHabitWithNote(data.note),
    },
  ];

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
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
  ) {
    addIcons({
      add,
      addCircleOutline,
      checkmarkCircle,
      ellipsisVertical,
      flame,
      flaskOutline,
      timeOutline,
      checkboxOutline,
      trash,
      // Habit icons
      barbell,
      book,
      water,
      bed,
      restaurant,
      fitness,
      leaf,
      moon,
      sunny,
      walk,
      bicycle,
      medkit,
      brush,
      musicalNotes,
      heart,
      planet,
      school,
      pencil,
      phonePortraitOutline,
    });
    this.todaysHabits$ = this.habitService.getTodaysHabits();
  }

  ngOnInit() {
    this.userName = localStorage.getItem('userName') || '';
  }

  async toggleHabitCompletion(habit: Habit & { completedToday: boolean }, event: any) {
    if (event.detail.checked && !habit.completedToday) {
      // Store the selected habit and show note dialog
      this.selectedHabit = habit;
      this.isNoteAlertOpen = true;
    }
  }

  private completeHabitWithNote(note?: string) {
    if (!this.selectedHabit) return;

    // Haptic feedback
    Haptics.impact({ style: ImpactStyle.Medium });

    this.habitService.completeHabit(this.selectedHabit.id!, note).subscribe({
      next: async () => {
        Haptics.impact({ style: ImpactStyle.Medium });

        // Get updated stats for notifications
        const stats = await this.habitService
          .getHabitStatistics(this.selectedHabit!.id!)
          .toPromise();

        if (stats) {
          // Schedule encouragement notification for milestones
          if ([1, 3, 7, 14, 30, 50, 100].includes(stats.current_streak)) {
            await this.notificationService.scheduleEncouragementNotification(
              this.selectedHabit!.title,
              stats.current_streak,
            );
          }
        }

        this.selectedHabit = null;
      },
      error: (error) => {
        console.error('Error completing habit:', error);
        this.selectedHabit = null;
      },
    });
  }
  private completeHabitWithoutNote() {
    if (!this.selectedHabit) return;
    this.completeHabitWithNote();
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

  async generateTestData() {
    const alert = await this.alertController.create({
      header: 'Generate Test Data',
      message: 'This will create 3 sample habits with random completions from the last 50 days. Note: Notifications are not set for sample habits and must be configured individually.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Generate',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Generating test data...',
            });
            await loading.present();

            try {
              await this.habitService.generateTestData();
              await loading.dismiss();

              const toast = await this.toastController.create({
                message: '✅ Test data generated successfully!',
                duration: 2000,
                color: 'success',
                position: 'top',
              });
              await toast.present();
            } catch (error) {
              await loading.dismiss();
              const toast = await this.toastController.create({
                message: '❌ Error generating test data',
                duration: 2000,
                color: 'danger',
                position: 'top',
              });
              await toast.present();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  editHabit(habitId: string) {
    this.router.navigate(['/tabs/habit-detail', habitId]);
  }

  async deleteHabit(habitId: string, slidingItem: any) {
    // Close the sliding item
    await slidingItem.close();

    // Haptic feedback
    Haptics.impact({ style: ImpactStyle.Medium });

    this.habitService.deleteHabit(habitId).subscribe({
      next: () => {
        // Habit deleted
      },
      error: (error) => {
        console.error('Error deleting habit:', error);
      },
    });
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

  getTodayDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    let greeting = 'Hello';

    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 18) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }

    return this.userName ? `${greeting}, ${this.userName}!` : `${greeting}!`;
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

  async handleRefresh(event: any) {
    try {
      // Refresh habits from storage and sync with backend
      await this.habitService.refreshHabits();

      // Reload today's habits observable
      this.todaysHabits$ = this.habitService.getTodaysHabits();

      // Complete the refresh
      event.target.complete();
    } catch (error) {
      console.error('Error refreshing:', error);
      event.target.complete();
    }
  }
}
