# Ductifact Frontend Makefile

.DEFAULT_GOAL := help

# ─── Variables ───────────────────────────────────────────────

NODE_VERSION ?= 22
CI ?= 0

# ─── .PHONY ─────────────────────────────────────────────────

.PHONY: help \
	deps dev build \
	lint lint-fix fmt fmt-check \
	test test-watch test-ci \
	docker-build docker-start docker-stop \
	validate-branch clean

# ═══════════════════════════════════════════════════════════════
# Help
# ═══════════════════════════════════════════════════════════════

help:
	@echo "Available commands:"
	@echo ""
	@echo "  Development:"
	@echo "    deps             - Install dependencies (npm ci)"
	@echo "    dev              - Start dev server with hot-reload in Docker (:4200)"
	@echo "    build            - Production build → www/"
	@echo ""
	@echo "  Code quality:"
	@echo "    lint             - Run ESLint"
	@echo "    lint-fix         - Run ESLint with auto-fix"
	@echo "    fmt              - Format code with Prettier"
	@echo "    fmt-check        - Check formatting (CI — no writes)"
	@echo ""
	@echo "  Testing:"
	@echo "    test             - Run unit tests (Jest)"
	@echo "    test-watch       - Run tests in watch mode"
	@echo "    test-ci          - Run tests with coverage (CI mode)"
	@echo ""
	@echo "  Docker:"
	@echo "    docker-build     - Build production Docker image"
	@echo "    docker-start     - Start frontend in Docker (Nginx)"
	@echo "    docker-stop      - Stop Docker services"
	@echo ""
	@echo "  CI:"
	@echo "    validate-branch  - Validate branch name convention"
	@echo ""
	@echo "  Maintenance:"
	@echo "    clean            - Remove build artifacts and caches"

# ═══════════════════════════════════════════════════════════════
# Development
# ═══════════════════════════════════════════════════════════════

# Install dependencies (--legacy-peer-deps bypasses Jest/Angular peer conflicts)
deps:
	npm install --legacy-peer-deps

# Start Angular dev server with hot-reload (Node 22 via Docker)
dev:
	docker-compose up dev

# Production build
build:
	npx ng build --configuration production

# ═══════════════════════════════════════════════════════════════
# Code quality
# ═══════════════════════════════════════════════════════════════

# Run ESLint
lint:
	npx ng lint

# Run ESLint with auto-fix
lint-fix:
	npx ng lint --fix

# Format code with Prettier
fmt:
	npx prettier --write "src/**/*.{ts,html,scss,css}"

# Check formatting (no writes — used in CI)
fmt-check:
	npx prettier --check "src/**/*.{ts,html,scss,css}"

# ═══════════════════════════════════════════════════════════════
# Testing
# ═══════════════════════════════════════════════════════════════

# Run unit tests
test:
	npx jest

# Run tests in watch mode
test-watch:
	npx jest --watch

# Run tests in CI mode with coverage
test-ci:
	npx jest --ci --coverage

# ═══════════════════════════════════════════════════════════════
# Docker
# ═══════════════════════════════════════════════════════════════

# Build production Docker image
docker-build:
	docker compose build

# Start frontend in Docker (production mode, Nginx on :4200)
docker-start: docker-build
	docker compose up -d

# Stop Docker services
docker-stop:
	docker compose down

# ═══════════════════════════════════════════════════════════════
# CI — Branch validation
# ═══════════════════════════════════════════════════════════════

# Validate branch name follows convention (feat/, fix/, chore/, hotfix/)
# Mirrors the backend's validate-branch target.
validate-branch:
	@BRANCH=$${BRANCH:-$$(git rev-parse --abbrev-ref HEAD)}; \
	echo "Validating branch: $$BRANCH"; \
	if [ "$$BRANCH" = "main" ] || [ "$$BRANCH" = "release" ]; then \
		echo "✅ Protected branch ($$BRANCH)"; \
		exit 0; \
	fi; \
	if echo "$$BRANCH" | grep -qE '^(feat|fix|chore|hotfix)/[a-z0-9._-]+$$'; then \
		echo "✅ Branch name is valid"; \
	else \
		echo "❌ Invalid branch name: $$BRANCH"; \
		echo "   Must match: feat|fix|chore|hotfix/<kebab-case-description>"; \
		echo "   Examples: feat/add-login, fix/null-pointer, chore/update-deps"; \
		exit 1; \
	fi; \
	if [ -n "$$BASE" ]; then \
		if [ "$$BRANCH" != "$${BRANCH#hotfix/}" ] && [ "$$BASE" != "release" ]; then \
			echo "❌ Hotfix branches must target 'release', not '$$BASE'"; \
			exit 1; \
		fi; \
		if [ "$$BRANCH" = "$${BRANCH#hotfix/}" ] && [ "$$BASE" = "release" ]; then \
			echo "❌ Only hotfix/ branches can target 'release'"; \
			exit 1; \
		fi; \
		echo "✅ Target branch ($$BASE) is valid for $$BRANCH"; \
	fi

# ═══════════════════════════════════════════════════════════════
# Maintenance
# ═══════════════════════════════════════════════════════════════

# Remove build artifacts and caches
clean:
	rm -rf www dist .angular/cache coverage
	@echo "✅ Build artifacts removed"
