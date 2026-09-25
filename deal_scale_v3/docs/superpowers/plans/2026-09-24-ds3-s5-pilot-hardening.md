# DS3 Sprint 5 Pilot Hardening and Calibration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auditable pilot-hardening controls and deterministic calibration gates for Deal Scale while preserving read-only behavior and tenant-safe evidence handling.

**Architecture:** S5-04 and S5-05 are independent, pure TypeScript modules with serializable contracts and injected sinks. S5-04 owns security, retention, observability, and trust-metric primitives; S5-05 owns labeled evaluation records, golden scenarios, calibration metrics, and falsification decisions. The master orchestrator integrates only task-scoped commits and does not merge the incomplete S5-02/S5-03 branches automatically.

**Tech Stack:** TypeScript, Vitest, Yarn, Twenty app contracts, PostHog-compatible event shapes, OpenTelemetry-compatible trace interfaces.

**Spec:** `docs/superpowers/specs/2026-09-24-ds3-s5-pilot-hardening-design.md`

## Global Constraints

- No seller communication, CRM mutation, autonomous recovery, or new CRM shell.
- No second datastore, auth system, workflow engine, or observability vendor.
- No credential values, secrets, or unsupported revenue/outcome claims in return values, logs, fixtures, or reports.
- Every contract must carry `workspaceId`/tenant identity where data crosses a trust boundary.
- S5-04 and S5-05 must not import unfinished branch-only S5-02 or S5-03 files.
- Keep application source files under 250 lines where practical and use focused modules.
- Use valid UUID v4 values in fixtures and deterministic IDs only when the resulting bytes are version 4 and variant-compliant.

## Review Focus

- A credential-shaped value must never appear in a security result or structured event; covered by `credential_values_are_redacted` in Task 1.
- A deletion plan must never cross workspace boundaries and must be idempotent; covered by `retention_plan_is_tenant_scoped_and_repeatable` in Task 1.
- Malformed/future timestamps must not create plausible trust metrics; covered by `observability_rejects_invalid_timestamps` in Task 1.
- Empty and single-label calibration sets must expose denominator behavior instead of silently passing; covered by `calibration_metrics_define_zero_sample_behavior` in Task 2.
- Insufficient evidence and tenant mixing must produce a falsification signal, not a positive trust result; covered by `golden_pack_surfaces_missing_evidence_and_tenant_mixing` in Task 2.

---

### Task 1: DS3-S5-04 pilot hardening contracts and trust metrics

**Status:** complete in integration commit `c9fc37f1`, with retention hardening in `c6278e28`.

**Files:**
- Create: `src/pilot-hardening/security.ts`
- Create: `src/pilot-hardening/retention.ts`
- Create: `src/pilot-hardening/observability.ts`
- Create: `src/pilot-hardening/trust-metrics.ts`
- Create: `src/pilot-hardening/index.ts`
- Create: `docs/pilot-hardening.md`
- Test: `tests/pilot-hardening.test.ts`

**Interfaces:**
- Consumes only primitive serializable source, case, evidence, and metric inputs; it does not consume S5-02/S5-03 branch files.
- Produces `runSecurityChecklist`, `buildRetentionDeletionPlan`, `emitPilotMetric`, `summarizeTrustMetrics`, and `createFunnelEvent` for later adapters and reports.

- [ ] **Step 1: Write the failing security and retention tests**

```ts
it("credential_values_are_redacted", () => {
  const result = runSecurityChecklist({
    workspaceId: "00000000-0000-4000-8000-000000000001",
    sourceConnectionId: "source-1",
    sourceWorkspaceId: "00000000-0000-4000-8000-000000000001",
    connectionStatus: "revoked",
    credentialMetadata: { provider: "crm", accessToken: "secret-token" },
  });

  expect(JSON.stringify(result)).not.toContain("secret-token");
  expect(result.findings.map(({ code }) => code)).toContain("credential_redacted");
});

it("retention_plan_is_tenant_scoped_and_repeatable", () => {
  const input = {
    workspaceId: "00000000-0000-4000-8000-000000000001",
    sourceConnectionId: "source-1",
    requestedAt: "2026-09-24T12:00:00.000Z",
  } as const;

  const first = buildRetentionDeletionPlan(input);
  const second = buildRetentionDeletionPlan(input);

  expect(second).toEqual(first);
  expect(first.targets.map(({ resource }) => resource)).toEqual([
    "sourceConnection", "evidenceReference", "detectorCandidate",
    "assuranceCase", "event", "telemetry",
  ]);
  expect(first.targets.every(({ workspaceId }) => workspaceId === input.workspaceId)).toBe(true);
});
```

