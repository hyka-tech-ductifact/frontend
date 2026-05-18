# Infrastructure Guide — Ductifact Frontend

> This document explains **why** each infrastructure tool exists in this project,
> not just how to use it. Read it before touching any config file.

---

## Table of Contents

1. [Docker](#1-docker)
2. [Makefile](#2-makefile)
3. [CI/CD (GitHub Actions)](#3-cicd-github-actions)
4. [Husky & Conventional Commits](#4-husky--conventional-commits)

---

## 1. Docker

### Why Docker for a frontend?

Angular produces static files (HTML, CSS, JS). You _could_ just copy them to any
web server. Docker adds two things:

- **Reproducibility** — the same image runs identically on your laptop, in CI,
  and in production. "Works on my machine" stops being a phrase.
- **Isolation** — the frontend container carries its own Nginx, its own config,
  and zero dependencies on the host OS.

### Why a multi-stage Dockerfile?

A single-stage build would ship Node.js, `node_modules/`, source code, and
Angular CLI inside the production image — ~1.5 GB of attack surface and wasted
disk. A multi-stage build solves this:

```
┌─────────────────────────────────┐
│  Stage 1: builder (node:22)     │
│  ┌───────────────────────────┐  │
│  │ npm ci                    │  │  ← Install deps from lockfile
│  │ ng build --configuration  │  │  ← Compile Angular → static files
│  │          production       │  │
│  └───────────────────────────┘  │
│         output: www/            │
└──────────────┬──────────────────┘
               │ COPY --from=builder
               ▼
┌─────────────────────────────────┐
│  Stage 2: runtime (nginx:alpine)│
│  ┌───────────────────────────┐  │
│  │ www/ → /usr/share/nginx/  │  │  ← Only static files
│  │ nginx.conf                │  │  ← SPA routing config
│  └───────────────────────────┘  │
│         ~25 MB total            │
└─────────────────────────────────┘
```

**Key insight**: the final image contains _only_ Nginx + your compiled JS/CSS/HTML.
Node.js never reaches production.

### Layer caching strategy

```dockerfile
COPY package.json package-lock.json ./   # ← changes rarely
RUN npm ci                               # ← cached if lockfile unchanged
COPY . .                                 # ← invalidates on every code change
RUN npx ng build                         # ← re-runs only when code changes
```

Docker caches each layer. By copying `package*.json` _before_ the source code,
the expensive `npm ci` step is cached as long as dependencies don't change.
This turns a 2-minute build into a 15-second one during development.

### How docker-compose.yml connects front and back

Both `docker-compose.yml` files (frontend and backend) reference an **external
Docker network** called `ductifact`. This lets containers discover each other
by service name:

```
┌─────────────┐       ductifact network       ┌─────────────┐
│  frontend   │ ◄──────────────────────────── │   backend    │
│  :4200      │   http://backend:8080/v1/...  │   :8080      │
└─────────────┘                                └──────┬──────┘
                                                      │
                                               ┌──────┴──────┐
                                               │   postgres   │
                                               │   :5432      │
                                               └─────────────┘
```

In development mode (`make docker-dev`), the frontend container mounts your
`src/` directory as a volume so Angular's dev server picks up file changes
instantly (hot-reload). In smoke-test mode (`make docker-start`), it builds
the production image and serves via Nginx.

### Security: non-root user

Both the backend and frontend Dockerfiles create a non-root user to run the
process. This is a defense-in-depth measure: if an attacker exploits a
vulnerability, they land as an unprivileged user, limiting what they can do.

---

## 2. Makefile

### Why not just use npm scripts?

npm scripts are fine for single commands (`npm test`, `npm run lint`). But when
your workflow involves **orchestrating multiple tools** — Docker, npm, eslint,
prettier, jest, branch validation — npm scripts become unwieldy:

| Concern | npm scripts | Makefile |
|---------|-------------|----------|
| Chaining Docker + npm | Messy `&&` chains in JSON | Clean targets with dependencies |
| Environment variables | Requires `cross-env` or `.env` hacks | Native `-include .env` + `export` |
| Conditional logic | Impossible in `package.json` | Full shell scripting |
| Self-documenting | Need a README | `make help` auto-lists everything |
| CI alignment | CI calls `npm run X` | CI calls `make X` — same interface everywhere |

### The `make help` pattern

The default target prints all available commands, grouped by category. This is
the same pattern used in the backend. Any developer can type `make` and
immediately see what's available without reading docs.

### Command reference

| Command | What it does | When to use |
|---------|-------------|-------------|
| `make deps` | `npm ci` — install from lockfile | After cloning, or when `package-lock.json` changes |
| `make dev` | `ng serve` — dev server at :4200 | Daily development |
| `make build` | Production build → `www/` | Before deploying or testing the Docker image |
| `make lint` | Run ESLint on `src/` | Before committing |
| `make lint-fix` | Auto-fix ESLint issues | When lint reports fixable errors |
| `make fmt` | Format code with Prettier | Before committing |
| `make fmt-check` | Check formatting (no writes) | CI uses this to fail on unformatted code |
| `make test` | Run Jest unit tests | Before committing |
| `make test-ci` | Jest + coverage + CI flags | CI pipeline |
| `make docker-build` | Build the production Docker image | Test that the Dockerfile works |
| `make docker-start` | Start frontend via Docker (Nginx) | Smoke test the production build |
| `make docker-stop` | Stop Docker services | Cleanup |
| `make validate-branch` | Check branch name matches convention | CI pipeline (also available locally) |
| `make clean` | Remove `www/`, `dist/`, `.angular/cache`, `coverage/` | When things feel broken |

### Why `npm ci` instead of `npm install`?

`npm ci` deletes `node_modules/` and installs _exactly_ what's in
`package-lock.json`. It's faster (no dependency resolution), deterministic
(no version drift), and required for reproducible CI builds. `npm install` can
silently update the lockfile — dangerous in CI.

---

## 3. CI/CD (GitHub Actions)

### Pipeline overview

The CI pipeline lives in `.github/workflows/ci.yml` and runs on every push to
`main` and every PR targeting `main` or `release`. It mirrors the backend's
structure:

```
PR opened → ┌──────────┐
             │ PR Rules │ ← validate branch name + PR title
             └────┬─────┘
                  │
          ┌───────┼────────┐
          ▼       ▼        ▼
      ┌──────┐ ┌──────┐ ┌───────┐
      │ Lint │ │ Test │ │  fmt  │   ← run in parallel
      └──┬───┘ └──┬───┘ └──┬────┘
         │        │        │
         └────────┼────────┘
                  ▼
            ┌───────────┐
            │   Build   │  ← only if lint + test + fmt pass
            └─────┬─────┘
                  ▼
          ┌───────────────┐
          │ Docker Smoke  │  ← validates the Dockerfile works
          └───────────────┘
```

### Step-by-step breakdown

#### Job 0: PR Rules (only on pull requests)

```yaml
- name: Validate branch name and target
  run: make validate-branch
```

Runs a shell script that checks the branch name matches our convention
(`feat/`, `fix/`, `chore/`, `hotfix/`). This prevents random branch names
like `my-stuff` or `test123` from entering the codebase.

```yaml
- name: Validate PR title (Conventional Commits)
  uses: amannn/action-semantic-pull-request@v6
```

Since we use **squash merge**, the PR title becomes the commit message on `main`.
This action validates it follows `<type>(<scope>): <description>` format.
If it doesn't, the PR is blocked from merging.

#### Job 1: Lint

```yaml
- run: make lint
- run: make fmt-check
```

Runs ESLint and Prettier in check mode. If either fails, the PR is blocked.
This ensures every line of code on `main` follows the same style rules.

**Why block the merge?** Without this gate, style debates move to code review
(slow, subjective). With it, the machine handles style — reviewers focus on logic.

#### Job 2: Test

```yaml
- run: make test-ci
```

Runs Jest with `--ci` flag (deterministic, no interactive prompts) and
`--coverage` (generates a coverage report). If any test fails, the PR is blocked.

**Why block the merge?** A failing test on `main` means every developer who
pulls will have a broken test suite. The cost of one blocked PR is far lower
than the cost of a broken `main`.

#### Job 3: Build

```yaml
- run: make build
```

Runs the full production build. This catches issues that only appear with
optimizations enabled (tree-shaking removing needed code, AOT compilation
errors, budget violations).

This job depends on lint and test passing — no point building if the code
is broken.

#### Job 4: Docker Smoke

```yaml
- run: make docker-build
- run: docker run ... curl --fail http://localhost:4200
```

Builds the multi-stage Docker image and verifies the resulting container
actually serves the app. This catches Dockerfile misconfigurations (wrong
COPY paths, missing nginx.conf, etc.) before they reach production.

### Concurrency groups

```yaml
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

If you push twice to the same branch quickly, the first CI run is cancelled.
This saves GitHub Actions minutes and avoids confusion from stale results.

### Node.js caching

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: 'npm'
```

`actions/setup-node` automatically caches `~/.npm`. Combined with `npm ci`,
subsequent CI runs skip downloading packages from the registry — typically
saving 30-60 seconds per run.

---

## 4. Husky & Conventional Commits

### Why enforce conventions locally?

CI catches bad commits _after_ you push. Husky catches them _before_:

```
Without Husky:
  bad commit → push → CI fails (2 min) → fix → push → CI passes (2 min)
  Total: 4+ minutes of wasted CI time

With Husky:
  bad commit → hook rejects instantly (0.5 sec) → fix → commit → push → CI passes
  Total: 0 wasted CI time
```

The feedback loop drops from minutes to milliseconds.

### How Git hooks work

Git supports hooks — scripts that run at specific points in the Git workflow.
The relevant hook for us is `commit-msg`, which runs after you write your
commit message but before the commit is finalized.

```
git commit -m "fix stuff"
         │
         ▼
  .husky/commit-msg runs
         │
         ▼
  commitlint validates the message
         │
    ┌────┴────┐
    ▼         ▼
  PASS      FAIL
  commit    commit
  created   aborted
```

### Husky setup

Husky installs Git hooks via the `prepare` npm lifecycle script:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

After `npm install`, Husky configures Git to look for hooks in the `.husky/`
directory instead of `.git/hooks/`. This means hooks are **version-controlled**
and shared across the team — no manual setup needed.

### commitlint configuration

Our `commitlint.config.js` extends `@commitlint/config-conventional` and
restricts commit types to three:

| Type | Use for | Appears in changelog? |
|------|---------|----------------------|
| `feat` | New features | Yes |
| `fix` | Bug fixes | Yes |
| `chore` | Everything else (docs, deps, refactor, CI, tests) | No |

This matches the backend exactly. Both repos use the same three types,
so the changelog generation and SemVer bumping work consistently across
the entire Ductifact project.

### What gets validated

```
✅ feat: add login page
✅ fix(auth): handle expired tokens
✅ chore: update Angular to v20
✅ feat(ui)!: redesign navigation       ← breaking change

❌ fix stuff                             ← missing type
❌ Fixed the login bug                   ← not conventional format
❌ refactor: extract utils               ← "refactor" not in allowed types
❌ feat:add login                        ← missing space after colon
```

### Why only three types?

More types (like `refactor`, `docs`, `style`, `test`, `perf`, `ci`) create
decision fatigue: "Is updating a test file `test` or `chore`? Is renaming a
variable `refactor` or `style`?"

Three types eliminate this. If it's not a feature and not a bug fix, it's
`chore`. The changelog only shows `feat` and `fix` — which is what users
and stakeholders actually care about.
