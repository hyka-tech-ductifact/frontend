import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../../../../core/services/auth.service';
import { DeviceService } from '../../../../core/services/device.service';
import type { LoginCredentials, SignupCredentials } from '../../../../core/models/auth.models';
import { LoginMobileComponent } from './components/login-mobile/login-mobile.component';
import { LoginWebComponent } from './components/login-web/login-web.component';

@Component({
  selector: 'app-login',
  imports: [LoginMobileComponent, LoginWebComponent],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly deviceService = inject(DeviceService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async onLogin(credentials: LoginCredentials): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.login(credentials.email, credentials.password);
      await this.router.navigate(['/dashboard']);
    } catch {
      this.errorMessage.set('AUTH.LOGIN.ERROR_INVALID_CREDENTIALS');
      await this.showErrorToast('AUTH.LOGIN.ERROR_INVALID_CREDENTIALS');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSignup(credentials: SignupCredentials): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await this.authService.signup(credentials);
      await this.router.navigate(['/dashboard']);
    } catch {
      this.errorMessage.set('AUTH.LOGIN.ERROR_SIGNUP_FAILED');
      await this.showErrorToast('AUTH.LOGIN.ERROR_SIGNUP_FAILED');
    } finally {
      this.isLoading.set(false);
    }
  }

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
