import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  codeSlashOutline,
  informationCircleOutline,
  moonOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
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
export class Tab3Page implements OnInit {
  darkMode: boolean = false;

  constructor(private themeService: ThemeService) {
    addIcons({ moonOutline, notificationsOutline, informationCircleOutline, codeSlashOutline });
  }

  async ngOnInit() {
    await this.loadThemePreference();
  }

  async loadThemePreference() {
    this.darkMode = await this.themeService.isDarkMode();
  }

  toggleDarkMode(event: any) {
    this.darkMode = event.detail.checked;
    this.themeService.setDarkMode(this.darkMode);
  }
}