- [ ] **Step 2: Run the focused tests to verify the expected missing-module failure**

Run: `yarn vitest run tests/pilot-hardening.test.ts`

Expected: FAIL because `src/pilot-hardening/security.ts` and
`src/pilot-hardening/retention.ts` do not exist yet.

- [ ] **Step 3: Implement security and retention contracts**

Implement these exact shapes:

```ts
export type SecurityChecklistInput = {
  workspaceId: string;
  sourceConnectionId: string;
  sourceWorkspaceId: string;
  connectionStatus: "connected" | "disconnected" | "revoked";
  credentialMetadata: { provider: string; accessToken?: string; refreshToken?: string };
};

export type SecurityChecklistResult = {
  workspaceId: string;
  sourceConnectionId: string;
  passed: boolean;
  findings: readonly { code: string; severity: "info" | "warning" | "error" }[];
};

export function runSecurityChecklist(input: SecurityChecklistInput): SecurityChecklistResult;

export type RetentionDeletionPlan = {
  planId: string;
  idempotencyKey: string;
  workspaceId: string;
  sourceConnectionId: string;
  requestedAt: string;
  targets: readonly {
    resource: "sourceConnection" | "evidenceReference" | "detectorCandidate" | "assuranceCase" | "event" | "telemetry";
    workspaceId: string;
    sourceConnectionId: string;
  }[];
};

export function buildRetentionDeletionPlan(input: {
  workspaceId: string;
  sourceConnectionId: string;
  requestedAt: string;
}): RetentionDeletionPlan;
```

Reject mismatched workspace identities, scrub credential values from all
outputs, and generate a stable UUID v4 `planId` from the validated input.

- [ ] **Step 4: Add observability and trust-metric tests**

```ts
const metric = (name: PilotMetricName, value: number): PilotMetricEvent => ({
  name,
  workspaceId: "00000000-0000-4000-8000-000000000001",
  traceId: `trace-${name}`,
  occurredAt: "2026-09-24T12:00:00.000Z",
  value,
});

it("observability_rejects_invalid_timestamps", () => {
  expect(() => emitPilotMetric({
    name: "sync_lag_ms",
    workspaceId: "00000000-0000-4000-8000-000000000001",
    traceId: "trace-1",
    occurredAt: "not-a-date",
    value: 12,
  }, { capture: () => undefined })).toThrow("occurredAt");
});

it("preserves_safe_trace_dimensions_and_summarizes_trust_metrics", () => {
  const events = [
    metric("detector_latency_ms", 120),
    metric("detector_error", 0),
    metric("evidence_completeness", 0.75),
    metric("case_review_latency_ms", 240),
  ];

  expect(summarizeTrustMetrics(events, workspaceId)).toEqual(expect.objectContaining({
    detectorLatencyMs: 120,
    detectorErrorRate: 0,
    evidenceCompleteness: 0.75,
    caseReviewLatencyMs: 240,
  }));
});
```

- [ ] **Step 5: Implement observability, funnel events, and trust metrics**

Use this interface:

```ts
export type PilotMetricName =
  | "sync_lag_ms" | "normalization_failure" | "identity_ambiguity"
  | "detector_latency_ms" | "detector_error" | "extraction_correction"
  | "evidence_completeness" | "case_review_latency_ms";

export type PilotMetricEvent = {
  name: PilotMetricName;
  workspaceId: string;
  traceId: string;
  occurredAt: string;
  value: number;
  dimensions?: Readonly<Record<string, string>>;
};

export type PilotMetricSink = { capture: (event: PilotMetricEvent) => void };
export function emitPilotMetric(event: PilotMetricEvent, sink: PilotMetricSink): void;

export type TrustMetricSummary = {
  sampleSize: number;
  syncLagMs: number | null;
  detectorLatencyMs: number | null;
  detectorErrorRate: number | null;
  extractionCorrectionRate: number | null;
  evidenceCompleteness: number | null;
  caseReviewLatencyMs: number | null;
};
export function summarizeTrustMetrics(events: readonly PilotMetricEvent[], workspaceId: string): TrustMetricSummary;

export function createFunnelEvent(input: {
  name: "audit_activated" | "case_review_started" | "case_review_completed";
  workspaceId: string;
  traceId: string;
  occurredAt: string;
}): { event: string; properties: Readonly<Record<string, string>> };
```

Accept only finite metric values and non-future ISO timestamps, strip unsafe
dimensions, preserve workspace/trace identity, and calculate rates using the
event count for the relevant metric as denominator.
Reject events from a different workspace before aggregation.

- [ ] **Step 6: Document the pilot-hardening checklist**

