import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { DeviceService } from '../../../../core/services/device.service';
import type { LoginCredentials } from '../../../../core/models/auth.models';
import { LoginMobileComponent } from './components/login-mobile/login-mobile.component';
import { LoginWebComponent } from './components/login-web/login-web.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [LoginMobileComponent, LoginWebComponent, TranslateModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly deviceService = inject(DeviceService);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);

  async onLogin(credentials: LoginCredentials): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    try {
      await this.authService.login(credentials.email, credentials.password);
      // TODO: Navigate to dashboard
    } catch {
      // TODO: Show error notification
    } finally {
      this.isLoading.set(false);
    }
  }
}
