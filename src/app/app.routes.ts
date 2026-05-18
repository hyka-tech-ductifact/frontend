import { Routes } from '@angular/router';

/**
 * Root-level application routes.
 *
 * Defines the top-level lazy-loaded feature routes for the Ductifact frontend:
 * - `/login`  — Authentication page (standalone LoginComponent).
 * - `/client` — Client feature module with its own child routes.
 * - `/`       — Redirects to `/client` by default.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent:
      /**
       * Lazily loads LoginComponent for the authentication page.
       * @returns {Promise<unknown>} Promise resolving to the LoginComponent class.
       */
      () => import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'client',
    loadChildren:
      /**
       * Lazily loads the client feature child routes.
       * @returns {Promise<unknown>} Promise resolving to the clientRoutes array.
       */
      () => import('./features/client/client.routes').then((m) => m.clientRoutes),
  },
  {
    path: '',
    redirectTo: 'client',
    pathMatch: 'full',
  },
];
