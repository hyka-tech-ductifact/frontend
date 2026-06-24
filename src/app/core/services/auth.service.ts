import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { LoginCredentials, SignupCredentials } from '../models/auth.models';

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRES_AT_KEY = 'auth_token_expires_at';

interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /**
   * True when a non-expired token exists in localStorage.
   * Expiry is computed using `environment.tokenExpiryMs` (mirrors backend JWT_TOKEN_DURATION).
   */
  readonly isAuthenticated = signal(this.hasValidToken());

  async login(email: string, password: string): Promise<void> {
    const body: LoginCredentials = { email, password };
    const { token } = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/login`, body),
    );
    this.persistToken(token);
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    this.isAuthenticated.set(false);
  }

  async signup(credentials: SignupCredentials): Promise<void> {
    const { token } = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.baseUrl}/signup`, credentials),
    );
    this.persistToken(token);
    this.isAuthenticated.set(true);
  }

  /** Stores the token and its expiry timestamp derived from `environment.tokenExpiryMs`. */
  private persistToken(token: string): void {
    const expiresAt = Date.now() + environment.tokenExpiryMs;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt.toString());
  }

  /** Returns true only when a token exists AND its stored expiry timestamp is in the future. */
  private hasValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    const expiresAt = Number(localStorage.getItem(TOKEN_EXPIRES_AT_KEY) ?? 0);
    return Date.now() < expiresAt;
  }
}
