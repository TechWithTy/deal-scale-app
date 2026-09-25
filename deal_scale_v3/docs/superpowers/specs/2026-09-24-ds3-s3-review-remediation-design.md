# DS3 Sprint 3 Review Remediation Design

Date: 2026-09-24
Scope: PRs #83, #84, and #85 in `TechWithTy/deal-scale-app`

## Intent

Bring the three Sprint 3 implementation branches into alignment with their
Notion acceptance criteria and the independent read-only reviews. Work remains
isolated to the existing feature worktrees. The foundation checkout and its
unrelated dirty changes are out of scope.

Completion means each branch has focused behavioral coverage, passes its
repository checks, and receives a clean scoped re-review. GitHub merge and
formal review remain separate gates; Notion tasks are not moved to Done by this
design.

## Shared constraints

- Preserve tenant isolation, source and opportunity traceability, and
  deterministic UUID-v4 identifiers.
- Keep detector and case-engine functions deterministic and side-effect free
  unless a repository adapter is explicitly introduced for persistence.
- Use the existing assurance schemas, object definitions, RBAC conventions,
  Vitest setup, and Twenty manifest structure.
- Add tests for every review-blocking behavior; do not weaken existing tests or
  broaden unrelated refactors.
- Stage and commit only files belonging to the relevant feature branch.

## PR #83: Intent-State Divergence

The interpretation evidence contract will carry the opportunity reference and
the state snapshot will expose field-level, source-versioned evidence. The
detector will compare only the same tenant and opportunity, distinguish
explicit false state from stale or conflicting events, and return
contradictory evidence references that resolve to actual records rather than
synthetic field labels. Candidate identity will use the normalized finding
scope and relevant evidence, not the entire unordered snapshot.

The calibration fixtures will contain distinct offer, callback, and appointment
language. Tests will cover cross-opportunity isolation, missing and conflicting
state evidence, deterministic identity under irrelevant input changes, and
the low-confidence path. If the existing architecture exposes a detector
registry or orchestration boundary, the detector will be registered there;
otherwise the branch will document the pure detector boundary without adding a
new runtime subsystem.

## PR #85: Process/SLA Breach

The detector input will be a versioned conformance result or a typed projection
of one, preserving policy version, trigger, expected action, deadline, actual
events, exception evaluation, and source provenance. Deadline comparison will
make the required meaning of `dueAt`, the configured SLA window, and `asOf`
explicit; future observations will be excluded. Completion selection will use
the valid in-scope event according to the conformance contract rather than
blindly choosing the latest event.

Finding identity and duplicate suppression will include tenant, source,
opportunity, policy/version, obligation, and evaluation scope. Tests will cover
policy and exception traceability, exact deadline behavior, multiple and future
events, foreign source/tenant events, duplicate evaluations, and identity
separation.

## PR #84: Assurance Case assembly

The Assurance Case schema/object contract and assembly result will preserve the
required seller/opportunity, failure type, expected versus actual behavior,
exact divergence, evidence references, actor/system, deadline, confidence,
urgency, recommended human action, and detector/policy versions. The state
machine will use the acceptance-criteria states: Needs Review, Confirmed
Failure, Expected Behavior, Insufficient Evidence, False Positive, Resolved,
and Outcome, with explicit transition authorization and audit records.

Assembly will validate candidate and opportunity ownership from the available
repository boundary rather than trusting duplicate caller-supplied workspace
strings. The deterministic case identity and persisted unique key will use the
same scoped components. Insufficient evidence will remain representable as a
case state, and the persistence boundary will be explicit: either use the
existing Twenty object contract or add the smallest typed repository adapter
needed for durable upsert and append-only audit history. Tests will cover
state transitions, unauthorized and foreign-opportunity inputs, duplicate
keys, empty evidence, audit history, and repeat assembly.

## Verification and handoff

For each branch, run the focused Vitest files first, then `yarn typecheck`,
`yarn lint`, and `git diff --check`. A read-only subagent re-review will assess
only the fix range against the original findings. No branch will be merged by
this workflow, and no Notion task will be marked Done until GitHub shows both a
formal review and a completed merge.
