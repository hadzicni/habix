import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, rocketOutline, trendingUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonContent, IonButton, IonIcon],
})
export class WelcomePage {
  constructor(private router: Router) {
    addIcons({
      checkmarkCircleOutline,
      rocketOutline,
      trendingUpOutline,
    });
  }

  startOnboarding() {
    this.router.navigate(['/onboarding']);
  }

  skipToApp() {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    this.router.navigate(['/tabs/today']);
  }
}
