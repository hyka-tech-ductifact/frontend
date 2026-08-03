/** Supported UI/API locales, mirroring the backend enum. */
export type AppLocale = 'en' | 'es';

// ─── Request bodies ────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  /** Preferred language. Defaults to 'en' on the server when omitted. */
  locale?: AppLocale;
}

/** Payload sent to POST /auth/register/verify to complete OTP-based registration. */
export interface VerifyRegisterRequest {
  email: string;
  code: string;
  name: string;
  password: string;
  locale?: AppLocale;
}

/** Temporary registration data held in sessionStorage during the OTP verification step. */
export interface RegisterPendingData {
  name: string;
  email: string;
  password: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// ─── UI form data (what registration forms collect, before mapping to RegisterRequest) ────

/** Raw data emitted by the signup/registration form components. */
export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

// ─── Response shapes ───────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  locale: AppLocale;
  email_verified: boolean;
}

/** Returned by POST /auth/login and POST /auth/register. */
export interface AuthResponse {
  user: UserResponse;
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Access token validity window in seconds. */
  expires_in: number;
  /** Refresh token validity window in seconds. */
  refresh_expires_in: number;
}

/** Returned by POST /auth/refresh. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Access token validity window in seconds. */
  expires_in: number;
  /** Refresh token validity window in seconds. */
  refresh_expires_in: number;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  new_password: string; // Optional if you strip it out, or required if sending full form
}
