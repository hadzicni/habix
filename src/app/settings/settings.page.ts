import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
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
  ],
})
export class SettingsPage implements OnInit {
  themeMode: ThemeMode = 'system';

  constructor(
    private themeService: ThemeService,
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
  }

  async loadThemePreference() {
    this.themeMode = await this.themeService.getThemeMode();
  }

  onThemeChange(event: any) {
    this.themeService.setThemeMode(event.detail.value as ThemeMode);
  }

  restartOnboarding() {
    localStorage.removeItem('hasCompletedOnboarding');
    this.router.navigate(['/welcome']);
  }

  async handleRefresh(event: any) {
    await this.loadThemePreference();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }
}
