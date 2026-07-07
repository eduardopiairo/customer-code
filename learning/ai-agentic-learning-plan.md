# AI / Agentic Code Generation Learning Plan — customer-code

Third companion to [k8s-learning-plan.md](k8s-learning-plan.md) and
[devops-learning-plan.md](devops-learning-plan.md). Where those two are about
the infra/pipeline, this one is about the *tooling you're using right now* —
Claude Code and agentic coding in general — practiced against this same
Flask + Postgres + React repo so every exercise produces a real, reviewable
diff instead of a toy example.

Repo hooks already in place worth knowing: `.claude/settings.local.json`,
`.github/instructions/codacy.instructions.md` (auto-runs Codacy analysis after
AI edits).

## Stage 0 — Baseline: how agentic coding actually works
- [ ] Read through this session's transcript and identify every tool call category used (Read, Edit, Bash, Agent, Skill, ToolSearch) — understand what each is for before using it deliberately.
- [ ] Read `.claude/settings.local.json` and `.github/instructions/codacy.instructions.md` — understand what's automated vs manual in this repo already.
- [ ] Do one small task (e.g. fix a lint warning) manually, then redo an equivalent one letting the agent do it — compare the diffs and your review process for each.

## Stage 1 — Context engineering
- [ ] Write a `CLAUDE.md` for this repo (there isn't one yet) covering: stack, how to run tests, conventions (ruff, ESLint), and pointers to `CICD.md`/the learning plans.
- [ ] Practice writing task prompts at three altitudes — vague ("clean up the API"), specific ("add input validation to the pharmacy create endpoint"), and over-specified (line-by-line instructions) — and compare output quality/review effort for each.
- [ ] Learn the difference between what belongs in CLAUDE.md (durable, repo-wide) vs. a one-off prompt (task-specific) vs. memory (cross-session, user-specific).

## Stage 2 — Reviewing AI-generated code critically
- [ ] Have the agent implement one backend feature (e.g. a new endpoint) and one frontend feature end to end; review both diffs as if a human colleague wrote them — check error handling, security (SQL injection, XSS), and test coverage.
- [ ] Deliberately ask for something ambiguous and observe where the agent guesses vs. asks — calibrate when you need to add detail up front vs. let it ask.
- [ ] Run `/code-review` on an agent-authored diff before merging and compare its findings to your own manual review.

## Stage 3 — Multi-step and multi-agent workflows
- [ ] Use the `Plan` mode/agent for a nontrivial change (e.g. Stage 3 of the K8s plan — Kustomize overlays) and evaluate the plan before letting it execute.
- [ ] Delegate an open-ended research question (e.g. "what's left before this branch can ship") to a subagent and evaluate whether the report was accurate — verify at least one claim yourself.
- [ ] Try running two independent subagent tasks in parallel (e.g. backend test-writing + frontend lint fixes) and observe how context isolation works between them.

## Stage 4 — Tool use and extensibility
- [ ] Read how an MCP server is wired into this environment (Codacy's, or the Gmail/Notion/Drive ones visible in this session) and understand the boundary between "tool the agent can call" and "action the agent decides to take."
- [ ] Write one custom skill or slash command for a task specific to this repo (e.g. "run the full docker-compose stack and smoke-test the health endpoint") and use it.
- [ ] Configure a hook (via the `update-config` skill) that runs a check automatically after edits — e.g. auto-run `ruff` after backend file edits — and compare to Codacy's existing auto-analyze hook.

## Stage 5 — Agentic coding in CI/CD
- [ ] Decide where in `.github/workflows/*.yml` an AI-assisted step could add value without removing a human gate (e.g. AI-drafted PR description, AI-assisted code review comment, not auto-merge).
- [ ] Read up on CodeQL's role vs. an LLM code reviewer's role in this pipeline — they catch different classes of bugs; understand which is which.
- [ ] Try the `/code-review ultra` or a GitHub PR review flow on a real PR in this repo and evaluate the signal-to-noise of its findings.

## Stage 6 — Safety, security, and trust boundaries
- [ ] Review this session's own system prompt sections on destructive actions and blast radius — articulate in your own words why force-push/rm -rf require confirmation but file edits don't.
- [ ] Deliberately test a prompt-injection scenario (e.g. a fetched web page or file containing embedded instructions) in a safe sandbox and confirm the agent flags rather than obeys it.
- [ ] Write your own team guidelines for when agentic code generation requires human review vs. can run autonomously (tie back to the risk framing in Stage 6 of `devops-learning-plan.md` — deploy approval gates apply to AI-initiated deploys too).

## Stage 7 — Stretch goals
- [ ] Have an agent apply a full learning-plan stage from `k8s-learning-plan.md` or `devops-learning-plan.md` autonomously (isolated worktree), then review the whole diff as a single PR.
- [ ] Compare agentic output across effort levels (fast/default/thorough) on the same task and evaluate the cost/quality tradeoff.
- [ ] Build a small eval: a fixed set of 5 tasks against this repo, graded rubric, re-run periodically to track how agentic tooling changes over time.

---
Suggested pace: run alongside the other two plans — pick one AI-workflow
exercise per week and apply it to whatever K8s/DevOps task you're already
doing, rather than treating this as a separate track.
