import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Attaches a Bearer token to outbound requests that target the backend API.
 * Requests to other origins (i18n assets, MinIO storage, third-party CDNs) are
 * passed through unmodified to prevent token leakage.
 * @param {import('@angular/common/http').HttpRequest<unknown>} req - The outbound HTTP request being intercepted.
 * @param {import('@angular/common/http').HttpHandlerFn} next - The next handler in the interceptor chain.
 * @returns {import('rxjs').Observable<import('@angular/common/http').HttpEvent<unknown>>} The response
 *   observable, with an `Authorization: Bearer` header injected for API requests.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api');
  if (!token || !isApiRequest) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
