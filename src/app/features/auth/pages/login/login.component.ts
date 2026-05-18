import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../../core/services/auth.service';
import { DeviceService } from '../../../../core/services/device.service';
import type { LoginCredentials, SignupCredentials } from '../../../../core/models/auth.models';
import { LoginMobileComponent } from './components/login-mobile/login-mobile.component';
import { LoginWebComponent } from './components/login-web/login-web.component';

/**
 * Smart (container) component for the login/signup page.
 * Delegates presentation to platform-specific sub-components and coordinates
 * authentication logic through `AuthService`.
 */
@Component({
  selector: 'app-login',
  imports: [LoginMobileComponent, LoginWebComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  /** Service used to determine whether the app is running on a mobile device. */
  protected readonly deviceService = inject(DeviceService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  /** Signal indicating whether an authentication request is in progress. */
  readonly isLoading = signal(false);

  /** Signal holding the current error message key, or null when there is no error. */
  readonly errorMessage = signal<string | null>(null);

  /**
   * Handles the login form submission. Calls `AuthService.login` and navigates
   * to the client area on success, or displays an error toast on failure.
   * @param {LoginCredentials} credentials - The email and password entered by the user.
   * @returns {Promise<void>} Resolves when the login flow completes.
   */
  async onLogin(credentials: LoginCredentials): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.login(credentials.email, credentials.password);
      await this.router.navigate(['/client']);
    } catch {
      this.errorMessage.set('AUTH.LOGIN.ERROR_INVALID_CREDENTIALS');
      await this.showErrorToast('AUTH.LOGIN.ERROR_INVALID_CREDENTIALS');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handles the signup form submission. Calls `AuthService.signup` and navigates
   * to the client area on success, or displays an error toast on failure.
   * @param {SignupCredentials} credentials - The registration data provided by the user.
   * @returns {Promise<void>} Resolves when the signup flow completes.
   */
  async onSignup(credentials: SignupCredentials): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.signup(credentials);
      await this.router.navigate(['/client']);
    } catch {
      this.errorMessage.set('AUTH.LOGIN.ERROR_SIGNUP_FAILED');
      await this.showErrorToast('AUTH.LOGIN.ERROR_SIGNUP_FAILED');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Creates and presents an Ionic toast with a danger color to inform the user
   * of an authentication error.
   * @param {string} messageKey - The i18n key for the error message to display.
   * @returns {Promise<void>} Resolves when the toast has been presented.
   */
  private async showErrorToast(messageKey: string): Promise<void> {
    const toast = await this.toastController.create({
      message: messageKey,
      duration: 3000,
      color: 'danger',
      position: 'top',
    });
    await toast.present();
  }
}
