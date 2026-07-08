#!/bin/sh
# =============================================================================
# Container entrypoint — injects runtime environment variables into config.json
# before nginx starts serving the Angular application.
#
# Required environment variables:
#   BACKEND_URL       Full http(s) origin of the backend API.
#   TOKEN_EXPIRY_MS   JWT validity window in milliseconds (positive integer).
#   FILE_STORAGE_URL  Base URL for MinIO S3 object-storage assets.
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
: "${TOKEN_EXPIRY_MS:?[entrypoint] TOKEN_EXPIRY_MS is required but not set}"
: "${FILE_STORAGE_URL:?[entrypoint] FILE_STORAGE_URL is required but not set}"

# ---------------------------------------------------------------------------
# 2. Write config.json to the nginx HTML root.
#    TOKEN_EXPIRY_MS is intentionally unquoted — it is a JSON number, not a string.
# ---------------------------------------------------------------------------
cat > /usr/share/nginx/html/config.json <<EOF
{
  "BACKEND_URL": "${BACKEND_URL}",
  "TOKEN_EXPIRY_MS": ${TOKEN_EXPIRY_MS},
  "FILE_STORAGE_URL": "${FILE_STORAGE_URL}"
}
EOF

echo "[entrypoint] config.json written to /usr/share/nginx/html/config.json"

# ---------------------------------------------------------------------------
# 3. Hand off to nginx as PID 1 so it receives OS signals correctly (SIGTERM
#    from Docker stop, SIGHUP for config reload, etc.).
# ---------------------------------------------------------------------------
exec nginx -g "daemon off;"
