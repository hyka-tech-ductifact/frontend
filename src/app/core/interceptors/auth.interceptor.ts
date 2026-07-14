import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ConfigService } from '../config/config.service';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  ACCESS_TOKEN_EXPIRES_AT_KEY,
} from '../services/auth.service';

/**
 * Attaches a Bearer token to outbound requests that target the backend API.
 * Requests to same-origin assets (config.json, i18n files) and third-party
 * origins are passed through unmodified to prevent token leakage.
 *
 * The `startsWith('http')` guard also ensures `ConfigService` is never
 * accessed before `APP_INITIALIZER` resolves — asset requests during bootstrap
 * use relative paths and exit before `ConfigService.get` is called.
 *
 * Automatically clears the session and redirects to `/login` on any `401`
 * response, covering mid-session JWT expiry.
 * @param {import('@angular/common/http').HttpRequest<unknown>} req - The outbound HTTP request.
 * @param {import('@angular/common/http').HttpHandlerFn} next - The next handler in the chain.
 * @returns {import('rxjs').Observable<import('@angular/common/http').HttpEvent<unknown>>} The
 *   response observable, with `Authorization: Bearer` injected for API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  // Skip asset requests (relative paths) and unauthenticated state.
  if (!token || !req.url.startsWith('http')) return next(req);

  const config = inject(ConfigService);
  const router = inject(Router);

  if (!req.url.startsWith(config.get('BACKEND_URL'))) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
