import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
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
    IonList,
    IonListHeader,
    FormsModule,
    IonLabel,
    IonItem,
    IonIcon,
    IonLabel,
    IonToggle,
  ],
})
export class Tab3Page implements OnInit {
  darkMode: boolean = false;

  constructor(private themeService: ThemeService) {}

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
