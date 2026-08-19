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
import {
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  callOutline,
  eyeOffOutline,
  eyeOutline,
  keypadOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import type {
  LoginRequest,
  RegisterPendingData,
  ResetPasswordPayload,
} from '../../../../../../core/models/auth.models';

/** Union type representing the two available authentication tabs. */
type AuthTab = 'login' | 'signup';

/**
 * Cross-field validator applied to both signup and password reset FormGroups.
 * Returns a `passwordsMismatch` error when `password` and `confirmPassword`
 * are both non-empty and do not match.
 * @param {AbstractControl} group - The FormGroup instance.
 * @returns {ValidationErrors | null} Error object or `null` when passwords match.
 */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string;
  const confirm = group.get('confirmPassword')?.value as string;
  return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
}

const ACTIVE_TAB_CLASS =
  'flex-1 py-3 text-sm font-semibold !rounded-xl bg-white text-sky-600 shadow-sm transition-all ring-1 ring-black/5 active:scale-95';
const INACTIVE_TAB_CLASS =
  'flex-1 py-3 text-sm font-semibold !rounded-xl text-slate-500 hover:text-slate-700 transition-all active:scale-95';

/**
 * Mobile presentation component for the login/signup page.
 * Renders a tabbed interface with login and signup forms optimised for small screens.
 */
