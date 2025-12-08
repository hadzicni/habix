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
