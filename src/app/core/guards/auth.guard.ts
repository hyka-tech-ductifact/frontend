import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard that restricts access to authenticated users.
 * Delegates the validity check to {@link AuthService.isAuthenticated}, which
 * verifies that a non-expired JWT token exists in localStorage.
 * Unauthenticated users are redirected to the `/login` route.
 * @returns {boolean | import('@angular/router').UrlTree} `true` when the user is
 *   authenticated; a `UrlTree` redirecting to `/login` otherwise.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
