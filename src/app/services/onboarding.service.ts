import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class OnboardingService {
  constructor(private router: Router) {}

  hasCompletedOnboarding(): boolean {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  }

  checkAndRedirect() {
    if (this.hasCompletedOnboarding()) {
      this.router.navigate(['/tabs/today']);
    } else {
      this.router.navigate(['/welcome']);
    }
  }
}
