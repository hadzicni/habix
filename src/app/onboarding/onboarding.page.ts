import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  arrowForwardOutline,
  checkmarkCircleOutline,
  flameOutline,
  notificationsOutline,
  personOutline,
  statsChartOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonIcon, IonInput, IonItem],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OnboardingPage {
  @ViewChild('swiper') swiper: any;

  currentSlide = 0;
  userName: string = '';

  slides = [
    {
      icon: 'person-outline',
      title: 'Welcome!',
      description: "Let's personalize your experience. What should we call you?",
      color: '#667eea',
      isNameInput: true,
    },
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
      arrowBackOutline,
      arrowForwardOutline,
      checkmarkCircleOutline,
      flameOutline,
      statsChartOutline,
      notificationsOutline,
      personOutline,
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
    if (this.userName.trim()) {
      localStorage.setItem('userName', this.userName.trim());
    }
    this.router.navigate(['/tabs/today']);
  }

  skip() {
    this.finishOnboarding();
  }

  get isLastSlide(): boolean {
    return this.currentSlide === this.slides.length - 1;
  }
}
