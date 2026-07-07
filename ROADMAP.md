# Roadmap

Two tracks: the pipeline/infra work (Part 1) and the product itself (Part 2).
Both are phased by dependency and effort/value — each phase assumes the previous
one in its own track is done. The two tracks are independent of each other and can
run in parallel.

---

# Part 1 — CI/CD Roadmap

Prioritised plan for closing the gaps tracked in [CICD.md](CICD.md), incorporating the
ideas captured in [thoughts.md](thoughts.md) (Harbor as a self-hosted registry,
mocked-unit vs. real-DB integration tests). Phases are ordered by dependency and
effort/value — each phase assumes the previous one is done.

---

## Phase 1 — Re-enable and harden what's already scaffolded

Lowest effort, highest immediate value: turn on commented-out jobs and close easy gaps.

| Item | Service | Notes |
|---|---|---|
| Re-enable ESLint job | Frontend | Already written in `frontend-cicd.yml`, just commented out |
| Re-enable Vitest job + coverage upload | Frontend | Already written, just commented out |
| Prettier formatting check | Frontend | Pair with ESLint re-enable |
| `ruff format --check` | Backend | Add alongside existing `ruff check` |
| `npm audit` (SCA) | Frontend | Frontend has zero dependency-vulnerability scanning today |
| Coverage threshold enforcement (`--cov-fail-under`) | Backend | Turns Codacy upload into an actual quality gate |
| Codacy dashboard integration | Backend + Frontend | Coverage upload exists for backend; dashboard wiring is pending per CICD.md |
| Secret scanning (GitHub secret scanning / gitleaks) | Backend + Frontend | Not configured on either service |
| Required PR reviews on `main` | Backend + Frontend | Branch-protection setting, no code change needed |

---

## Phase 2 — Test depth

Builds real confidence beyond lint/build checks; needed before loosening manual QA.

| Item | Service | Notes |
|---|---|---|
| Integration tests against real Postgres | Backend | Per thoughts.md: only add the Postgres service back for this — not needed for mocked unit tests |
| Component tests (React Testing Library) | Frontend | |
| Coverage threshold enforcement | Frontend | Mirrors backend once Vitest coverage lands (Phase 1) |
| E2E tests (Playwright/Cypress vs. pytest+requests) | Backend + Frontend | Cross-service — can share one workflow that spins up both containers |

---

## Phase 3 — Artifact hardening

Everything about the built image itself, before pushing to production-facing environments.

| Item | Service | Notes |
|---|---|---|
| Frontend image scanning (Trivy or Grype) | Frontend | Backend already has Snyk + Trivy; frontend has none |
| Multi-platform builds (amd64/arm64) | Backend + Frontend | `docker/build-push-action` supports this with `platforms:` — low effort |
| Image signing (cosign) | Backend + Frontend | |
| Evaluate Harbor as self-hosted registry | Backend + Frontend | From thoughts.md — replaces Docker Hub; also gives built-in vulnerability scanning and RBAC, which could subsume some of the Snyk/Trivy scope above. Worth deciding *before* investing further in Docker Hub-specific tagging/signing conventions |

---

## Phase 4 — Continuous Delivery

Currently both `deploy` jobs are fully commented out — this is the biggest structural gap.

| Item | Service | Notes |
|---|---|---|
| Activate Kubernetes deploy job | Backend + Frontend | Code already scaffolded (commented) in both workflows |
| Staging environment | Backend + Frontend | Land before production |
| Smoke test after deploy | Backend | Health endpoint (`/api/v1/health`) already exists — easy to wire into a post-deploy check |
| Production environment | Backend + Frontend | Requires staging to be stable first |
| Rollback strategy | Backend + Frontend | `kubectl rollout undo` or Argo Rollouts, decide based on how deploy is activated |

---

## Phase 5 — Observability

Only useful once something is actually deployed continuously (Phase 4).

| Item | Service | Notes |
|---|---|---|
| Structured logging | Backend + Frontend | |
| Metrics (Prometheus/Datadog) | Backend | |
| Real User Monitoring (RUM) | Frontend | |
| Alerting | Backend + Frontend | Depends on metrics/logging being in place first |

---

## Sequencing rationale

- **Phase 1 before Phase 2**: no point writing deeper tests until the existing lint/test jobs are actually turned on and gating merges.
- **Phase 3 before Phase 4**: don't build a delivery pipeline around Docker Hub if Harbor is going to replace it — the registry decision affects image tags, pull secrets, and signing setup used by the deploy job.
- **Phase 5 last**: alerting and RUM are noise without a live, continuously-deployed target to observe.

---

# Part 2 — Application Feature Roadmap

Based on the current state of the app: a Flask + Postgres API with two entities —
`Store` ([backend/src/models/store.py](backend/src/models/store.py)) and
`StoreManager` ([backend/src/models/store_manager.py](backend/src/models/store_manager.py)) —
each with full CRUD ([backend/src/routes/stores.py](backend/src/routes/stores.py),
[backend/src/routes/store_managers.py](backend/src/routes/store_managers.py)), and a
React frontend with matching Stores/Managers pages. There is no authentication, no
pagination, and — notably — no `Customer` entity at all, despite the README describing
this as a "Customer relations management API for pharmacy stores."

## Phase A — Close the core domain gap

The README's premise (CRM for pharmacy stores) isn't backed by a domain model yet —
today's app only manages stores and their managers, not the customers themselves.

| Feature | Notes |
|---|---|
| `Customer` model (name, contact info, store association) | Mirrors the existing `Store`/`StoreManager` pattern in `backend/src/models/` |
| Customer CRUD API (`/api/v1/customers`) | Same shape as `stores.py` / `store_managers.py` |
| Customer CRUD frontend page | Same shape as `Stores.jsx` / `StoreManagers.jsx`, added to `App.jsx` nav |
| Link customers to stores | e.g. "customers served by store X" — the actual CRM relationship |

## Phase B — Authentication & authorization

There is currently no login and no concept of roles — anyone with API access has
full read/write on everything.

| Feature | Notes |
|---|---|
| Login / session or JWT auth | Blocks every other access-control feature below |
| Roles (e.g. admin vs. store manager) | A store manager should plausibly only manage their own store's customers |
| Protect write endpoints (POST/PUT/DELETE) | Currently open with no auth checks in any route |

## Phase C — CRM depth

Once customers exist (Phase A), the features that make it a usable CRM rather than
a plain CRUD app.

| Feature | Notes |
|---|---|
| Search / filter on lists | `list_stores`/`list_store_managers`/customers currently return the full table with no query params |
| Pagination | Same routes call `.all()` with no `limit`/`offset` — will not scale |
| Interaction/notes log per customer | Core CRM feature — history of contact with a customer |
| Stronger field validation (email format, phone format) | Current validation only checks non-empty strings, not format |

## Phase D — Reporting & export

| Feature | Notes |
|---|---|
| Dashboard (customers per store, manager workload) | |
| CSV/Excel export of customers or stores | Common pharmacy-ops requirement |
| OpenAPI/Swagger docs for the API | None exist today; useful once the API surface grows past 2 resources |

## Sequencing rationale

- **Phase A first**: every later phase (auth scoping, CRM depth, reporting) assumes a `Customer` entity exists — right now there's nothing to scope, search, or report on.
- **Phase B before Phase C**: search/filter and notes-per-customer only matter once you know *who* is allowed to see them.
- **Phase D last**: reporting/export needs real data volume and structure to be worth building against.
