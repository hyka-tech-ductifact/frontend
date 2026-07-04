import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import type { LoginCredentials, SignupCredentials } from '../models/auth.models';

export const TOKEN_KEY = 'auth_token';
export const TOKEN_EXPIRES_AT_KEY = 'auth_token_expires_at';

interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);
  private readonly baseUrl = `${this.config.get('BACKEND_URL')}/auth`;

  /**
   * True when a non-expired token exists in localStorage.
   * Expiry is computed using `environment.tokenExpiryMs` (mirrors backend JWT_TOKEN_DURATION).
   */
  readonly isAuthenticated = signal(this.hasValidToken());

  /**
   * Authenticates the user with email and password credentials.
   * On success, persists the JWT and its expiry timestamp via {@link persistToken},
   * then sets `isAuthenticated` to `true`.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's plaintext password.
   * @returns {Promise<void>} Resolves when the login request completes successfully.
   */
  async login(email: string, password: string): Promise<void> {
    const body: LoginCredentials = { email, password };
    const { token } = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/login`, body),
    );
    this.persistToken(token);
    this.isAuthenticated.set(true);
  }

  /**
   * Signs the user out by removing the stored JWT and its expiry timestamp from
   * localStorage, then sets `isAuthenticated` to `false`.
   * @returns {void}
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    this.isAuthenticated.set(false);
  }

  /**
   * Registers a new user account with the provided credentials.
   * On success, persists the JWT and its expiry timestamp via {@link persistToken},
   * then sets `isAuthenticated` to `true`.
   * @param {SignupCredentials} credentials - The new user's registration data.
   * @returns {Promise<void>} Resolves when the signup request completes successfully.
   */
  async signup(credentials: SignupCredentials): Promise<void> {
    const { token } = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/signup`, credentials),
    );
    this.persistToken(token);
    this.isAuthenticated.set(true);
  }

  /**
   * Stores the token and its expiry timestamp derived from `environment.tokenExpiryMs`.
   * Both values are written to localStorage so they survive page reloads.
   * @param {string} token - The raw JWT string returned by the backend.
   * @returns {void}
   */
  private persistToken(token: string): void {
    const expiresAt = Date.now() + this.config.get('TOKEN_EXPIRY_MS');
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
  }

  /**
   * Checks whether a valid, non-expired JWT exists in localStorage.
   * Uses the expiry timestamp written by {@link persistToken} rather than
   * decoding the token itself, keeping the check synchronous and dependency-free.
   * @returns {boolean} `true` if a token exists and its expiry timestamp is in the future;
   *   `false` otherwise.
   */
  private hasValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_AT_KEY) ?? 0);
    return Date.now() < expiresAt;
  }
}
