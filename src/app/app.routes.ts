import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { OnboardingService } from './services/onboarding.service';

const checkOnboardingGuard: CanActivateFn = () => {
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  if (onboardingService.hasCompletedOnboarding()) {
    router.navigate(['/tabs/today']);
    return false;
  }
  return true;
};

const redirectGuard: CanActivateFn = () => {
  const onboardingService = inject(OnboardingService);
  const router = inject(Router);

  if (onboardingService.hasCompletedOnboarding()) {
    router.navigate(['/tabs/today']);
  } else {
    router.navigate(['/welcome']);
  }
  return false;
};

export const routes: Routes = [
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome.page').then((m) => m.WelcomePage),
    canActivate: [checkOnboardingGuard],
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./onboarding/onboarding.page').then((m) => m.OnboardingPage),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: '',
    canActivate: [redirectGuard],
    children: [],
  },
];
