# CI/CD Maturity

This document describes the current state and planned evolution of the CI/CD pipeline, organised by service and stage.

---

## Backend

Flask REST API — Python 3.12, PostgreSQL, Docker.

### Pipeline overview

```
push / pull_request
       │
       ├── lint ──────────────────────────────────┐
       │                                          ├── build & push ── deploy
       ├── test ─────── coverage report           │
       │                                          │
       └── security ─────────────────────────────┘
```

### 1. Source control

| Practice | Status |
|---|---|
| Feature branches (`feature/*`, `fix/*`) | ✅ Implemented |
| Pull requests targeting `main` | ✅ Implemented |
| Branch protection on `main` | ✅ Configured |
| Required PR reviews | ⬜ Not configured |

### 2. Code quality

| Practice | Tool | Status |
|---|---|---|
| Linting | ruff | ✅ Implemented |
| Formatting check | ruff format | ⬜ Not implemented |
| Code quality dashboard | Codacy | ⬜ Configured, pending integration |

### 3. Test

| Practice | Tool | Status |
|---|---|---|
| Unit tests | pytest | ✅ Implemented |
| Code coverage report | pytest-cov | ✅ Implemented |
| Coverage upload | Codacy | ✅ Implemented |
| Integration tests (real DB) | pytest + Postgres service | ⬜ Not implemented |
| End-to-end tests | — | ⬜ Not implemented |
| Coverage threshold enforcement | pytest-cov `--cov-fail-under` | ⬜ Not implemented |

### 4. Security

| Practice | Tool | Status |
|---|---|---|
| SAST — source code scanning | bandit | ✅ Implemented |
| SCA — dependency CVE scanning | pip-audit | ✅ Implemented |
| Automated dependency updates | Dependabot | ✅ Configured |
| Container image scanning | Trivy / Grype | ⬜ Not implemented |
| Secret scanning | GitHub secret scanning | ⬜ Not configured |

### 5. Build & artifact

| Practice | Status |
|---|---|
| Docker image build | ✅ Implemented |
| Push to Docker Hub with SHA tag | ✅ Implemented |
| Multi-platform build (amd64/arm64) | ⬜ Not implemented |
| Image signing | ⬜ Not implemented |

### 6. Deploy

| Practice | Status |
|---|---|
| Kubernetes deployment | ⬜ Scaffolded, not active |
| Staging environment | ⬜ Not implemented |
| Production environment | ⬜ Not implemented |
| Rollback strategy | ⬜ Not implemented |
| Smoke test after deploy | ⬜ Not implemented |

### 7. Observability

| Practice | Status |
|---|---|
| Health check endpoint (`/api/v1/health`) | ✅ Implemented |
| Structured logging | ⬜ Not implemented |
| Metrics (Prometheus / Datadog) | ⬜ Not implemented |
| Alerting | ⬜ Not implemented |

---

## Frontend

React 18 + Vite, served via Nginx, Docker.

### Pipeline overview

```
push / pull_request
       │
       └── build check ── build & push ── deploy
```

### 1. Source control

| Practice | Status |
|---|---|
| Feature branches (`feature/*`, `fix/*`) | ✅ Implemented |
| Pull requests targeting `main` | ✅ Implemented |
| Branch protection on `main` | ✅ Configured |
| Required PR reviews | ⬜ Not configured |

### 2. Code quality

| Practice | Tool | Status |
|---|---|---|
| Linting | ESLint | ⬜ Not implemented |
| Formatting check | Prettier | ⬜ Not implemented |
| Code quality dashboard | Codacy | ⬜ Not configured |

### 3. Test

| Practice | Tool | Status |
|---|---|---|
| Unit tests | Vitest | ⬜ Not implemented |
| Component tests | React Testing Library | ⬜ Not implemented |
| End-to-end tests | Playwright / Cypress | ⬜ Not implemented |
| Code coverage | Vitest coverage | ⬜ Not implemented |

### 4. Security

| Practice | Tool | Status |
|---|---|---|
| SCA — dependency CVE scanning | npm audit | ⬜ Not implemented |
| Automated dependency updates | Dependabot | ✅ Configured |
| Container image scanning | Trivy / Grype | ⬜ Not implemented |
| Secret scanning | GitHub secret scanning | ⬜ Not configured |

### 5. Build & artifact

| Practice | Status |
|---|---|
| Docker image build | ✅ Implemented |
| Push to Docker Hub with SHA tag | ✅ Implemented |
| Multi-platform build (amd64/arm64) | ⬜ Not implemented |

### 6. Deploy

| Practice | Status |
|---|---|
| Kubernetes deployment | ⬜ Not implemented |
| Staging environment | ⬜ Not implemented |
| Production environment | ⬜ Not implemented |
| Rollback strategy | ⬜ Not implemented |

### 7. Observability

| Practice | Status |
|---|---|
| Structured logging | ⬜ Not implemented |
| Real User Monitoring (RUM) | ⬜ Not implemented |
| Alerting | ⬜ Not implemented |

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Implemented and active |
| ⬜ | Not yet implemented |
