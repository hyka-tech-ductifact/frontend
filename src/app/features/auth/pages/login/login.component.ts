import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../../core/services/auth.service';
import { DeviceService } from '../../../../core/services/device.service';
import type {
  LoginRequest,
  RegisterPendingData,
  ResetPasswordPayload,
} from '../../../../core/models/auth.models';
import { LoginMobileComponent } from './components/login-mobile/login-mobile.component';
import { LoginWebComponent } from './components/login-web/login-web.component';
import { TranslateService } from '@ngx-translate/core';

/** sessionStorage key for pending registration data during the OTP verification step. */
const PENDING_REGISTER_KEY = 'auth_pending_register';

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
  private readonly translateService = inject(TranslateService);

  /** Signal indicating whether an authentication request is in progress. */
  readonly isLoading = signal(false);

  /** Signal holding the current error message key, or null when there is no error. */
  readonly errorMessage = signal<string | null>(null);

  /** Signal indicating whether the signup flow is in the OTP verification step. */
  readonly isVerificationStep = signal(false);

  /** Signal indicating whether the login flow is in the password reset steps. */
  readonly isPasswordResetStep = signal(false);

  /** Signal tracking if the reset code has been fired to the email input target. */
  readonly isEmailSent = signal<boolean>(false);

  /**
   * Handles the login form submission. Calls `AuthService.login` and navigates
   * to the client area on success, or displays an error toast on failure.
   * @param {LoginRequest} credentials - The email and password entered by the user.
   * @returns {Promise<void>} Resolves when the login flow completes.
   */
  async onLogin(credentials: LoginRequest): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.login(credentials.email, credentials.password);
      await this.router.navigate(['/client']);
    } catch {
      this.errorMessage.set('AUTH.LOGIN.ERROR_INVALID_CREDENTIALS');
      await this.showToast('AUTH.LOGIN.ERROR_INVALID_CREDENTIALS', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handles the signup form submission (Step 1 of OTP registration).
   * Persists the registration data to sessionStorage, sends an OTP to the provided
   * email, then advances the child components to the verification step.
   * @param {RegisterPendingData} data - The name, email, and password collected by the form.
   * @returns {Promise<void>} Resolves when the OTP request completes.
   */
  async onRegister(data: RegisterPendingData): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      sessionStorage.setItem(PENDING_REGISTER_KEY, JSON.stringify(data));
      await this.authService.register(data.email);
      this.isVerificationStep.set(true);
    } catch {
      this.errorMessage.set('AUTH.REGISTER.ERROR_REQUEST_FAILED');
      await this.showToast('AUTH.REGISTER.ERROR_REQUEST_FAILED', 'danger');
      sessionStorage.removeItem(PENDING_REGISTER_KEY);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handles the OTP submission (Step 2 of OTP registration).
   * Reads the pending registration data from sessionStorage, verifies the code, and
   * navigates to the client area on success.
   * @param {string} code - The one-time code entered by the user.
   * @returns {Promise<void>} Resolves when the verification and navigation complete.
   */
  async onVerification(code: string): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const raw = sessionStorage.getItem(PENDING_REGISTER_KEY);
      const pending = raw ? (JSON.parse(raw) as RegisterPendingData) : null;
      if (!pending) throw new Error('No pending registration data found');
      await this.authService.verifyRegister({
        email: pending.email,
        code,
        name: pending.name,
        password: pending.password,
      });
      sessionStorage.removeItem(PENDING_REGISTER_KEY);
      await this.router.navigate(['/client']);
    } catch {
      this.errorMessage.set('AUTH.REGISTER.ERROR_VERIFY_FAILED');
      await this.showToast('AUTH.REGISTER.ERROR_VERIFY_FAILED', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * INTEGRATED — STEP 1: Handles the request for a password reset recovery token.
   * Dispatches the user email to the AuthService data engine layers.
   * @param {string} email - The target email address for code dispatching.
   * @returns {Promise<void>} Resolves when the API token dispatch transaction completes.
   */
  async onResetPasswordCodeRequest(email: string): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      // Adjust this method call to match your actual backend AuthService API signature
      await this.authService.requestPasswordResetCode(email);
      await this.showToast('AUTH.PASSWORD_RESET.CODE_SENT_SUCCESS', 'success');
    } catch {
      this.errorMessage.set('AUTH.PASSWORD_RESET.ERROR_REQUEST_FAILED');
      await this.showToast('AUTH.PASSWORD_RESET.ERROR_REQUEST_FAILED', 'danger');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * INTEGRATED — STEP 2: Submits the unified security verification code alongside
   * the brand-new password credentials to conclude the recovery process.
   * @param {ResetPasswordPayload} payload - Strict structural form field collection framework.
   * @returns {Promise<void>} Resolves when the profile credentials overwrite finishes.
   */
  async onResetPasswordConfirm(payload: ResetPasswordPayload): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.confirmPasswordReset(payload);
      await this.showToast('AUTH.PASSWORD_RESET.SUCCESS_COMPLETE', 'success');
    } catch {
      this.errorMessage.set('AUTH.PASSWORD_RESET.ERROR_VERIFY_FAILED');
      await this.showToast('AUTH.PASSWORD_RESET.ERROR_VERIFY_FAILED', 'danger');
    } finally {
      this.isPasswordResetStep.set(false);
      this.isLoading.set(false);
      this.isEmailSent.set(false);
    }
  }

  /**
   * Creates and presents an Ionic toast to inform the user of an authentication status event.
   * Refactored to cleanly support both warning alerts and success confirmations.
   * @param {string} messageKey - The i18n key for the content payload string.
   * @param {'danger' | 'success'} color - Visual contextual highlight variation configuration.
   * @returns {Promise<void>} Resolves when presentation rendering routines finish execution.
   */
  private async showToast(messageKey: string, color: 'danger' | 'success'): Promise<void> {
    const translatedMessage = this.translateService.instant(messageKey);
    const toast = await this.toastController.create({
      message: translatedMessage,
      duration: 3000,
      color: color,
      position: 'top',
    });
    await toast.present();
  }
}
