import { Routes } from '@angular/router';

/**
 * Client feature routes.
 *
 * Defines the routes scoped under the `/client` path:
 * - `/client` — Main client dashboard (lazy-loaded ClientMainComponent).
 */
export const clientRoutes: Routes = [
  {
    path: 'new',
    loadComponent:
      /**
       * Lazily loads NewClientComponent for client creation.
       * @returns {Promise<unknown>} Promise resolving to the NewClientComponent class.
       */
      () => import('./new-client/new-client.component').then((m) => m.NewClientComponent),
  },
  {
    path: ':clientId/projects/:projectId/order-details/:orderId',
    loadComponent:
      /**
       * Lazily loads OrderDetailComponent for a specific order within a project.
       * @returns {Promise<unknown>} Promise resolving to the OrderDetailComponent class.
       */
      () =>
        import('../orders/order-detail/order-detail.component').then((m) => m.OrderDetailComponent),
  },
  {
    path: ':clientId/projects/:projectId/orders',
    loadComponent:
      /**
       * Lazily loads OrderComponent for the project's orders list.
       * @returns {Promise<unknown>} Promise resolving to the OrderComponent class.
       */
      () => import('../orders/order/order.component').then((m) => m.OrderComponent),
  },
  {
    path: ':clientId/projects/new',
    loadComponent:
      /**
       * Lazily loads NewProjectComponent for project creation.
       * @returns {Promise<unknown>} Promise resolving to the NewProjectComponent class.
       */
      () => import('./new-project/new-project.component').then((m) => m.NewProjectComponent),
  },
  {
    path: ':clientId/projects',
    loadComponent:
      /**
       * Lazily loads ClientProjectsComponent for the client projects page.
       * @returns {Promise<unknown>} Promise resolving to the ClientProjectsComponent class.
       */
      () =>
        import('./client-projects/client-projects.component').then(
          (m) => m.ClientProjectsComponent,
        ),
  },
  {
    path: '',
    loadComponent:
      /**
       * Lazily loads ClientMainComponent for the client dashboard.
       * @returns {Promise<unknown>} Promise resolving to the ClientMainComponent class.
       */
      () => import('./client-main/client-main.component').then((m) => m.ClientMainComponent),
  },
];
