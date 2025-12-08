import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import {
  AppSettings,
  Habit,
  HabitCompletion,
} from '../interfaces/habit.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly HABITS_KEY = 'habits';
  private readonly COMPLETIONS_KEY = 'habit_completions';
  private readonly SETTINGS_KEY = 'app_settings';

  constructor() {}

  // Habit storage methods
  async saveHabits(habits: Habit[]): Promise<void> {
    await Preferences.set({
      key: this.HABITS_KEY,
      value: JSON.stringify(habits),
    });
  }

  async getHabits(): Promise<Habit[]> {
    try {
      const result = await Preferences.get({ key: this.HABITS_KEY });
      return result.value ? JSON.parse(result.value) : [];
    } catch (error) {
      console.error('Error loading habits from storage:', error);
      return [];
    }
  }

  async saveHabit(habit: Habit): Promise<void> {
    const habits = await this.getHabits();
    const existingIndex = habits.findIndex((h) => h.id === habit.id);

    if (existingIndex >= 0) {
      habits[existingIndex] = habit;
    } else {
      habits.push(habit);
    }

    await this.saveHabits(habits);
  }

  async deleteHabit(habitId: string): Promise<void> {
    const habits = await this.getHabits();
    const updatedHabits = habits.filter((h) => h.id !== habitId);
    await this.saveHabits(updatedHabits);

    // Also delete related completions
    await this.deleteHabitCompletions(habitId);
  }

  // Habit completion storage methods
  async saveHabitCompletion(completion: HabitCompletion): Promise<void> {
    const completions = await this.getAllHabitCompletions();
    completions.push(completion);

    await Preferences.set({
      key: this.COMPLETIONS_KEY,
      value: JSON.stringify(completions),
    });
  }

  async getAllHabitCompletions(): Promise<HabitCompletion[]> {
    try {
      const result = await Preferences.get({ key: this.COMPLETIONS_KEY });
      return result.value ? JSON.parse(result.value) : [];
    } catch (error) {
      console.error('Error loading completions from storage:', error);
      return [];
    }
  }

  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    const allCompletions = await this.getAllHabitCompletions();
    return allCompletions.filter((c) => c.habit_id === habitId);
  }

  async deleteHabitCompletions(habitId: string): Promise<void> {
    const allCompletions = await this.getAllHabitCompletions();
    const updatedCompletions = allCompletions.filter(
      (c) => c.habit_id !== habitId
    );

    await Preferences.set({
      key: this.COMPLETIONS_KEY,
      value: JSON.stringify(updatedCompletions),
    });
  }

  async deleteCompletion(completionId: string): Promise<void> {
    const allCompletions = await this.getAllHabitCompletions();
    const updatedCompletions = allCompletions.filter(
      (c) => c.id !== completionId
    );

    await Preferences.set({
      key: this.COMPLETIONS_KEY,
      value: JSON.stringify(updatedCompletions),
    });
  }

  // App settings storage methods
  async saveSettings(settings: AppSettings): Promise<void> {
    await Preferences.set({
      key: this.SETTINGS_KEY,
      value: JSON.stringify(settings),
    });
  }

  async getSettings(): Promise<AppSettings> {
    try {
      const result = await Preferences.get({ key: this.SETTINGS_KEY });
      const defaultSettings: AppSettings = {
        dark_mode: false,
        notifications_enabled: true,
      };

      return result.value
        ? { ...defaultSettings, ...JSON.parse(result.value) }
        : defaultSettings;
    } catch (error) {
      console.error('Error loading settings from storage:', error);
      return {
        dark_mode: false,
        notifications_enabled: true,
      };
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await Preferences.remove({ key: this.HABITS_KEY });
    await Preferences.remove({ key: this.COMPLETIONS_KEY });
    await Preferences.remove({ key: this.SETTINGS_KEY });
  }

  async exportData(): Promise<string> {
    const habits = await this.getHabits();
    const completions = await this.getAllHabitCompletions();
    const settings = await this.getSettings();

    return JSON.stringify({
      habits,
      completions,
      settings,
      exportDate: new Date().toISOString(),
    });
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (data.habits) {
        await this.saveHabits(data.habits);
      }

      if (data.completions) {
        await Preferences.set({
          key: this.COMPLETIONS_KEY,
          value: JSON.stringify(data.completions),
        });
      }

      if (data.settings) {
        await this.saveSettings(data.settings);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Invalid data format');
    }
  }

  // Generic storage methods for any key-value pairs
  async get(key: string): Promise<string | null> {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error(`Error setting value for key ${key}:`, error);
      throw error;
    }
  }
}