@Component({
  selector: 'app-login-mobile',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    IonContent,
    IonItem,
    IonInput,
    IonIcon,
    IonCheckbox,
    IonSpinner,
  ],
  templateUrl: './login-mobile.component.html',
  styleUrl: './login-mobile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginMobileComponent {
  // ─── INPUTS ─────────────────────────────────────────────────────────────

  /** Whether an authentication request is currently in progress. */
  readonly isLoading = input(false);

  /** Current error message key to display, or null when there is no error. */
  readonly error = input<string | null>(null);

  /** Whether the signup flow is in the OTP verification step. */
  readonly isVerificationStep = input(false);

  // ─── OUTPUTS ────────────────────────────────────────────────────────────

  /** Emitted with login credentials when the user submits the login form. */
  readonly loginSubmit = output<LoginRequest>();

  /** Emitted with registration data when the user submits the signup form (Step 1). */
  readonly registerSubmitted = output<RegisterPendingData>();

  /** Emitted with the OTP code when the user submits the verification form (Step 2). */
  readonly verificationSubmitted = output<string>();

  /** Emitted when requesting the password reset OTP code. */
  readonly emailSubmitted = output<string>();

  /** Emitted with the complete code and password payload to execute the reset. */
  readonly resetPasswordSubmitted = output<ResetPasswordPayload>();

  // ─── SIGNALS (UI STATE) ─────────────────────────────────────────────────

  /** Signal tracking the currently active tab ('login' or 'signup'). */
  readonly activeTab = signal<AuthTab>('login');

  /** Signal controlling whether the UI shows the password recovery view. */
  readonly isPasswordResetStep = signal<boolean>(false);

  /** Signal tracking if the reset code has been fired to the email input target. */
  readonly isEmailSent = signal<boolean>(false);

  /** Signal controlling visibility of the login password field. */
  readonly showLoginPassword = signal(false);

  /** Signal controlling visibility of the signup password field. */
  readonly showSignupPassword = signal(false);

  /** Signal controlling visibility of the confirm-password field. */
  readonly showConfirmPassword = signal(false);

  /** Signal holding the current value of the signup password field for strength calculation. */
  readonly signupPasswordValue = signal('');

  /** Signal controlling visibility of the reset password field. */
  readonly showResetPassword = signal(false);

  /** Computed CSS class for the login tab button based on the active tab state. */
  readonly loginTabClass = computed(() =>
    this.activeTab() === 'login' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS,
  );

  /** Computed CSS class for the signup tab button based on the active tab state. */
  readonly signupTabClass = computed(() =>
    this.activeTab() === 'signup' ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS,
  );

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

  /**
   * Registers the Ionicons used in this component's template.
   */
  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      personOutline,
      callOutline,
      eyeOutline,
      eyeOffOutline,
      shieldCheckmarkOutline,
      arrowBackOutline,
      keypadOutline,
    });
  }

  // ─── FORM GROUPS ────────────────────────────────────────────────────────

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

  /** Reactive form group for the password recovery workflow (Steps 1 & 2). */
  readonly resetPasswordForm = new FormGroup(
    {
      email: new FormControl('', [Validators.required, Validators.email]),
      code: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern(/^\d+$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordsMatchValidator },
  );

  // ─── GETTERS ────────────────────────────────────────────────────────────

  /**
   * True when `password` and `confirmPassword` differ and the confirm field has been
   * touched and modified. Dynamically evaluates based on whether user is registering
   * or resetting password.
   * @returns {boolean} Whether the passwords-mismatch error should be displayed.
   */
  get passwordsMismatch(): boolean {
    if (this.isPasswordResetStep()) {
      const confirmCtrl = this.resetPasswordForm.get('confirmPassword');
      return (
        this.resetPasswordForm.hasError('passwordsMismatch') &&
        !!confirmCtrl?.touched &&
        !!confirmCtrl?.dirty
      );
    }
    const confirmCtrl = this.signupForm.get('confirmPassword');
    return (
      this.signupForm.hasError('passwordsMismatch') &&
      !!confirmCtrl?.touched &&
      !!confirmCtrl?.dirty
    );
  }

  /**
   * Reusable validation-state check for template error messages: a field is only
   * reported invalid once the user has interacted with it (touched).
   * @param {FormGroup} form - The form group containing the field.
   * @param {string} fieldName - The name of the control to check.
   * @param {string} [errorType] - Optional specific error key to check for.
   * @returns {boolean} Whether the field should display an error.
   */
  isFieldInvalid(form: FormGroup, fieldName: string, errorType?: string): boolean {
    const control = form.get(fieldName);
    if (!control || !control.touched) return false;
    return errorType ? control.hasError(errorType) : control.invalid;
  }

  // ─── METHODS ────────────────────────────────────────────────────────────

  /**
   * Switches the active authentication tab.
   * @param {AuthTab} tab - The tab to activate ('login' or 'signup').
   * @returns {void}
   */
  switchTab(tab: AuthTab): void {
    this.activeTab.set(tab);
    this.isPasswordResetStep.set(false);
    this.isEmailSent.set(false);
    this.loginForm.reset();
    this.signupForm.reset();
    this.verificationForm.reset();
    this.resetPasswordForm.reset();
    this.signupPasswordValue.set('');
  }

  /**
   * Handles the Ionic `ionInput` event on the signup password field and updates
   * the `signupPasswordValue` signal used for strength calculation.
   * @param {Event} event - The native input event from the Ionic input component.
   * @returns {void}
   */
  onPasswordInput(event: Event): void {
    const customEvent = event as CustomEvent<{ value: string | null | undefined }>;
    this.signupPasswordValue.set(customEvent.detail?.value ?? '');
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
   * Toggles the visibility of the reset password field.
   * @returns {void}
   */
  toggleResetPassword(): void {
    this.showResetPassword.update((v) => !v);
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

  // ─── PASSWORD RESET FLOW HANDLERS ───────────────────────────────────────

  /**
   * Activates the custom multi-step recovery flow state wrapper.
   * @returns {void}
   */
  onNavigateToForgot(): void {
    this.isPasswordResetStep.set(true);
  }

  /**
   * Resets the password recovery workflow state back to default login parameters.
   * @returns {void}
   */
  onCancelReset(): void {
    this.activeTab.set('login');
    this.isPasswordResetStep.set(false);
    this.isEmailSent.set(false);
    this.showSignupPassword.set(false);
    this.showConfirmPassword.set(false);
    this.showResetPassword.set(false);
    this.loginForm.reset();
    this.signupForm.reset();
    this.verificationForm.reset();
    this.resetPasswordForm.reset();
    this.signupPasswordValue.set('');
  }

  /**
   * Dispatches user email choice up to service layer orchestrator
   * and blocks input modifications upon a valid local state layout evaluation.
   * @returns {void}
   */
  onSendCode(): void {
    this.resetPasswordForm.markAllAsTouched();
    const emailControl = this.resetPasswordForm.get('email');
    if (emailControl?.valid && emailControl.value) {
      this.emailSubmitted.emit(emailControl.value);
      this.isEmailSent.set(true);
    }
  }

  /**
   * Submits the unified collection payload back up to parent smart engine.
   * @returns {void}
   */
  onResetPasswordSubmit(): void {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.valid && !this.passwordsMismatch) {
      const { email, password, code } = this.resetPasswordForm.value;
      this.resetPasswordSubmitted.emit({ email: email!, new_password: password!, code: code! });
      this.onCancelReset();
    }
  }
}
