import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfigService } from '../config/config.service';
import type {
  LoginRequest,
  AuthResponse,
  TokenResponse,
  LogoutRequest,
  UserResponse,
  AppLocale,
  VerifyRegisterRequest,
  MessageResponse,
  ResetPasswordPayload,
} from '../models/auth.models';

export const ACCESS_TOKEN_KEY = 'auth_access_token';
export const REFRESH_TOKEN_KEY = 'auth_refresh_token';
export const ACCESS_TOKEN_EXPIRES_AT_KEY = 'auth_access_token_expires_at';
export const REFRESH_TOKEN_EXPIRES_AT_KEY = 'auth_refresh_token_expires_at';
const USER_KEY = 'auth_user';

/** Shared shape of the login/register and refresh endpoint token fields. */
interface TokenPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

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
   * Initiates the OTP-based registration flow by sending the user's email to the backend.
   * The backend responds with a one-time code sent to that address.
   * @param {string} email - The email address to register.
   * @returns {Promise<void>} Resolves when the OTP request is accepted.
   */
  async register(email: string): Promise<void> {
    await firstValueFrom(this.http.post<MessageResponse>(`${this.baseUrl}/register`, { email }));
  }

  /**
   * Completes the OTP registration flow. Verifies the code and creates the account.
   * Persists the returned token pair and user profile, then sets `isAuthenticated` to `true`.
   * @param {VerifyRegisterRequest} payload - The email, OTP code, name, and password.
   * @returns {Promise<void>} Resolves when the account is created and session is persisted.
   */
  async verifyRegister(payload: VerifyRegisterRequest): Promise<void> {
    const locale = (this.translate.currentLang ?? 'es') as AppLocale;
    const body: VerifyRegisterRequest = { ...payload, locale };
    const response = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/register/verify`, body),
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
    this.persistTokenPair(response);
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
    this.persistTokenPair(response);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  /**
   * Writes the token pair and their absolute expiry timestamps to localStorage.
   * Expirations are computed from the dynamic `expires_in` / `refresh_expires_in`
   * fields (seconds) returned by the backend. Sets `isAuthenticated` to `true`.
   * Public so `authInterceptor` can persist tokens obtained from its own refresh call.
   * @param {TokenPayload} payload - The token fields from the login/register/refresh response.
   * @returns {void}
   */
  persistTokenPair(payload: TokenPayload): void {
    const accessTokenExpiresAt = Date.now() + payload.expires_in * 1000;
    const refreshTokenExpiresAt = Date.now() + payload.refresh_expires_in * 1000;
    localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token);
    localStorage.setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, accessTokenExpiresAt.toString());
    localStorage.setItem(REFRESH_TOKEN_EXPIRES_AT_KEY, refreshTokenExpiresAt.toString());
    this.isAuthenticated.set(true);
  }

  /**
   * Removes all session data from localStorage and resets both signals to their
   * logged-out state. Public so `authInterceptor` can force a session timeout
   * when the refresh token is expired or the refresh request itself fails.
   * @returns {void}
   */
  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
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

  /**
   * Initiates the OTP-based reset flow by sending the user's email to the backend.
   * The backend responds with a one-time code sent to that address.
   * @param {string} email - The email address to reset the password for.
   * @returns {Promise<void>} Resolves when the OTP request is accepted.
   */
  async requestPasswordResetCode(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post<MessageResponse>(`${this.baseUrl}/password/reset`, { email }),
    );
  }

  /**
   * Completes the OTP reset password flow. Verifies the code and resets the password.
   * Persists the returned token pair and user profile, then sets `isAuthenticated` to `true`.
   * @param {ResetPasswordPayload} payload - The email, OTP code, and new password.
   * @returns {Promise<void>} Resolves when the password is reset and session is persisted.
   */
  async confirmPasswordReset(payload: ResetPasswordPayload): Promise<void> {
    const body: ResetPasswordPayload = { ...payload };
    await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/password/reset/verify`, body),
    );
  }
}
