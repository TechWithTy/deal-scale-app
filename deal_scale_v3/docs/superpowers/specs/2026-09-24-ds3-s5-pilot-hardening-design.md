# DS3 Sprint 5 Pilot Hardening and Calibration Design

## Purpose

Prepare Deal Scale for a read-only pilot by making trust boundaries explicit,
making evidence absence visible, and producing reproducible calibration
evidence before launch. S5-02 and S5-03 are existing in-progress foundations;
S5-04 and S5-05 are the new implementation scope.

## Current-state findings

- S5-02 commit `a9cf07cf` provides a deterministic in-memory shadow runner, but
  it has no live caller, persistent atomic case upsert, multi-opportunity
  isolation, or bounded changed-evidence contract.
- S5-03 commit `9339d51a` provides scorecard and warning primitives, but they
  are not connected to detector execution, stored cases, or the UI surface.
  Transcript readiness, future timestamps, empty detector configuration, and
  degraded certainty require explicit regression coverage.
- The current checkout contains unrelated uncommitted foundation and
  promise-ledger changes. Task work must stay in isolated worktrees.

## S5-04 scope: pilot hardening

Create a focused `src/pilot-hardening/` module with pure contracts and
dependency-injected sinks rather than new infrastructure.

1. `security.ts` defines tenant-isolation and source-credential lifecycle
   checks for connected, revoked, and disconnected sources. It must never
   return or log credential values.
2. `retention.ts` defines an explicit retention policy and a deletion plan that
   propagates from a source connection to derived evidence, detector findings,
   cases, and telemetry references. Deletion is represented as an idempotent
   plan/command contract; it does not invent a datastore.
3. `observability.ts` defines structured metric events with trace IDs, safe
   dimensions, and injectable log/trace sinks. The event catalog covers sync
   lag, normalization failures, identity ambiguity, detector latency/errors,
   extraction correction rate, evidence completeness, and case-review latency.
4. `trust-metrics.ts` computes deterministic aggregates from those events and
   defines PostHog-compatible activation/review funnel events. OpenTelemetry
   integration is interface-based and limited to Deal Scale-owned operations.
5. `docs/pilot-hardening.md` documents the security checklist, retention
   defaults, incident/debug path, and metric ownership without secrets.

Required tests cover tenant leakage, credential redaction, revoke/disconnect,
idempotent deletion propagation, malformed telemetry, trace preservation, and
the activation/review funnel.

## S5-05 scope: pilot calibration

Create a focused `src/pilot-calibration/` module and `tests/pilot-calibration/`
fixtures that consume serializable audit/shadow outputs through explicit
adapters.

1. Define labeled evaluation records with valid labels for true positive,
   false positive, insufficient evidence, and native-system-obvious outcomes.
2. Compute precision, false-positive rate, insufficient-evidence rate, and
   native-system-obvious rate with deterministic denominators and explicit
   zero-sample behavior.
3. Define golden scenarios spanning a detected failure, a clean case, missing
   evidence, and a native-system-obvious finding. Each scenario must preserve
   evidence references and tenant identity.
4. Define falsification gates with named thresholds and a result of
   `proceed`, `iterate`, or `pivot`; gate failures must identify the measured
   metric and observed value.
5. Produce a serializable calibration report and launch checklist. No code or
   report may claim recovered revenue or attribution without supported outcome
   evidence.

Required tests cover deterministic ordering, empty and single-label datasets,
tenant mixing, missing evidence, threshold boundaries, and a full golden-pack
run.

## Integration contract

S5-04 and S5-05 must not import unfinished branch-only implementation files.
They expose small serializable contracts so the orchestration branch can later
adapt S5-02 shadow cases and S5-03 readiness scorecards without changing the
metric or calibration logic. S5-03 readiness status is an input to calibration
and must downgrade certainty when required evidence is unavailable.

## Non-goals

- No seller communication, CRM mutation, autonomous recovery, or new CRM shell.
- No second datastore, auth system, workflow engine, or observability vendor.
- No invented production volumes, revenue impact, or customer outcomes.
- No broad refactor of the existing assurance schema or unrelated dirty files.

## Verification and delivery

Each task runs its focused Vitest tests first, then the repository unit suite,
typecheck, lint, and `git diff --check`. The master orchestrator reviews both
branches, integrates only task-scoped commits, and records any environment
blockers separately from source correctness.
