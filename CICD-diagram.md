# CI/CD Pipeline Diagrams

Visual representation of the current pipelines defined in
[`.github/workflows/backend-cicd.yml`](.github/workflows/backend-cicd.yml) and
[`.github/workflows/frontend-cicd.yml`](.github/workflows/frontend-cicd.yml).
See [CICD.md](CICD.md) for the full practice checklist.

Legend: solid boxes/arrows = active jobs; dashed boxes/arrows = commented out in the workflow file (not currently running).

---

## Backend pipeline

Triggers: `push` (`main`, `feature/*`, `fix/*`) or `pull_request` (`main`), scoped to `backend/**` changes.

```mermaid
flowchart TD
    T[["Trigger: push main/feature/*/fix/*\nor PR into main\n(paths: backend/**)"]] --> Lint
    T --> Test
    T --> Security

    Lint["Lint\nruff check backend/src"]
    Test["Test\npytest --cov=src\n→ upload coverage to Codacy"]
    Security["Security\nbandit + pip-audit"]

    Lint --> Gate{"push event AND\nref = main or feature/*?"}
    Test --> Gate
    Security --> Gate

    Gate -- yes --> Build["Build & Push\nbuild image, tag :sha7 + :latest\npush to Docker Hub"]
    Gate -- no --> Stop["Stop\n(PR-only run, no image built)"]

    Build --> Snyk["Snyk scan\n--severity-threshold=high"]
    Snyk --> Monitor["Snyk monitor\n(register project)"]
    Monitor --> Trivy["Trivy scan\nHIGH,CRITICAL\nexit-code=0 (non-blocking)"]

    Trivy -.-> Deploy["Deploy to Kubernetes\nkubectl set image + rollout status"]

    style Deploy stroke-dasharray: 5 5
    style Stop stroke-dasharray: 5 5
```

Notes:
- `build-and-push` runs on **both** `main` pushes and `feature/*` pushes — every feature branch gets an image built and scanned.
- Trivy is set to `exit-code: 0`, so it reports but never fails the build; Snyk's `--severity-threshold=high` can fail the job.
- `deploy` is fully commented out — scaffolded but inactive.

---

## Frontend pipeline

Triggers: `push` (`main`, `feature/*`, `fix/*`) or `pull_request` (`main`), scoped to `frontend/**` changes.

```mermaid
flowchart TD
    T[["Trigger: push main/feature/*/fix/*\nor PR into main\n(paths: frontend/**)"]] --> Lint
    T --> Test
    T --> Build

    Lint["Lint (ESLint)"]
    Test["Test\nVitest + coverage\n→ upload to Codacy"]
    Build["Build check\nnpm ci && npm run build"]

    Build --> Gate{"push event AND\nref = main?"}
    Gate -- yes --> Push["Build & Push\nbuild image, tag :sha7 + :latest\npush to Docker Hub"]
    Gate -- no --> Stop["Stop\n(PR or feature branch:\nbuild-check only)"]

    Push -.-> Deploy["Deploy to Kubernetes\nkubectl set image + rollout status"]

    style Lint stroke-dasharray: 5 5
    style Test stroke-dasharray: 5 5
    style Deploy stroke-dasharray: 5 5
    style Stop stroke-dasharray: 5 5
```

Notes:
- Lint and Test jobs are commented out entirely — only the `build` (compile check) job actually runs today.
- No security scanning (npm audit, Trivy/Grype) or Codacy integration is wired up yet, unlike the backend.
- `build-and-push` only triggers on `main` (not on `feature/*`, unlike the backend), so feature branches never get a pushed image.
- `deploy` is commented out — same as backend.

---

## Key asymmetries between the two pipelines

| Aspect | Backend | Frontend |
|---|---|---|
| Lint | ✅ active (ruff) | ⬜ disabled (ESLint commented out) |
| Unit tests + coverage | ✅ active (pytest + Codacy) | ⬜ disabled (Vitest commented out) |
| Security scanning pre-build | ✅ bandit + pip-audit | ⬜ none |
| Image scanning | ✅ Snyk + Trivy | ⬜ none |
| Builds images on feature branches | ✅ yes | ⬜ no (main only) |
| Deploy to k8s | ⬜ scaffolded, disabled | ⬜ scaffolded, disabled |
