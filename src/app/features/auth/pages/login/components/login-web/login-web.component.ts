import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import type { LoginRequest, RegisterPendingData } from '../../../../../../core/models/auth.models';

/** Union type representing the two available authentication tabs. */
type AuthTab = 'login' | 'signup';

/**
 * Cross-field validator applied to the signup `FormGroup`.
 * Returns a `passwordsMismatch` error when `password` and `confirmPassword`
 * are both non-empty and do not match.
 * @param {AbstractControl} group - The signup `FormGroup` instance.
 * @returns {ValidationErrors | null} Error object or `null` when passwords match.
 */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

const ACTIVE_TAB_CLASS =
  'flex-1 py-3.5 text-sm font-semibold !rounded-2xl bg-white text-sky-600 shadow-sm transition-all ring-1 ring-black/5';
const INACTIVE_TAB_CLASS =
  'flex-1 py-3.5 text-sm font-semibold !rounded-2xl text-slate-500 hover:text-slate-700 transition-all';

/**
 * Web/desktop presentation component for the login/signup page.
 * Renders a two-panel layout with a collapsible branding panel and an auth form panel.
 */
@Component({
  selector: 'app-login-web',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './login-web.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginWebComponent {
  /** Whether an authentication request is currently in progress. */
  readonly isLoading = input(false);

  /** Current error message key to display, or null when there is no error. */
  readonly error = input<string | null>(null);

  /** Whether the signup flow is in the OTP verification step. */
  readonly isVerificationStep = input(false);

  /** Emitted with login credentials when the user submits the login form. */
  readonly loginSubmit = output<LoginRequest>();

  /** Emitted with registration data when the user submits the signup form (Step 1). */
  readonly registerSubmitted = output<RegisterPendingData>();

  /** Emitted with the OTP code when the user submits the verification form (Step 2). */
  readonly verificationSubmitted = output<string>();

  /** Signal tracking the currently active tab ('login' or 'signup'). */
  readonly activeTab = signal<AuthTab>('login');

  /** Signal controlling whether the left branding panel is in a collapsed state. */
  readonly isLeftPanelCollapsed = signal(false);

  /** Signal controlling visibility of the login password field. */
  readonly showLoginPassword = signal(false);

  /** Signal controlling visibility of the signup password field. */
  readonly showSignupPassword = signal(false);

  /** Signal controlling visibility of the confirm-password field. */
  readonly showConfirmPassword = signal(false);

  /** Signal holding the current value of the signup password field for strength calculation. */
  readonly signupPasswordValue = signal('');

  /** Computed CSS class for the login tab button based on the active tab state. */
  readonly loginTabClass = computed(() =>
    this.activeTab() === 'login' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS,
  );

  /** Computed CSS class for the signup tab button based on the active tab state. */
  readonly signupTabClass = computed(() =>
    this.activeTab() === 'signup' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS,
  );

  /** Computed i18n key for the form title based on the active tab. */
  readonly formTitle = computed(() =>
    this.activeTab() === 'login' ? 'AUTH.LOGIN.TITLE_WELCOME' : 'AUTH.LOGIN.TITLE_CREATE',
  );

  /** Computed i18n key for the form subtitle based on the active tab. */
  readonly formSubtitle = computed(() =>
    this.activeTab() === 'login' ? 'AUTH.LOGIN.SUBTITLE_WELCOME' : 'AUTH.LOGIN.SUBTITLE_CREATE',
  );

  // readonly rightPanelClass = computed(() =>
  //   this.isLeftPanelCollapsed()
  //     ? 'relative w-full flex items-center justify-center p-8 lg:p-12 xl:p-16'
  //     : 'relative w-full lg:w-[45%] xl:w-[42%] flex items-center justify-center p-8 lg:p-12 xl:p-16'
  // );

  /**
   * Computed numeric strength score (0–4) of the current signup password.
   * Each criterion met (length ≥ 8, mixed case, digit, special character) adds 1.
   */
  readonly passwordStrength = computed(() => {
    const value = this.signupPasswordValue();
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[^a-zA-Z\d]/.test(value)) strength++;
    return strength;
  });

  /** Indices used to render the password-strength indicator bars in the template. */
  readonly strengthBars = [0, 1, 2, 3];

  /** Reactive form group for the login tab. */
  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rememberMe: new FormControl(false),
  });

  /** Reactive form group for the signup tab. */
  readonly signupForm = new FormGroup(
    {
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl(''),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      terms: new FormControl(false, [Validators.requiredTrue]),
    },
    { validators: passwordsMatchValidator },
  );

  /** Reactive form group for the OTP verification step. */
  readonly verificationForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(10),
    ]),
  });

  /**
   * True when `password` and `confirmPassword` differ and the confirm field has been touched.
   * @returns {boolean} Whether the passwords-mismatch error should be displayed.
   */
  get passwordsMismatch(): boolean {
    return (
      this.signupForm.hasError('passwordsMismatch') &&
      (this.signupForm.get('confirmPassword')?.touched ?? false)
    );
  }

  /**
   * Switches the active authentication tab.
   * @param {AuthTab} tab - The tab to activate ('login' or 'signup').
   * @returns {void}
   */
  switchTab(tab: AuthTab): void {
    this.activeTab.set(tab);
  }

  /**
   * Toggles the left branding panel between its expanded and collapsed states.
   * @returns {void}
   */
  toggleLeftPanel(): void {
    this.isLeftPanelCollapsed.update((v) => !v);
  }

  /**
   * Handles the native `input` event on the signup password field and updates
   * the `signupPasswordValue` signal used for strength calculation.
   * @param {Event} event - The native input event from the HTML input element.
   * @returns {void}
   */
  onPasswordInput(event: Event): void {
    this.signupPasswordValue.set((event.target as HTMLInputElement).value);
  }

  /**
   * Toggles the visibility of the login password field.
   * @returns {void}
   */
  toggleLoginPassword(): void {
    this.showLoginPassword.update((v) => !v);
  }

  /**
   * Toggles the visibility of the signup password field.
   * @returns {void}
   */
  toggleSignupPassword(): void {
    this.showSignupPassword.update((v) => !v);
  }

  /**
   * Toggles the visibility of the confirm-password field.
   * @returns {void}
   */
  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  /**
   * Validates and submits the login form. Marks all fields as touched when invalid
   * to trigger validation messages, or emits the credentials to the parent.
   * @returns {void}
   */
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.loginSubmit.emit({ email: email!, password: password! });
  }

  /**
   * Validates and submits the signup form (Step 1 — request OTP). Marks all fields as
   * touched when invalid to trigger validation messages, or emits the registration data.
   * @returns {void}
   */
  onRegisterSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    const { fullName, email, password } = this.signupForm.value;
    this.registerSubmitted.emit({ name: fullName!, email: email!, password: password! });
  }

  /**
   * Validates and submits the OTP verification form (Step 2 — verify & complete registration).
   * Marks the code field as touched when invalid, or emits the code to the parent.
   * @returns {void}
   */
  onVerificationSubmit(): void {
    if (this.verificationForm.invalid) {
      this.verificationForm.markAllAsTouched();
      return;
    }
    const { code } = this.verificationForm.value;
    this.verificationSubmitted.emit(code!);
  }
}
