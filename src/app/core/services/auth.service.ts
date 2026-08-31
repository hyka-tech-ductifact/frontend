import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import type {
  AppLocale,
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  ResetPasswordPayload,
  TokenResponse,
  UserResponse,
  VerifyRegisterRequest,
} from '../models/auth.models';
import { StorageService } from './storage.service';

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
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);
  private readonly translate = inject(TranslateService);

  private get baseUrl(): string {
    return `${this.config.get('BACKEND_URL')}/auth`;
  }

  /**
   * True when a non-expired access token exists in persisted storage.
   * Updated during bootstrap, login, register, refresh, and logout.
   */
  readonly isAuthenticated = signal(false);

  /**
   * The currently authenticated user's profile, or `null` when logged out.
   * Rehydrated from persisted storage during `initSession()`.
   */
  readonly currentUser = signal<UserResponse | null>(null);

  /**
   * Rehydrates session state from persisted storage during app startup.
   * If the access token has expired but the refresh token is still valid,
   * silently refreshes the session before protected routes activate.
   * @returns {Promise<void>} Resolves once auth state is restored or cleared.
   */
  async initSession(): Promise<void> {
    this.currentUser.set(await this.loadStoredUser());

    if (await this.hasValidAccessToken()) {
      this.isAuthenticated.set(true);
      return;
    }

    if (await this.hasValidRefreshToken()) {
      try {
        const refreshed = await this.refreshToken();
        if (refreshed) return;
      } catch {
        // Fall through to a hard session clear below.
      }
    }

    await this.clearSession();
  }

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
    await this.persistSession(response);
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
    await this.persistSession(response);
  }

  /**
   * Exchanges the stored refresh token for a new access/refresh token pair.
   * Returns `null` when the refresh token is missing or already expired.
   * @returns {Promise<TokenResponse | null>} The new token response, or `null` if refresh cannot proceed.
   */
  async refreshToken(): Promise<TokenResponse | null> {
    const refreshToken = await this.storage.get(REFRESH_TOKEN_KEY);
    const refreshExpiresAt = Number((await this.storage.get(REFRESH_TOKEN_EXPIRES_AT_KEY)) ?? 0);
    if (!refreshToken || Date.now() >= refreshExpiresAt) {
      await this.clearSession();
      return null;
    }

    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.baseUrl}/refresh`, {
        refresh_token: refreshToken,
      }),
    );
    await this.persistTokenPair(response);
    return response;
  }

  /**
   * Backward-compatible alias for code still calling `refresh()`.
   * @returns {Promise<void>} Resolves after any attempted refresh completes.
   */
  async refresh(): Promise<void> {
    await this.refreshToken();
  }

  /**
   * Revokes the refresh token server-side, then clears the session from localStorage
   * and sets `isAuthenticated` to `false`. The server call is best-effort — storage
   * is always cleared even if the request fails.
   * @returns {Promise<void>} Resolves after the logout attempt completes (success or failure).
   */
  async logout(): Promise<void> {
    const refreshToken = await this.storage.get(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      const body: LogoutRequest = { refresh_token: refreshToken };
      // Best-effort: clear session regardless of server response
      await firstValueFrom(this.http.post<void>(`${this.baseUrl}/logout`, body)).catch(
        () => undefined,
      );
    }
    await this.clearSession();
    await this.router.navigate(['/login']);
  }

  /**
   * Returns the persisted access token, or `null` when absent.
   * @returns {Promise<string | null>} The stored access token.
   */
  async getAccessToken(): Promise<string | null> {
    return this.storage.get(ACCESS_TOKEN_KEY);
  }

  /**
   * Returns `true` when the persisted access token exists and is not expired.
   * @returns {Promise<boolean>} Whether the access token is still valid.
   */
  async hasValidAccessToken(): Promise<boolean> {
    const token = await this.storage.get(ACCESS_TOKEN_KEY);
    if (!token) return false;
    const expiresAt = Number((await this.storage.get(ACCESS_TOKEN_EXPIRES_AT_KEY)) ?? 0);
    return Date.now() < expiresAt;
  }

  /**
   * Returns `true` when the persisted refresh token exists and is not expired.
   * @returns {Promise<boolean>} Whether the refresh token is still usable.
   */
  async hasValidRefreshToken(): Promise<boolean> {
    const refreshToken = await this.storage.get(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;
    const refreshExpiresAt = Number((await this.storage.get(REFRESH_TOKEN_EXPIRES_AT_KEY)) ?? 0);
    return Date.now() < refreshExpiresAt;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /**
   * Stores the full auth response (tokens + user) and updates reactive signals.
   * @param {AuthResponse} response - The response from login or register.
   * @returns {void}
   */
  private async persistSession(response: AuthResponse): Promise<void> {
    await this.persistTokenPair(response);
    await this.storage.set(USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  /**
   * Writes the token pair and their absolute expiry timestamps to persisted storage.
   * Expirations are computed from the dynamic `expires_in` / `refresh_expires_in`
   * fields (seconds) returned by the backend. Sets `isAuthenticated` to `true`.
   * Public so `authInterceptor` can persist tokens obtained from its own refresh call.
   * @param {TokenPayload} payload - The token fields from the login/register/refresh response.
   * @returns {Promise<void>}
   */
  async persistTokenPair(payload: TokenPayload): Promise<void> {
    const accessTokenExpiresAt = Date.now() + payload.expires_in * 1000;
    const refreshTokenExpiresAt = Date.now() + payload.refresh_expires_in * 1000;
    await Promise.all([
      this.storage.set(ACCESS_TOKEN_KEY, payload.access_token),
      this.storage.set(REFRESH_TOKEN_KEY, payload.refresh_token),
      this.storage.set(ACCESS_TOKEN_EXPIRES_AT_KEY, accessTokenExpiresAt.toString()),
      this.storage.set(REFRESH_TOKEN_EXPIRES_AT_KEY, refreshTokenExpiresAt.toString()),
    ]);
    this.isAuthenticated.set(true);
  }

  /**
   * Removes all session data from persisted storage and resets both signals to their
   * logged-out state. Public so `authInterceptor` can force a session timeout
   * when the refresh token is expired or the refresh request itself fails.
   * @returns {Promise<void>}
   */
  async clearSession(): Promise<void> {
    await Promise.all([
      this.storage.remove(ACCESS_TOKEN_KEY),
      this.storage.remove(REFRESH_TOKEN_KEY),
      this.storage.remove(ACCESS_TOKEN_EXPIRES_AT_KEY),
      this.storage.remove(REFRESH_TOKEN_EXPIRES_AT_KEY),
      this.storage.remove(USER_KEY),
    ]);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  /**
   * Parses the stored user JSON from persisted storage, or returns `null` if absent or malformed.
   * @returns {Promise<UserResponse | null>} The stored user profile, or `null`.
   */
  private async loadStoredUser(): Promise<UserResponse | null> {
    try {
      const raw = await this.storage.get(USER_KEY);
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
