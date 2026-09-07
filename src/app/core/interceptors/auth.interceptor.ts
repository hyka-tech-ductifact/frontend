import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  ReplaySubject,
  catchError,
  finalize,
  from,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { ConfigService } from '../config/config.service';
import { AuthService } from '../services/auth.service';

/** Public auth endpoints that never carry a Bearer token and never trigger a refresh. */
const UNAUTHENTICATED_PATHS = [
  '/login',
  '/register',
  '/register/verify',
  '/refresh',
  '/password/reset',
  '/password/reset/verify',
];

// Module-scoped mutex state shared across all requests handled by this interceptor.
let isRefreshing = false;
// Emits the new access token once a refresh completes; queued requests wait on this.
let refreshTokenSubject: ReplaySubject<string> | null = null;

/**
 * Attaches a Bearer token to outbound requests that target the backend API,
 * transparently refreshes the session on `401` responses (de-duplicating
 * concurrent refreshes via a mutex + request queue), and forces logout when
 * the refresh token is missing, expired, or itself rejected by the backend.
 *
 * Requests to same-origin assets (config.json, i18n files), third-party
 * origins, and the public auth endpoints (login/register/refresh/password
 * reset) are passed through unmodified.
 * @param {HttpRequest<unknown>} req - The outbound HTTP request.
 * @param {HttpHandlerFn} next - The next handler in the chain.
 * @returns {Observable<HttpEvent<unknown>>} The response observable, with
 *   `Authorization: Bearer` injected for authenticated API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip asset requests (relative paths) before touching ConfigService, which
  // isn't guaranteed to be ready until after APP_INITIALIZER resolves.
  if (!req.url.startsWith('http')) return next(req);

  const config = inject(ConfigService);
  const router = inject(Router);
  const authService = inject(AuthService);

  const backendUrl = config.get('BACKEND_URL');
  if (!req.url.startsWith(backendUrl)) return next(req);

  const authBaseUrl = `${backendUrl}/auth`;
  const isPublicAuthEndpoint = UNAUTHENTICATED_PATHS.some(
    (path) => req.url === `${authBaseUrl}${path}`,
  );
  if (isPublicAuthEndpoint) return next(req);

  return from(authService.getAccessToken()).pipe(
    switchMap((token) => {
      const authReq = token ? attachToken(req, token) : req;

      return next(authReq).pipe(
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            return handleUnauthorized(authReq, next, { router, authService });
          }
          return throwError(() => err);
        }),
      );
    }),
  );
};

/**
 * Clones a request with the `Authorization: Bearer` header set.
 * @param {HttpRequest<unknown>} req - The request to clone.
 * @param {string} token - The access token to attach.
 * @returns {HttpRequest<unknown>} The cloned request carrying the header.
 */
function attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/** Collaborators needed by {@link handleUnauthorized}, threaded through to avoid calling `inject()` inside RxJS callbacks. */
interface RefreshContext {
  router: Router;
  authService: AuthService;
}

/**
 * Handles a `401` from an authenticated request: forces logout if the refresh
 * token is missing/expired, otherwise triggers (or queues behind) a single
 * shared token refresh and replays the original request with the new token.
 * @param {HttpRequest<unknown>} req - The original (already Bearer-attached) request that failed.
 * @param {HttpHandlerFn} next - The next handler, used to replay the request.
 * @param {RefreshContext} ctx - Injected collaborators.
 * @returns {Observable<HttpEvent<unknown>>} The replayed response, or an error if the session is over.
 */
function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  ctx: RefreshContext,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject = new ReplaySubject<string>(1);

    return from(ctx.authService.refreshToken()).pipe(
      switchMap((response) => {
        if (!response) {
          const sessionError = new Error('Session expired');
          refreshTokenSubject?.error(sessionError);
          return from(forceLogout(ctx.authService, ctx.router)).pipe(
            switchMap(() => throwError(() => sessionError)),
          );
        }

        refreshTokenSubject?.next(response.access_token);
        refreshTokenSubject?.complete();
        return next(attachToken(req, response.access_token));
      }),
      catchError((refreshErr: unknown) => {
        refreshTokenSubject?.error(refreshErr);
        return from(forceLogout(ctx.authService, ctx.router)).pipe(
          catchError((refreshErr: unknown) => {
            return throwError(() => refreshErr);
          }),
          switchMap(() => throwError(() => refreshErr)),
        );
      }),
      finalize(() => {
        isRefreshing = false;
        refreshTokenSubject = null;
      }),
    );
  }

  // A refresh is already in flight — queue behind it and replay once it resolves.
  if (!refreshTokenSubject) {
    return throwError(() => new Error('Refresh state unavailable'));
  }

  return refreshTokenSubject.pipe(
    take(1),
    switchMap((accessToken) => next(attachToken(req, accessToken))),
  );
}

/**
 * Clears the local session and redirects to the sign-in page. Used for both
 * an expired/missing refresh token and a failed refresh call.
 * @param {AuthService} authService - Used to clear stored tokens/user and reset signals.
 * @param {Router} router - Used to navigate back to `/login`.
 * @returns {void}
 */
async function forceLogout(authService: AuthService, router: Router): Promise<void> {
  await authService.clearSession();
  await router.navigate(['/login']);
}
