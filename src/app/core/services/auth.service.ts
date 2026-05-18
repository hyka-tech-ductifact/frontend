import { Injectable, signal } from '@angular/core';
import type { SignupCredentials } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(false);

  login(email: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          localStorage.setItem('auth_token', `dummy_token_${Date.now()}`);
          this.isAuthenticated.set(true);
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1500);
    });
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticated.set(false);
  }

  signup(credentials: SignupCredentials): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          localStorage.setItem('auth_token', `dummy_token_${Date.now()}`);
          this.isAuthenticated.set(true);
          resolve();
        } else {
          reject(new Error('Signup failed'));
        }
      }, 1500);
    });
  }
}
