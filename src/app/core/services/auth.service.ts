import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../config/config.service';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenResponse,
  LogoutRequest,
  UserResponse,
  AppLocale,
} from '../models/auth.models';

export const ACCESS_TOKEN_KEY = 'auth_access_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';
export const ACCESS_TOKEN_EXPIRES_AT_KEY = 'auth_access_token_expires_at';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly translate = inject(TranslateService);
  private readonly baseUrl = `${this.config.get('BACKEND_URL')}/auth`;

  /**
   * True when a non-expired access token exists in localStorage.
   * Updated synchronously on login, register, refresh, and logout.
   */
  readonly isAuthenticated = signal(this.hasValidToken());

  /**
   * The currently authenticated user's profile, or `null` when logged out.
   * Rehydrated from localStorage on service construction so it survives page reloads.
   */
  readonly currentUser = signal<UserResponse | null>(this.loadStoredUser());

  /**
   * Authenticates the user with email and password.
   * Persists the returned token pair and user profile, then sets `isAuthenticated` to `true`.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's plaintext password.
   * @returns {Promise<void>} Resolves when the login request completes successfully.
   */
  async login(email: string, password: string): Promise<void> {
    const body: LoginRequest = { email, password };
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/login`, body),
    );
    this.persistSession(response);
  }

  /**
   * Registers a new user account. Passes the user's current UI locale to the backend.
   * Persists the returned token pair and user profile, then sets `isAuthenticated` to `true`.
   * @param {string} name - The new user's full name.
   * @param {string} email - The new user's email address.
   * @param {string} password - The new user's password (minimum 8 characters).
   * @returns {Promise<void>} Resolves when the registration request completes successfully.
   */
  async register(name: string, email: string, password: string): Promise<void> {
    const locale = (this.translate.currentLang ?? 'es') as AppLocale;
    const body: RegisterRequest = { name, email, password, locale };
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/register`, body),
    );
    this.persistSession(response);
  }

  /**
   * Exchanges the stored refresh token for a new access/refresh token pair.
   * Updates localStorage in place. No-ops if no refresh token is stored.
   * @returns {Promise<void>} Resolves when the refresh request completes successfully.
   */
  async refresh(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return;
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.baseUrl}/refresh`, {
        refresh_token: refreshToken,
      }),
    );
    this.persistTokenPair(response.access_token, response.refresh_token);
  }

  /**
   * Revokes the refresh token server-side, then clears the session from localStorage
   * and sets `isAuthenticated` to `false`. The server call is best-effort — storage
   * is always cleared even if the request fails.
   * @returns {Promise<void>} Resolves after the logout attempt completes (success or failure).
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      const body: LogoutRequest = { refresh_token: refreshToken };
      // Best-effort: clear session regardless of server response
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/logout`, body)).catch(
        () => undefined,
      );
    }
    this.clearSession();
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /**
   * Stores the full auth response (tokens + user) and updates reactive signals.
   * @param {AuthResponse} response - The response from login or register.
   * @returns {void}
   */
  private persistSession(response: AuthResponse): void {
    this.persistTokenPair(response.access_token, response.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  /**
   * Writes the token pair and access token expiry timestamp to localStorage.
   * Sets `isAuthenticated` to `true`.
   * @param {string} accessToken - The short-lived JWT.
   * @param {string} refreshToken - The long-lived refresh JWT.
   * @returns {void}
   */
  private persistTokenPair(accessToken: string, refreshToken: string): void {
    const expiresAt = Date.now() + this.config.get('TOKEN_EXPIRY_MS');
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
    this.isAuthenticated.set(true);
  }

  /**
   * Removes all session data from localStorage and resets both signals to their
   * logged-out state.
   * @returns {void}
   */
  private clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  /**
   * Returns `true` if a non-expired access token exists in localStorage.
   * @returns {boolean} Whether the stored access token is present and not yet expired.
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return false;
    const expiresAt = Number(localStorage.getItem(ACCESS_TOKEN_EXPIRES_AT_KEY) ?? 0);
    return Date.now() < expiresAt;
  }

  /**
   * Parses the stored user JSON from localStorage, or returns `null` if absent or malformed.
   * @returns {UserResponse | null} The stored user profile, or `null`.
   */
  private loadStoredUser(): UserResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserResponse) : null;
    } catch {
      return null;
    }
  }
}
