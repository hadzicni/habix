import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronForwardOutline,
  codeSlashOutline,
  informationCircleOutline,
  moonOutline,
  notificationsOutline,
  reloadOutline,
} from 'ionicons/icons';
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

  constructor(
    private themeService: ThemeService,
    private storageService: StorageService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    addIcons({
      moonOutline,
      notificationsOutline,
      informationCircleOutline,
      codeSlashOutline,
      reloadOutline,
      chevronForwardOutline,
    });
  }

  async ngOnInit() {
    await this.loadThemePreference();
    await this.loadNotificationSettings();
  }

  async loadThemePreference() {
    this.themeMode = await this.themeService.getThemeMode();
  }

  async loadNotificationSettings() {
    const settings = await this.storageService.getSettings();
    this.notificationsEnabled = settings.notifications_enabled;
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

  restartOnboarding() {
    localStorage.removeItem('hasCompletedOnboarding');
    this.router.navigate(['/welcome']);
  }

  async handleRefresh(event: any) {
    await this.loadThemePreference();
    await this.loadNotificationSettings();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }
}
