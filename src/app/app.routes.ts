import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes').then((m) => m.clientRoutes),
  },
  {
    path: '',
    redirectTo: 'client',
    pathMatch: 'full',
  },
];
