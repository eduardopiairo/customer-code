# DevOps Learning Plan — customer-code

Companion to [k8s-learning-plan.md](k8s-learning-plan.md) (which owns
everything Kubernetes-specific). This plan covers the rest of the DevOps
lifecycle: source control practices, CI pipelines, testing, security, IaC,
deploy strategy, and observability — using `CICD.md`'s ✅/⬜ checklist as the
literal curriculum. Each ⬜ in that file is an exercise here; closing it means
flipping it to ✅ for real, not just in the doc.

Existing pipelines to read first: `.github/workflows/backend-cicd.yml`,
`.github/workflows/frontend-cicd.yml`, `.github/workflows/codeql.yml`,
`.github/dependabot.yml`.

## Stage 0 — Baseline
- [ ] Read both existing workflow files end to end; diagram the backend pipeline's stages (lint → test → security → build → push) and compare against `CICD-diagram.md`.
- [ ] Confirm what runs on PR vs on merge to `main` vs on tag.
- [ ] Trigger a workflow manually (`workflow_dispatch` or a throwaway PR) and watch it in the Actions tab end to end.

## Stage 1 — Source control practices
- [ ] Turn on required PR reviews on `main` (currently ⬜ in `CICD.md` for both services).
- [ ] Add a CODEOWNERS file and confirm it's enforced by branch protection.
- [ ] Practice conventional commits / a PR title convention if the repo doesn't already have one, and wire a commit-lint check into CI.

## Stage 2 — Code quality gates
- [ ] Frontend: add ESLint + Prettier check as a CI job (backend already has ruff — mirror the pattern).
- [ ] Add `ruff format --check` to the backend pipeline (lint exists, formatting check doesn't).
- [ ] Finish the Codacy integration mentioned as "configured, pending" in `CICD.md`.

## Stage 3 — Testing maturity
- [ ] Add integration tests for the backend that hit a real Postgres service container in CI (not mocked) — mirrors the `services:` pattern GitHub Actions supports.
- [ ] Stand up frontend unit tests (Vitest) and component tests (React Testing Library) — currently both ⬜.
- [ ] Add an E2E smoke test (Playwright/Cypress) that runs the full `docker compose up` stack and hits the UI.
- [ ] Enforce a coverage floor with `--cov-fail-under` so the pipeline fails under a threshold, not just reports a number.

## Stage 4 — Security as a CI gate
- [ ] Enable GitHub secret scanning + push protection (⬜ for both services currently).
- [ ] Add `npm audit` as a CI gate for the frontend (backend already has pip-audit).
- [ ] Add Trivy/Grype image scanning for the frontend image (backend already has Snyk/Trivy).
- [ ] Pick one finding from bandit/CodeQL/pip-audit's current output and actually fix it — don't just read green checkmarks.

## Stage 5 — Build & artifact hygiene
- [ ] Add multi-platform builds (amd64/arm64) via `docker buildx` for both images.
- [ ] Add image signing (cosign) and verify a signature before "deploy."
- [ ] Move off floating SHA-only tags toward semantic versioning on release, keeping SHA as a secondary tag.

## Stage 6 — Infrastructure as Code
- [ ] Pick one: Terraform or Pulumi. Provision the *cloud* equivalent of the local kind cluster (a managed K8s cluster — EKS/GKE/AKS free-tier, or a cheap alternative) from code, not the console.
- [ ] Store Terraform state remotely (S3+DynamoDB, or equivalent) instead of local state, and practice `plan`/`apply`/`destroy` discipline.
- [ ] Model the Postgres instance as IaC too (either in-cluster StatefulSet or a managed DB resource) so the whole environment is reproducible from git.

## Stage 7 — Deploy strategy (picks up where `CICD.md` Deploy rows are ⬜)
- [ ] Stand up a real staging environment and wire the pipeline to deploy to it automatically on merge to `main`.
- [ ] Add a manual/approval gate before production deploy.
- [ ] Implement a rollback strategy (this is where [k8s-learning-plan.md](k8s-learning-plan.md) Stage 6's `rollout undo` / GitOps rollback exercise plugs in).
- [ ] Add a post-deploy smoke test job that curls `/api/v1/health` (already implemented as an endpoint) and fails the pipeline if it doesn't return 200.

## Stage 8 — Observability & incident readiness
- [ ] Add structured (JSON) logging to both backend and frontend — currently ⬜ for both.
- [ ] Wire metrics (Prometheus or Datadog) for the backend — pairs with [k8s-learning-plan.md](k8s-learning-plan.md) Stage 5.
- [ ] Add basic alerting on a real signal (error rate, health-check failures) — not just a dashboard nobody watches.
- [ ] Write a one-page runbook: "the health check is failing, now what?" and actually rehearse it against a deliberately broken deploy.

## Stage 9 — Stretch goals
- [ ] Add Real User Monitoring (RUM) to the frontend.
- [ ] Practice a full incident: break something on purpose in a throwaway environment, use only your Stage 8 tooling to detect and diagnose it, then fix and write a postmortem.
- [ ] Cost-awareness pass: review what the cloud IaC from Stage 6 actually costs and right-size it.

---
Suggested pace: alternate with the K8s plan — a DevOps stage roughly every 1–2
weeks. Update `CICD.md`'s checkboxes as you close each gap so the doc stays
the source of truth for pipeline maturity.
