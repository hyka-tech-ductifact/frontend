/**
 * Strict contract for all Angular environment configuration objects.
 * Both `environment.ts` and `environment.development.ts` must satisfy this interface.
 * Adding a new property here will produce a compile error in any file that omits it.
 */
export interface Environment {
  /** True only in production builds. Enables Angular optimizations and disables devtools. */
  production: boolean;

  /**
   * Base URL for all backend API requests.
   * - Development: `'/api'` — resolved by the Angular dev-server proxy to the staging HTTPS origin.
   * - Staging/Production: full HTTPS origin (`https://ductifact-staging-api.jcapsule.work`).
   */
  apiUrl: string;

  /**
   * JWT token validity window in milliseconds.
   * Mirrors the backend `JWT_TOKEN_DURATION=15m` setting (15 × 60 × 1000 = 900 000 ms).
   * Used by `AuthService` to compute and persist the token expiry timestamp on login/signup.
   */
  tokenExpiryMs: number;

  /**
   * Base URL for MinIO S3 object-storage assets (backend bucket: `ductifact`).
   * - Development: `http://localhost:9000/ductifact` — direct access to the local MinIO instance.
   * - Staging/Production: `https://ductifact-staging-api.jcapsule.work/storage/ductifact`.
   */
  fileStorageUrl: string;
}
