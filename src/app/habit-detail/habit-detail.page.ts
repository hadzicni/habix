import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
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
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  saveOutline,
  trashOutline,
  closeOutline,
  notificationsOutline,
  timeOutline,
} from 'ionicons/icons';
import { Habit } from '../interfaces/habit.interface';
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
    IonToast,
  ],
})
export class HabitDetailPage implements OnInit {
  habitId: string | null = null;
  isNewHabit = true;
  isToastOpen = false;
  toastMessage = '';

  habit: Partial<Habit> = {
    title: '',
    description: '',
    reminder_enabled: false,
    reminder_time: '',
    is_active: true,
    streak_count: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitService: HabitService,
    private notificationService: NotificationService
  ) {
    addIcons({ saveOutline, trashOutline, closeOutline, notificationsOutline, timeOutline });
  }

  async ngOnInit() {
    this.habitId = this.route.snapshot.paramMap.get('id');
    
    if (this.habitId) {
      this.isNewHabit = false;
      await this.loadHabit();
    }
  }

  async loadHabit() {
    if (!this.habitId) return;

    this.habitService.getHabit(this.habitId).subscribe({
      next: (habit: Habit | undefined) => {
        if (habit) {
          this.habit = { ...habit };
        }
      },
      error: (error: any) => {
        console.error('Error loading habit:', error);
        this.showToast('Fehler beim Laden der Gewohnheit');
      },
    });
  }

  async saveHabit() {
    if (!this.habit.title?.trim()) {
      this.showToast('Bitte gib einen Titel ein');
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
          this.showToast('Gewohnheit erstellt!');
          this.router.navigate(['/tabs/today']);
        },
        error: (error: any) => {
          console.error('Error creating habit:', error);
          this.showToast('Fehler beim Erstellen');
        },
      });
    } else {
      if (!this.habitId) return;

      this.habitService.updateHabit(this.habitId, habitData).subscribe({
        next: async (updatedHabit: Habit) => {
          if (updatedHabit) {
            if (updatedHabit.reminder_enabled && updatedHabit.reminder_time) {
              await this.notificationService.scheduleHabitReminder(updatedHabit);
            } else {
              await this.notificationService.cancelHabitReminder(this.habitId!);
            }
          }
          this.showToast('Gewohnheit gespeichert!');
          this.router.navigate(['/tabs/today']);
        },
        error: (error: any) => {
          console.error('Error updating habit:', error);
          this.showToast('Fehler beim Speichern');
        },
      });
    }
  }

  async deleteHabit() {
    if (!this.habitId) return;

    if (confirm('Möchtest du diese Gewohnheit wirklich löschen?')) {
      this.habitService.deleteHabit(this.habitId).subscribe({
        next: async () => {
          await this.notificationService.cancelHabitReminder(this.habitId!);
          this.showToast('Gewohnheit gelöscht');
          this.router.navigate(['/tabs/today']);
        },
        error: (error: any) => {
          console.error('Error deleting habit:', error);
          this.showToast('Fehler beim Löschen');
        },
      });
    }
  }

  cancel() {
    this.router.navigate(['/tabs/today']);
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}
