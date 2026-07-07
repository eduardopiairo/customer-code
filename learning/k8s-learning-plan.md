# Kubernetes Learning Plan — customer-code

Uses this repo's own stack (Flask API + Postgres + Vite/nginx frontend) as the
hands-on lab. Existing manifests (`customer-code-api-deployment.yaml`,
`-service.yaml`, `-ingress.yaml`, `kind-cluster.yaml`) cover Stage 1 for the
API only — everything else is a gap to fill as an exercise.

Local cluster: `kind create cluster --config kubernetes/kind-cluster.yaml`
(nginx ingress controller required — install via the standard kind manifest).

Check items off as you complete them (`- [x]`).

## Stage 0 — Baseline (review what exists)
- [ ] Read the existing 4 manifests and diagram them by hand (which object points to which).
- [ ] `kubectl explain deployment.spec.template.spec.containers.resources` — understand requests vs limits already set on the API deployment.
- [ ] Stand up the existing manifests in kind: `kubectl apply -f kubernetes/` and hit the API through the ingress.

## Stage 1 — Complete the app on K8s
- [ ] Write `customer-code-frontend-deployment.yaml` + `-service.yaml` for the nginx-served frontend image.
- [ ] Write a `postgres` Deployment or StatefulSet + PVC (`db-pvc.yaml`) — decide which and be able to explain why (StatefulSet gives stable identity/storage per pod).
- [ ] Add a second ingress path (`/api`) so both frontend and backend are reachable through one host.
- [ ] Move DB credentials out of plain env vars into a `Secret`; move non-secret config (DATABASE_URL host/port) into a `ConfigMap`.

## Stage 2 — Make it production-shaped
- [ ] Add liveness/readiness probes to the API deployment (add a `/healthz` route to the Flask app if one doesn't exist).
- [ ] Add a `Namespace` (e.g. `customer-code`) and scope all manifests to it.
- [ ] Add resource requests/limits to frontend and db (API already has them — match the pattern).
- [ ] Add a `HorizontalPodAutoscaler` for the API on CPU, and load-test it (`hey` or `k6`) to watch it scale.
- [ ] Add a `PodDisruptionBudget` for the API deployment.

## Stage 3 — Packaging & repeatability
- [ ] Convert the flat manifest directory into **Kustomize** overlays: `base/` + `overlays/dev` and `overlays/prod` (differ by replica count, image tag, resource limits).
- [ ] Or, as an alternative exercise, package the same app as a **Helm chart** — compare the two approaches and decide which fits this repo.
- [ ] Pin image tags (no `:latest`); template the tag via Kustomize image transformer or Helm values.

## Stage 4 — Networking & security
- [ ] Add a `NetworkPolicy` so only the frontend can reach the API, and only the API can reach the db (default-deny + explicit allows).
- [ ] Review the `securityContext` already on the API pod (`allowPrivilegeEscalation: false`) — add `runAsNonRoot`, `readOnlyRootFilesystem`, drop all capabilities. Do the same for frontend/db.
- [ ] Set up RBAC: a `ServiceAccount` per component with least-privilege `Role`/`RoleBinding` (even if the app doesn't call the K8s API yet, practice the objects).
- [ ] Look at `.codacy/` in this repo — run its checks (or `kubesec`/`kube-score`) against your manifests.

## Stage 5 — Observability
- [ ] Deploy `kube-prometheus-stack` (via Helm) into the kind cluster.
- [ ] Instrument the Flask app with basic Prometheus metrics (request count/latency) or use an nginx exporter for the frontend as a lower-effort start.
- [ ] Build one Grafana dashboard for the API (request rate, error rate, pod restarts).
- [ ] Wire `kubectl logs` / `stern` into a habit; optionally add a lightweight log pipeline (Loki) if you want to go further.

## Stage 6 — CI/CD integration (ties back to `CICD.md` / `CICD-diagram.md`)
- [ ] Read this repo's existing CI/CD pipeline docs and identify where a K8s deploy step would slot in.
- [ ] Add a pipeline stage that builds the image, pushes it, and updates the manifest/Helm values with the new tag (image update, not `latest`).
- [ ] Try GitOps: point **Argo CD** or **Flux** at the `kubernetes/` (or Helm chart) directory in this repo and let it reconcile the kind cluster automatically on push.
- [ ] Practice a rollback: `kubectl rollout undo deployment/customer-code-api`, then do the equivalent via the GitOps tool.

## Stage 7 — Stretch goals
- [ ] Multi-node scenario: rebuild the kind cluster with 2+ worker nodes, add pod anti-affinity so API replicas spread across nodes.
- [ ] Practice a stateful failure: kill the Postgres pod/PVC scenario and recover from a backup (`pg_dump`/`pg_restore` via a `CronJob` `Job`).
- [ ] Cost/perf: right-size resource requests using `kubectl top` data after a load test, rather than guessing.
- [ ] Chaos exercise: use `kubectl delete pod` mid-load-test to confirm zero-downtime behavior from replicas + readiness probes + PDB.

---
Suggested pace: 1 stage every 1–2 weeks, working directly against this repo's `kubernetes/` directory. Commit each stage's manifests so progress is visible in git history.
