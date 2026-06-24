import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Attaches a Bearer token to outbound requests that target the backend API.
 * Requests to other origins (i18n assets, MinIO storage, third-party CDNs) are
 * passed through unmodified to prevent token leakage.
 * @param req
 * @param next
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api');
  if (!token || !isApiRequest) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
