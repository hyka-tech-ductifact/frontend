#!/bin/sh
# =============================================================================
# Container entrypoint — injects runtime environment variables into config.json
# before nginx starts serving the Angular application.
#
# Required environment variables:
#   BACKEND_URL            Full http(s) origin of the backend API.
#   JWT_ACCESS_TOKEN_TTL_SECONDS Access token validity window in milliseconds (positive integer).
#   JWT_REFRESH_TOKEN_TTL_SECONDS Refresh token validity window in milliseconds (positive integer).
#   FILE_STORAGE_URL       Base URL for MinIO S3 object-storage assets.
#
# The generated config.json is fetched by ConfigService via APP_INITIALIZER
# before the Angular app bootstraps. Any missing variable aborts the container.
# =============================================================================
set -e

# ---------------------------------------------------------------------------
# 1. Validate — fail fast with a clear message if any variable is missing.
#    Uses POSIX `:` with ${VAR:?} expansion: exits non-zero and prints the
#    message if the variable is unset or empty.
# ---------------------------------------------------------------------------
: "${BACKEND_URL:?[entrypoint] BACKEND_URL is required but not set}"
: "${JWT_ACCESS_TOKEN_TTL_SECONDS:?[entrypoint] JWT_ACCESS_TOKEN_TTL_SECONDS is required but not set}"
: "${JWT_REFRESH_TOKEN_TTL_SECONDS:?[entrypoint] JWT_REFRESH_TOKEN_TTL_SECONDS is required but not set}"
: "${FILE_STORAGE_URL:?[entrypoint] FILE_STORAGE_URL is required but not set}"

# ---------------------------------------------------------------------------
# 2. Write config.json to the nginx HTML root.
#    JWT_ACCESS_TOKEN_TTL_SECONDS and JWT_REFRESH_TOKEN_TTL_SECONDS are intentionally unquoted — they are JSON numbers.
# ---------------------------------------------------------------------------
cat > /usr/share/nginx/html/config.json <<EOF
{
  "BACKEND_URL": "${BACKEND_URL}",
  "JWT_ACCESS_TOKEN_TTL_SECONDS": ${JWT_ACCESS_TOKEN_TTL_SECONDS},
  "JWT_REFRESH_TOKEN_TTL_SECONDS": ${JWT_REFRESH_TOKEN_TTL_SECONDS},
  "FILE_STORAGE_URL": "${FILE_STORAGE_URL}"
}
EOF

echo "[entrypoint] config.json written to /usr/share/nginx/html/config.json"

# ---------------------------------------------------------------------------
# 3. Hand off to nginx as PID 1 so it receives OS signals correctly (SIGTERM
#    from Docker stop, SIGHUP for config reload, etc.).
# ---------------------------------------------------------------------------
exec nginx -g "daemon off;"
