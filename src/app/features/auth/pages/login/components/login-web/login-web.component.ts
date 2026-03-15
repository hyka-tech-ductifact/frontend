import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import type { LoginCredentials } from '../../../../../../core/models/auth.models';

type AuthTab = 'login' | 'signup';

const ACTIVE_TAB_CLASS =
  'flex-1 py-3.5 text-sm font-semibold rounded-xl bg-white text-sky-600 shadow-sm transition-all ring-1 ring-black/5';
const INACTIVE_TAB_CLASS =
  'flex-1 py-3.5 text-sm font-semibold rounded-xl text-slate-500 hover:text-slate-700 transition-all';

@Component({
  selector: 'app-login-web',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './login-web.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginWebComponent {
  readonly isLoading = input(false);
  readonly loginSubmit = output<LoginCredentials>();

  readonly activeTab = signal<AuthTab>('login');
  readonly isLeftPanelCollapsed = signal(false);
  readonly showLoginPassword = signal(false);
  readonly showSignupPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly signupPasswordValue = signal('');

  readonly loginTabClass = computed(() =>
    this.activeTab() === 'login' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS
  );

  readonly signupTabClass = computed(() =>
    this.activeTab() === 'signup' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS
  );

  readonly formTitle = computed(() =>
    this.activeTab() === 'login' ? 'AUTH.LOGIN.TITLE_WELCOME' : 'AUTH.LOGIN.TITLE_CREATE'
  );

  readonly formSubtitle = computed(() =>
    this.activeTab() === 'login' ? 'AUTH.LOGIN.SUBTITLE_WELCOME' : 'AUTH.LOGIN.SUBTITLE_CREATE'
  );

  readonly rightPanelClass = computed(() =>
    this.isLeftPanelCollapsed()
      ? 'relative w-full flex items-center justify-center p-8 lg:p-12 xl:p-16'
      : 'relative w-full lg:w-[45%] xl:w-[42%] flex items-center justify-center p-8 lg:p-12 xl:p-16'
  );

  readonly passwordStrength = computed(() => {
    const value = this.signupPasswordValue();
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z\d]/.test(value)) strength++;
    return strength;
  });

  readonly strengthBars = [0, 1, 2, 3];

  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

  readonly signupForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
    terms: new FormControl(false, [Validators.requiredTrue]),
  });

  switchTab(tab: AuthTab): void {
    this.activeTab.set(tab);
  }

  toggleLeftPanel(): void {
    this.isLeftPanelCollapsed.update((v) => !v);
  }

  onPasswordInput(event: Event): void {
    this.signupPasswordValue.set((event.target as HTMLInputElement).value);
  }

  toggleLoginPassword(): void {
    this.showLoginPassword.update((v) => !v);
  }

  toggleSignupPassword(): void {
    this.showSignupPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.loginSubmit.emit({ email: email!, password: password! });
  }
}
