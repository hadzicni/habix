import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private currentThemeMode: ThemeMode = 'system';
  private darkModeEnabled: boolean = false;
  private mediaQuery?: MediaQueryList;

  constructor(private storage: StorageService) {
    this.initializeTheme();
  }

  async initializeTheme() {
    const savedTheme = await this.storage.get(this.THEME_KEY);
    this.currentThemeMode = (savedTheme as ThemeMode) || 'system';

    // Set up system preference listener
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', (e) => {
        if (this.currentThemeMode === 'system') {
          this.applyTheme(e.matches);
        }
      });
    }

    this.updateTheme();
  }

  async setThemeMode(mode: ThemeMode) {
    this.currentThemeMode = mode;
    await this.storage.set(this.THEME_KEY, mode);
    this.updateTheme();
  }

  async getThemeMode(): Promise<ThemeMode> {
    return this.currentThemeMode;
  }

  async isDarkMode(): Promise<boolean> {
    return this.darkModeEnabled;
  }

  private updateTheme() {
    let shouldBeDark = false;

    if (this.currentThemeMode === 'system') {
      // Use system preference
      shouldBeDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      shouldBeDark = this.currentThemeMode === 'dark';
    }

    this.darkModeEnabled = shouldBeDark;
    this.applyTheme(shouldBeDark);
  }

  private applyTheme(darkMode: boolean) {
    document.body.classList.toggle('dark', darkMode);
  }
}
