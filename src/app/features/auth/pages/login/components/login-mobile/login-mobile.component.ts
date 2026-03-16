import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  callOutline,
  eyeOffOutline,
  eyeOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
} from 'ionicons/icons';
import type {
  LoginCredentials,
  SignupCredentials,
} from '../../../../../../core/models/auth.models';

type AuthTab = 'login' | 'signup';

const ACTIVE_TAB_CLASS =
  'flex-1 py-3 text-sm font-semibold rounded-xl bg-white text-sky-600 shadow-sm transition-all ring-1 ring-black/5';
const INACTIVE_TAB_CLASS =
  'flex-1 py-3 text-sm font-semibold rounded-xl text-slate-500 hover:text-slate-700 transition-all';

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
  readonly isLoading = input(false);
  readonly error = input<string | null>(null);
  readonly loginSubmit = output<LoginCredentials>();
  readonly signupSubmit = output<SignupCredentials>();

  readonly activeTab = signal<AuthTab>('login');
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

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      personOutline,
      callOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

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

  onPasswordInput(event: Event): void {
    const customEvent = event as CustomEvent<{ value: string | null | undefined }>;
    this.signupPasswordValue.set(customEvent.detail?.value ?? '');
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

  onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    const { fullName, email, phone, password, confirmPassword } = this.signupForm.value;
    this.signupSubmit.emit({
      fullName: fullName!,
      email: email!,
      phone: phone ?? undefined,
      password: password!,
      confirmPassword: confirmPassword!,
    });
  }
}
