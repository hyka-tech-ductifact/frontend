import type { Environment } from './environment.model';

export const environment: Environment = {
  production: true,

  // Staging HTTPS origin. All feature services append their resource path to this base.
  apiUrl: 'https://ductifact-staging-api.jcapsule.work',

  // Mirrors backend JWT_TOKEN_DURATION=15m → 15 * 60 * 1000 ms.
  tokenExpiryMs: 15 * 60 * 1000,

  // Staging MinIO bucket exposed through the API gateway under /storage.
  fileStorageUrl: 'https://ductifact-staging-api.jcapsule.work/storage/ductifact',
};
