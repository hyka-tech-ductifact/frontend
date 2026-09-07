import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Root-level application routes.
 *
 * Defines the top-level lazy-loaded feature routes for the Ductifact frontend:
 * - `/login`  — Authentication page (standalone LoginComponent).
 * - `/client` — Client feature module with its own child routes.
 * - `/settings` — Application settings page (standalone SettingsComponent).
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
      () => import('./views/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'client',
    canActivate: [authGuard],
    loadChildren:
      /**
       * Lazily loads the client feature child routes.
       * @returns {Promise<unknown>} Promise resolving to the clientRoutes array.
       */
      () => import('./views/clients/client.routes').then((m) => m.clientRoutes),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent:
      /**
       * Lazily loads SettingsComponent for the settings page.
       * @returns {Promise<unknown>} Promise resolving to the SettingsComponent class.
       */
      () => import('./views/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
