import { Routes } from '@angular/router';

/**
 * Client feature routes.
 *
 * Defines the routes scoped under the `/client` path:
 * - `/client` — Main client dashboard (lazy-loaded ClientMainComponent).
 */
export const clientRoutes: Routes = [
  {
    path: '',
    loadComponent:
      /**
       * Lazily loads ClientMainComponent for the client dashboard.
       * @returns {Promise<unknown>} Promise resolving to the ClientMainComponent class.
       */
      () => import('./pages/client-main/client-main.component').then((m) => m.ClientMainComponent),
  },
];
