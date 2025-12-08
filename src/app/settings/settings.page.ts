import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonIcon,
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
import { ThemeService } from 'src/app/services/theme.service';

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
  ],
})
export class SettingsPage implements OnInit {
  darkMode: boolean = false;

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
    this.darkMode = await this.themeService.isDarkMode();
  }

  toggleDarkMode(event: any) {
    this.themeService.setDarkMode(event.detail.checked);
  }

  restartOnboarding() {
    localStorage.removeItem('hasCompletedOnboarding');
    this.router.navigate(['/welcome']);
  }
}
