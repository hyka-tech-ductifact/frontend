import type { Environment } from './environment.model';

export const environment: Environment = {
  production: false,

  // Relative path intercepted by the Angular dev-server proxy (proxy.conf.json).
  // The proxy forwards all /api/* calls to https://ductifact-staging-api.jcapsule.work.
  apiUrl: '/api',

  // Mirrors backend JWT_TOKEN_DURATION=15m → 15 * 60 * 1000 ms.
  tokenExpiryMs: 15 * 60 * 1000,

  // Local MinIO S3 instance. Start with: docker compose up minio
  fileStorageUrl: 'http://localhost:9000/ductifact',
};
