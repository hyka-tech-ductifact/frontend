import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional route guard that restricts access to authenticated users.
 * Delegates the validity check to {@link AuthService.isAuthenticated}, which
 * verifies that a non-expired JWT token exists in localStorage.
 * Unauthenticated users are redirected to the `/login` route.
 * @returns {Promise<boolean | UrlTree>} Resolves to `true` when the user is authenticated;
 *   otherwise resolves to a `UrlTree` redirecting to `/login`.
 */
export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (await authService.hasValidAccessToken()) {
    authService.isAuthenticated.set(true);
    return true;
  }

  if (await authService.hasValidRefreshToken()) {
    try {
      const refreshed = await authService.refreshToken();
      if (refreshed) return true;
    } catch {
      // Fall through to the login redirect below.
    }
  }

  await authService.clearSession();

  return router.createUrlTree(['/login']);
};
