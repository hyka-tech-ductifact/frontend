# ── Stage 1: Build ──────────────────────────────────────────
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# Copy dependency files FIRST (this layer gets cached if lockfile doesn't change)
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy source code (this layer invalidates when code changes)
COPY . .

# Build Angular app with production optimizations (AOT, tree-shaking, minification)
RUN npx ng build --configuration production

# ── Stage 2: Runtime ────────────────────────────────────────
FROM docker.io/library/nginx:alpine

# Copy built static files from builder stage
COPY --from=builder /app/www /usr/share/nginx/html

# Copy custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Run as non-root user (security best practice — mirrors backend pattern)
RUN adduser -D -g '' appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

USER appuser

CMD ["nginx", "-g", "daemon off;"]