Create `docs/pilot-hardening.md` with explicit sections for tenant isolation,
credential revocation/disconnect, deletion propagation, retention defaults,
structured trace/debug flow, metric ownership, and PostHog event names. State
that credentials and unsupported revenue claims are prohibited.

- [ ] **Step 7: Run focused and repository verification**

Run: `yarn vitest run tests/pilot-hardening.test.ts`

Expected: all pilot-hardening tests pass.

Run: `yarn test:unit`

Expected: the existing unit suite and pilot-hardening tests pass with zero
failures.

Run: `yarn typecheck`

Expected: exit code 0.

Run: `yarn lint`

Expected: exit code 0 with no new diagnostics.

- [ ] **Step 8: Commit the task**

```bash
git add src/pilot-hardening docs/pilot-hardening.md tests/pilot-hardening.test.ts
git commit -m "feat(pilot): add security retention and trust metrics"
```

---

### Task 2: DS3-S5-05 calibration, golden pack, and falsification gates

**Status:** complete in integration commit `5b1b0eb7`, with validation hardening in `c6278e28`.

**Files:**
- Create: `src/pilot-calibration/contracts.ts`
- Create: `src/pilot-calibration/metrics.ts`
- Create: `src/pilot-calibration/gates.ts`
- Create: `src/pilot-calibration/golden-pack.ts`
- Create: `src/pilot-calibration/report.ts`
- Create: `src/pilot-calibration/index.ts`
- Create: `docs/pilot-calibration.md`
- Test: `tests/pilot-calibration.test.ts`

**Interfaces:**
- Consumes serializable audit/shadow/readiness projections supplied by fixtures or later adapters.
- Produces `calculateCalibrationMetrics`, `evaluateFalsificationGates`, `runGoldenCalibrationPack`, and `buildCalibrationReport`.

- [ ] **Step 1: Write the failing calibration tests**

```ts
const scenario = (overrides: Partial<CalibrationRecord> = {}): CalibrationRecord => ({
  tenantId: "tenant-a",
  caseId: "case-default",
  label: "true_positive",
  predictedFinding: true,
  readiness: "ready",
  nativeSystemObvious: false,
  evidenceIds: ["evidence-1"],
  ...overrides,
});

it("calibration_metrics_define_zero_sample_behavior", () => {
  expect(calculateCalibrationMetrics([])).toEqual({
    sampleSize: 0,
    precision: null,
    falsePositiveRate: null,
    insufficientEvidenceRate: null,
    nativeSystemObviousRate: null,
  });
});

it("golden_pack_surfaces_missing_evidence_and_tenant_mixing", () => {
  const result = runGoldenCalibrationPack([
    scenario({ caseId: "case-ready", label: "true_positive", readiness: "ready" }),
    scenario({ caseId: "case-missing", label: "insufficient_evidence", readiness: "insufficient_evidence" }),
    scenario({ caseId: "case-foreign", tenantId: "tenant-b", label: "true_positive" }),
  ], { tenantId: "tenant-a" });

  expect(result.acceptedCaseIds).toEqual(["case-ready"]);
  expect(result.rejectedCaseIds).toEqual(["case-missing", "case-foreign"]);
  expect(result.rejectionReasons).toEqual(expect.arrayContaining([
    expect.objectContaining({ caseId: "case-missing", code: "insufficient_evidence" }),
    expect.objectContaining({ caseId: "case-foreign", code: "tenant_mismatch" }),
  ]));
});
```

- [ ] **Step 2: Run the focused tests to verify the expected missing-module failure**

Run: `yarn vitest run tests/pilot-calibration.test.ts`

Expected: FAIL because the calibration module does not exist yet.

- [ ] **Step 3: Implement calibration contracts and deterministic metrics**

Use these types:

```ts
export type CalibrationLabel =
  | "true_positive" | "false_positive" | "insufficient_evidence" | "native_system_obvious";

export type CalibrationRecord = {
  tenantId: string;
  caseId: string;
  label: CalibrationLabel;
  predictedFinding: boolean;
  readiness: "ready" | "degraded" | "insufficient_evidence";
  nativeSystemObvious: boolean;
  evidenceIds: readonly string[];
};

export type CalibrationMetrics = {
  sampleSize: number;
  precision: number | null;
  falsePositiveRate: number | null;
  insufficientEvidenceRate: number | null;
  nativeSystemObviousRate: number | null;
};

export function calculateCalibrationMetrics(records: readonly CalibrationRecord[]): CalibrationMetrics;
```

Filter nothing inside `calculateCalibrationMetrics`; it must report what it was
given. Use `null` for undefined denominators and sort records by `caseId` when
serializing reports.

- [ ] **Step 4: Implement golden scenarios and tenant/readiness gates**

