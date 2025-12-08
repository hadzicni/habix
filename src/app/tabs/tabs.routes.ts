import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'today',
        loadComponent: () => import('../today/today.page').then((m) => m.TodayPage),
      },
      {
        path: 'statistics',
        loadComponent: () => import('../statistics/statistics.page').then((m) => m.StatisticsPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'habit-detail',
        loadComponent: () => import('../habit-detail/habit-detail.page').then((m) => m.HabitDetailPage),
      },
      {
        path: 'habit-detail/:id',
        loadComponent: () => import('../habit-detail/habit-detail.page').then((m) => m.HabitDetailPage),
      },
      {
        path: '',
        redirectTo: '/tabs/today',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/today',
    pathMatch: 'full',
  },
];
