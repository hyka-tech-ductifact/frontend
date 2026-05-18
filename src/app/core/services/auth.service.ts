import { Injectable, signal } from '@angular/core';
import type { SignupCredentials } from '../models/auth.models';

/**
 * Service responsible for authentication operations: login, logout, and signup.
 * Exposes a reactive signal to track the current authentication state.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Signal that reflects whether the user is currently authenticated. */
  readonly isAuthenticated = signal(false);

  /**
   * Authenticates the user with the provided email and password.
   * On success, stores a token in localStorage and sets `isAuthenticated` to true.
   * @param {string} email - The user's email address.
   * @param {string} password - The user's plain-text password.
   * @returns {Promise<void>} Resolves when authentication succeeds, rejects on failure.
   */
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

  /**
   * Logs out the current user by removing the token from localStorage
   * and setting `isAuthenticated` to false.
   * @returns {void}
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticated.set(false);
  }

  /**
   * Registers a new user with the provided credentials.
   * On success, stores a token in localStorage and sets `isAuthenticated` to true.
   * @param {SignupCredentials} credentials - The registration data including email and password.
   * @returns {Promise<void>} Resolves when signup succeeds, rejects on failure.
   */
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
