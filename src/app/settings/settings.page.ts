import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonRadio,
  IonRadioGroup,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToggle,
  IonToolbar,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alarmOutline,
  chevronForwardOutline,
  codeSlashOutline,
  flaskOutline,
  informationCircleOutline,
  moonOutline,
  notificationsOutline,
  personOutline,
  reloadOutline,
  trashOutline,
} from 'ionicons/icons';
import { HabitService } from 'src/app/services/habit.service';
import { NotificationService } from 'src/app/services/notification.service';
import { StorageService } from 'src/app/services/storage.service';
import { ThemeMode, ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    CommonModule,
    FormsModule,
    IonIcon,
    IonToggle,
    IonRadioGroup,
    IonRadio,
    IonRefresher,
    IonRefresherContent,
    IonButton,
  ],
})
export class SettingsPage implements OnInit {
  themeMode: ThemeMode = 'system';
  notificationsEnabled: boolean = true;
  userName: string = '';

  constructor(
    private themeService: ThemeService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private habitService: HabitService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
  ) {
    addIcons({
      moonOutline,
      notificationsOutline,
      informationCircleOutline,
      codeSlashOutline,
      reloadOutline,
      chevronForwardOutline,
      flaskOutline,
      trashOutline,
      alarmOutline,
      personOutline,
    });
  }

  async ngOnInit() {
    await this.loadThemePreference();
    await this.loadNotificationSettings();
    this.loadUserName();
  }

  async loadThemePreference() {
    this.themeMode = await this.themeService.getThemeMode();
  }

  async loadNotificationSettings() {
    const settings = await this.storageService.getSettings();
    this.notificationsEnabled = settings.notifications_enabled;
  }

  loadUserName() {
    this.userName = localStorage.getItem('userName') || '';
  }

  async changeUserName() {
    const alert = await this.alertController.create({
      header: this.userName ? 'Change Name' : 'Add Name',
      message: this.userName ? 'Enter your new name' : 'Enter your name',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Your name',
          value: this.userName,
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.name && data.name.trim()) {
              this.userName = data.name.trim();
              localStorage.setItem('userName', this.userName);
              this.showToast('Name saved successfully!', 'success');
              return true;
            } else {
              this.showToast('Please enter a valid name', 'warning');
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top',
    });
    await toast.present();
  }

  onThemeChange(event: any) {
    this.themeService.setThemeMode(event.detail.value as ThemeMode);
  }

  async onNotificationsToggle(event: any) {
    this.notificationsEnabled = event.detail.checked;
    const settings = await this.storageService.getSettings();
    settings.notifications_enabled = this.notificationsEnabled;
    await this.storageService.saveSettings(settings);
  }

  async testNotification() {
    await this.notificationService.sendTestNotification();
  }

  async testHabitReminder() {
    await this.notificationService.sendTestHabitReminder();
    const toast = await this.toastController.create({
      message: 'Habit reminder will appear in 5 seconds...',
      duration: 2000,
      color: 'primary',
      position: 'top',
    });
    await toast.present();
  }

  restartOnboarding() {
    localStorage.removeItem('hasCompletedOnboarding');
    this.router.navigate(['/welcome']);
  }

  async handleRefresh(event: any) {
    await this.loadThemePreference();
    await this.loadNotificationSettings();
    this.loadUserName();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  async generateTestData() {
    const alert = await this.alertController.create({
      header: 'Generate Test Data',
      message:
        'This will create 3 sample habits with random completions from the last 50 days. Note: Notifications are not set for sample habits and must be configured individually.',
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
                duration: 3000,
                color: 'success',
                position: 'top',
              });
              await toast.present();
            } catch (error) {
              await loading.dismiss();
              const toast = await this.toastController.create({
                message: '❌ Error generating test data',
                duration: 3000,
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

  async clearAllData() {
    const alert = await this.alertController.create({
      header: 'Clear All Data',
      message: 'This will permanently delete all habits and completions. This cannot be undone!',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Clearing all data...',
            });
            await loading.present();

            try {
              await this.habitService.clearAllData();
              await loading.dismiss();

              const toast = await this.toastController.create({
                message: '✅ All data cleared successfully!',
                duration: 3000,
                color: 'success',
                position: 'top',
              });
              await toast.present();
            } catch (error) {
              await loading.dismiss();
              const toast = await this.toastController.create({
                message: '❌ Error clearing data',
                duration: 3000,
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
}