Use this interface:

```ts
export type GoldenScenario = CalibrationRecord;
export type GoldenPackResult = {
  acceptedCaseIds: readonly string[];
  rejectedCaseIds: readonly string[];
  rejectionReasons: readonly { caseId: string; code: "tenant_mismatch" | "insufficient_evidence" | "missing_evidence" }[];
  records: readonly CalibrationRecord[];
};

export function runGoldenCalibrationPack(
  scenarios: readonly GoldenScenario[],
  scope: { tenantId: string },
): GoldenPackResult;
```

Reject foreign tenants, insufficient/degraded readiness, and records without
evidence IDs before calculating calibration metrics. Preserve rejection reasons
in the report.

- [ ] **Step 5: Implement falsification gates and report output**

Use this interface:

```ts
export type FalsificationThresholds = {
  minimumPrecision: number;
  maximumFalsePositiveRate: number;
  maximumInsufficientEvidenceRate: number;
  maximumNativeSystemObviousRate: number;
};

export type GateDecision = "proceed" | "iterate" | "pivot";
export type FalsificationResult = {
  decision: GateDecision;
  failures: readonly { metric: keyof CalibrationMetrics; observed: number | null; threshold: number }[];
};

export function evaluateFalsificationGates(
  metrics: CalibrationMetrics,
  thresholds: FalsificationThresholds,
): FalsificationResult;

export function buildCalibrationReport(input: {
  tenantId: string;
  generatedAt: string;
  metrics: CalibrationMetrics;
  falsification: FalsificationResult;
  goldenPack: GoldenPackResult;
}): {
  tenantId: string;
  generatedAt: string;
  metrics: CalibrationMetrics;
  falsification: FalsificationResult;
  goldenPack: GoldenPackResult;
  unsupportedClaims: readonly string[];
};
```

Use `iterate` for measurable threshold failures with enough samples and
`pivot` when required denominators are null or the native-system-obvious rate
exceeds its threshold. The report must always include
`"recovered revenue requires supported outcome evidence"` in
`unsupportedClaims` and must not calculate revenue.

- [ ] **Step 6: Document calibration and launch gates**

Create `docs/pilot-calibration.md` documenting dataset labels, metric
denominators, golden scenarios, threshold ownership, proceed/iterate/pivot
semantics, manual QA responsibilities, and the prohibition on unsupported
revenue attribution.

- [ ] **Step 7: Run focused and repository verification**

Run: `yarn vitest run tests/pilot-calibration.test.ts`

Expected: all pilot-calibration tests pass.

Run: `yarn test:unit`

Expected: the existing unit suite and pilot-calibration tests pass with zero
failures.

Run: `yarn typecheck`

Expected: exit code 0.

Run: `yarn lint`

Expected: exit code 0 with no new diagnostics.

- [ ] **Step 8: Commit the task**

```bash
git add src/pilot-calibration docs/pilot-calibration.md tests/pilot-calibration.test.ts
git commit -m "test(pilot): add calibration and falsification gates"
```

---

### Task 3: Master integration and delivery review

**Status:** complete on `feat/ds3-s5-orchestration`; full repository verification remains dependency/capacity constrained.

**Files:**
- Modify: `docs/superpowers/plans/2026-09-24-ds3-s5-pilot-hardening.md`
- Modify: `docs/superpowers/specs/2026-09-24-ds3-s5-pilot-hardening-design.md`

**Interfaces:**
- Consumes the two task commits and their verification evidence.
- Produces an integration branch containing only the approved task commits and an evidence-backed handoff.

- [x] **Step 1: Review both task diffs**

Confirm that S5-04 changes are limited to `src/pilot-hardening`, its docs, and
its tests; S5-05 changes are limited to `src/pilot-calibration`, its docs, and
its tests. Reject secrets, unsupported claims, CRM writes, and imports from
unfinished S5-02/S5-03 branches.

- [x] **Step 2: Run the combined verification**

Run from `deal_scale_v3` on the integration worktree:

```bash
yarn test:unit
yarn typecheck
yarn lint
git diff --check
```

Expected: all commands exit 0. If the full repository suite is blocked by the
existing Twenty environment, record that blocker separately and retain the
focused task evidence.

- [x] **Step 3: Record task status evidence**

Record commit hashes, focused test output, combined verification output, and
the remaining S5-02/S5-03 integration gaps in the handoff. Update the Notion
task pages only after the corresponding commit and verification evidence exist.

- [x] **Step 4: Final review**

Run a fresh review against the spec and plan. Any Important finding receives a
single TDD fix pass; Minor findings are recorded as deferred rather than
expanded into unrelated refactoring.
