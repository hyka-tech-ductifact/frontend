# Contributing Guide

> This guide is aligned with the [backend CONTRIBUTING.md](../backend/CONTRIBUTING.md).
> Both repos use the same branching strategy, commit conventions, and PR rules.

## Workflow overview

- Short-lived topic branches → PR into `main`
- Every merge into `main` produces an immutable candidate image
- Promotion to production is decided and executed from `infra` (GitOps)

---

## 1) Setup

```bash
git clone <repo-url>
cd frontend
make deps        # installs dependencies + Husky hooks
make dev         # starts Angular dev server at http://localhost:4200
```

---

## 2) Branches

| Branch | Purpose | Example |
|--------|---------|---------|
| `main` | Single integration branch, always deployable | — |
| `feat/` | New features | `feat/add-login-page` |
| `fix/` | Bug fixes | `fix/broken-navigation` |
| `chore/` | Everything else (docs, tests, refactor, deps, CI) | `chore/update-angular` |

---

## 3) Day-to-day workflow

```bash
git checkout main && git pull
git checkout -b feat/add-login-page

# work, commit, push
git push -u origin feat/add-login-page
```

Open a PR into `main`. Use **squash merge** (1 PR = 1 commit).

Stay up to date before merging:

```bash
git fetch origin && git rebase origin/main
```

### Before pushing

Run the quality checks locally — same commands CI will run:

```bash
make lint        # ESLint
make fmt-check   # Prettier formatting
make test        # Jest unit tests
make build       # Production build (catches AOT errors)
```

---

## 4) CD model (main-only)

- We do **not** run a frontend release process (no release branch, no hotfix branch, no release tags).
- Every merge into `main` publishes an immutable image (candidate artifact).
- Production is promoted from the `infra` repository by updating production manifests to a tested image.
- Frontend contributors focus on shipping validated changes to `main`; promotion timing is owned by infra.

### Summary

| Situation | Branch from | PR target | Artifact outcome | Production decision |
|-----------|-------------|-----------|------------------|---------------------|
| Feature / fix | `main` | `main` | New immutable candidate image | `infra` promotion PR |
| Urgent fix | `main` | `main` | New immutable candidate image | `infra` promotion PR |

---

## 5) Commit messages & PR titles

We use [Conventional Commits](https://www.conventionalcommits.org/). Since we do
**squash merge**, the PR title becomes the commit message on `main`. CI validates
the PR title format automatically.

Husky + commitlint also validate commit messages **locally** — bad messages are
rejected before they reach CI.

### Format

```
<type>(<scope>): <description>
```

### Types

| Type | When to use | In changelog? |
|------|------------|---------------|
| `feat` | New feature | Yes |
| `fix` | Bug fix | Yes |
| `chore` | Everything else (docs, deps, refactor, CI, tests...) | No |

### Examples

```
feat(auth): add login page with form validation
fix(nav): prevent double navigation on back button
chore: update Angular to v20
feat(ui)!: redesign main dashboard layout    ← breaking change
```

### Breaking changes

Add `!` after the scope to indicate a breaking change:

```
feat(api)!: change API service response format
```

---

## 6) PR rules

- No direct pushes to `main`
- CI must pass (lint, format check, tests, build, **PR title validation**)
- PR title must follow Conventional Commits format (see §5)
- Keep PRs small and focused
- Use **squash merge** (1 PR = 1 commit)

---

## 7) Useful commands

| Command | Purpose |
|---------|---------|
| `make help` | List all available Makefile targets |
| `make deps` | Install dependencies (`npm ci`) |
| `make dev` | Start dev server with hot-reload |
| `make build` | Production build |
| `make lint` | Run ESLint |
| `make fmt` | Format code with Prettier |
| `make test` | Run unit tests |
| `make docker-build` | Build production Docker image |
| `make docker-start` | Start frontend in Docker (Nginx) |
| `make clean` | Remove build artifacts |
