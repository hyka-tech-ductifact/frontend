import { Routes } from '@angular/router';

export const clientRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/client-main/client-main.component').then((m) => m.ClientMainComponent),
  },
];
