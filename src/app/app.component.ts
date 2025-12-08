import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/angular/standalone';
import { NetworkService } from './services/network.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonToast, CommonModule],
})
export class AppComponent implements OnInit {
  isOfflineToastOpen = false;
  offlineMessage = 'You are offline. All changes will be saved locally and synced to the cloud when internet connection is available.';

  constructor(
    private themeService: ThemeService,
    private networkService: NetworkService
  ) {
    this.themeService.initializeTheme();
  }

  async ngOnInit() {
    // Check network status on startup
    const isOnline = await this.networkService.isOnline();
    if (!isOnline) {
      this.showOfflineToast();
    }

    // Listen for network status changes
    this.networkService.networkStatus$.subscribe((isOnline) => {
      if (!isOnline) {
        this.showOfflineToast();
      }
    });
  }

  private showOfflineToast() {
    this.isOfflineToastOpen = true;
  }
}
