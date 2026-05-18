export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
}
