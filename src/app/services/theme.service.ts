import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private darkModeEnabled: boolean = false;

  constructor(private storage: StorageService) {
    this.initializeTheme();
  }

  async initializeTheme() {
    const savedTheme = await this.storage.get(this.THEME_KEY);
    this.darkModeEnabled = savedTheme === 'dark';
    this.applyTheme(this.darkModeEnabled);
  }

  async setDarkMode(enabled: boolean) {
    this.darkModeEnabled = enabled;
    await this.storage.set(this.THEME_KEY, enabled ? 'dark' : 'light');
    this.applyTheme(enabled);
  }

  async isDarkMode(): Promise<boolean> {
    return this.darkModeEnabled;
  }

  private applyTheme(darkMode: boolean) {
    document.body.classList.toggle('dark', darkMode);
  }
}
