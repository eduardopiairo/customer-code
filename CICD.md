# CI/CD Maturity

This document describes the current state and planned evolution of the CI/CD pipeline for this project, organised by stage.

---

## Pipeline overview

```
push / pull_request
       │
       ├── lint ──────────────────────────────────┐
       │                                          ├── build & push ── deploy
       ├── test ─────── coverage report           │
       │                                          │
       └── security ─────────────────────────────┘
```

---

## Stages

### 1. Source control

| Practice | Status |
|---|---|
| Feature branches (`feature/*`, `fix/*`) | ✅ Implemented |
| Pull requests targeting `main` | ✅ Implemented |
| Branch protection on `main` | ⬜ Not configured |
| Required PR reviews | ⬜ Not configured |

---

### 2. Code quality

| Practice | Tool | Status |
|---|---|---|
| Linting | ruff | ✅ Implemented |
| Formatting check | ruff format | ⬜ Not implemented |
| Code quality dashboard | Codacy | ⬜ Configured, pending integration |

---

### 3. Test

| Practice | Tool | Status |
|---|---|---|
| Unit tests | pytest | ✅ Implemented |
| Code coverage report | pytest-cov | ✅ Implemented |
| Coverage upload | Codacy | ✅ Implemented |
| Integration tests (real DB) | pytest + Postgres service | ⬜ Not implemented |
| End-to-end tests | — | ⬜ Not implemented |
| Coverage threshold enforcement | pytest-cov `--cov-fail-under` | ⬜ Not implemented |

---

### 4. Security

| Practice | Tool | Status |
|---|---|---|
| SAST — source code scanning | bandit | ✅ Implemented |
| SCA — dependency CVE scanning | pip-audit | ✅ Implemented |
| Automated dependency updates | Dependabot | ✅ Configured |
| Container image scanning | Trivy / Grype | ⬜ Not implemented |
| Secret scanning | GitHub secret scanning | ⬜ Not configured |

---

### 5. Build & artifact

| Practice | Status |
|---|---|
| Docker image build | ✅ Implemented |
| Push to Docker Hub with SHA tag | ✅ Implemented |
| Multi-platform build (amd64/arm64) | ⬜ Not implemented |
| Image signing | ⬜ Not implemented |

---

### 6. Deploy

| Practice | Status |
|---|---|
| Kubernetes deployment | ⬜ Scaffolded, not active |
| Staging environment | ⬜ Not implemented |
| Production environment | ⬜ Not implemented |
| Rollback strategy | ⬜ Not implemented |
| Smoke test after deploy | ⬜ Not implemented |

---

### 7. Observability

| Practice | Status |
|---|---|
| Health check endpoint (`/api/v1/health`) | ✅ Implemented |
| Structured logging | ⬜ Not implemented |
| Metrics (Prometheus / Datadog) | ⬜ Not implemented |
| Alerting | ⬜ Not implemented |

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | Implemented and active |
| ⬜ | Not yet implemented |
