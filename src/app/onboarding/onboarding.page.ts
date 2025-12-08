import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  checkmarkCircleOutline,
  flameOutline,
  notificationsOutline,
  statsChartOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingPage {
  @ViewChild('swiper') swiper: any;

  currentSlide = 0;

  slides = [
    {
      icon: 'checkmark-circle-outline',
      title: 'Track Your Habits',
      description:
        'Create and manage your daily habits with ease. Build the life you want, one habit at a time.',
      color: '#667eea',
    },
    {
      icon: 'flame-outline',
      title: 'Build Streaks',
      description:
        'Stay motivated by tracking your daily streaks. Watch your consistency grow over time.',
      color: '#f093fb',
    },
    {
      icon: 'stats-chart-outline',
      title: 'Monitor Progress',
      description:
        'See your progress with detailed statistics and insights. Celebrate your achievements.',
      color: '#4facfe',
    },
    {
      icon: 'notifications-outline',
      title: 'Get Reminders',
      description:
        'Set custom reminders for each habit. Never miss a day with timely notifications.',
      color: '#43e97b',
    },
  ];

  constructor(private router: Router) {
    addIcons({
      checkmarkCircleOutline,
      flameOutline,
      statsChartOutline,
      notificationsOutline,
      arrowForwardOutline,
    });
  }

  ngAfterViewInit() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      (swiperEl as any).addEventListener('swiperslidechange', (e: any) => {
        this.currentSlide = e.detail[0].activeIndex;
      });
    }
  }

  nextSlide() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      (swiperEl as any).swiper.slideNext();
    }
  }

  previousSlide() {
    const swiperEl = document.querySelector('swiper-container');
    if (swiperEl) {
      (swiperEl as any).swiper.slidePrev();
    }
  }

  finishOnboarding() {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    this.router.navigate(['/tabs/today']);
  }

  skip() {
    this.finishOnboarding();
  }

  get isLastSlide(): boolean {
    return this.currentSlide === this.slides.length - 1;
  }
}
