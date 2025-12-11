import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barbell,
  bed,
  bicycle,
  book,
  brush,
  checkmarkCircle,
  closeOutline,
  fitness,
  heart,
  leaf,
  medkit,
  moon,
  musicalNotes,
  notificationsOutline,
  restaurant,
  saveOutline,
  sunny,
  timeOutline,
  trashOutline,
  walk,
  water,
} from 'ionicons/icons';
import { Habit, HabitCompletion } from '../interfaces/habit.interface';
import { HabitService } from '../services/habit.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.page.html',
  styleUrls: ['./habit-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonIcon,
  ],
})
export class HabitDetailPage implements OnInit {
  habitId: string | null = null;
  isNewHabit = true;
  completions: (HabitCompletion & { formattedDate?: string })[] = [];

  habit: Partial<Habit> = {
    title: '',
    description: '',
    reminder_enabled: false,
    reminder_time: '',
    is_active: true,
    streak_count: 0,
    icon: 'checkmark-circle',
    color: '#667eea',
  };

  availableIcons = [
    { name: 'checkmark-circle', label: 'Check' },
    { name: 'fitness', label: 'Fitness' },
    { name: 'barbell', label: 'Gym' },
    { name: 'walk', label: 'Walk' },
    { name: 'bicycle', label: 'Bike' },
    { name: 'book', label: 'Read' },
    { name: 'water', label: 'Water' },
    { name: 'restaurant', label: 'Food' },
    { name: 'bed', label: 'Sleep' },
    { name: 'moon', label: 'Night' },
    { name: 'sunny', label: 'Day' },
    { name: 'leaf', label: 'Nature' },
    { name: 'medkit', label: 'Health' },
    { name: 'brush', label: 'Art' },
    { name: 'musical-notes', label: 'Music' },
    { name: 'heart', label: 'Love' },
  ];

  availableColors = [
    '#667eea', // Purple
    '#f093fb', // Pink
    '#4facfe', // Blue
    '#43e97b', // Green
    '#fa709a', // Rose
    '#feca57', // Yellow
    '#ff6b6b', // Red
    '#48dbfb', // Cyan
    '#ff9ff3', // Light Pink
    '#54a0ff', // Light Blue
    '#00d2d3', // Turquoise
    '#ff6348', // Orange
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitService: HabitService,
    private notificationService: NotificationService,
    private alertController: AlertController,
  ) {
    addIcons({
      saveOutline,
      trashOutline,
      closeOutline,
      notificationsOutline,
      timeOutline,
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
      checkmarkCircle,
    });
  }

  selectIcon(iconName: string) {
    this.habit.icon = iconName;
  }

  selectColor(color: string) {
    this.habit.color = color;
  }

  async ngOnInit() {
    this.habitId = this.route.snapshot.paramMap.get('id');

    if (this.habitId) {
      this.isNewHabit = false;
      await this.loadHabit();
      await this.loadCompletions();
    }
  }

  async loadHabit() {
    if (!this.habitId) return;

    this.habitService.getHabit(this.habitId).subscribe({
      next: (habit: Habit | undefined) => {
        if (habit) {
          this.habit = { ...habit };
          this.loadCompletions();
        }
      },
      error: (error: any) => {
        console.error('Error loading habit:', error);
      },
    });
  }

  async loadCompletions() {
    if (!this.habitId) return;

    this.habitService.getHabitStatistics(this.habitId).subscribe({
      next: async (stats) => {
        // Get completions from storage
        const storageService = (this.habitService as any).storageService;
        const completions = await storageService.getHabitCompletions(this.habitId);

        // Sort by date (newest first) and format
        this.completions = completions
          .sort(
            (a: HabitCompletion, b: HabitCompletion) =>
              new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime(),
          )
          .slice(0, 10) // Show last 10
          .map((c: HabitCompletion) => ({
            ...c,
            formattedDate: new Date(c.completed_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
      },
      error: (error) => {
        console.error('Error loading completions:', error);
      },
    });
  }

  async saveHabit() {
    if (!this.habit.title?.trim()) {
      return;
    }

    const habitData: Omit<Habit, 'id' | 'created_at' | 'updated_at'> = {
      title: this.habit.title,
      description: this.habit.description || '',
      icon: this.habit.icon,
      color: this.habit.color,
      reminder_time: this.habit.reminder_enabled ? this.habit.reminder_time : undefined,
      reminder_enabled: this.habit.reminder_enabled || false,
      is_active: this.habit.is_active ?? true,
      streak_count: this.habit.streak_count || 0,
    };

    if (this.isNewHabit) {
      this.habitService.createHabit(habitData).subscribe({
        next: async (createdHabit: Habit) => {
          if (createdHabit.reminder_enabled && createdHabit.reminder_time) {
            await this.notificationService.scheduleHabitReminder(createdHabit);
          }
          this.router.navigate(['/tabs/today']);
        },
        error: (error: any) => {
          console.error('Error creating habit:', error);
        },
      });
    } else {
      if (!this.habitId) return;

      this.habitService.updateHabit(this.habitId, habitData).subscribe({
        next: async (updatedHabit: Habit) => {
          // Always cancel existing reminder first
          await this.notificationService.cancelHabitReminder(this.habitId!);

          // Then schedule new one if enabled
          if (updatedHabit && updatedHabit.reminder_enabled && updatedHabit.reminder_time) {
            await this.notificationService.scheduleHabitReminder(updatedHabit);
          }

          this.router.navigate(['/tabs/today']);
        },
        error: (error: any) => {
          console.error('Error updating habit:', error);
        },
      });
    }
  }

  async deleteHabit() {
    if (!this.habitId) return;

    const alert = await this.alertController.create({
      header: 'Delete Habit',
      message: 'Are you sure you want to delete this habit? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.habitService.deleteHabit(this.habitId!).subscribe({
              next: async () => {
                await this.notificationService.cancelHabitReminder(this.habitId!);
                this.router.navigate(['/tabs/today']);
              },
              error: (error: any) => {
                console.error('Error deleting habit:', error);
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  cancel() {
    this.router.navigate(['/tabs/today']);
  }
}
