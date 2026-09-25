# Pilot hardening contracts

These pure contracts prepare pilot adapters and reports. They do not perform deletion, CRM writes, seller communication, or recovery actions.

## Tenant isolation

Every source security check compares `sourceWorkspaceId` with `workspaceId` and rejects a mismatch. A deletion plan carries the same workspace and source connection identity on all six targets. Downstream adapters must enforce those identities at each read and deletion boundary.

## Credential revocation and disconnect

Disconnected and revoked connections fail the security checklist. Credential presence produces a `credential_redacted` finding; neither token values nor provider metadata appear in its result. Credentials are prohibited in metric dimensions, traces, reports, and logs. Revocation itself remains the connection provider's responsibility.

## Deletion propagation

The plan orders `sourceConnection`, `evidenceReference`, `detectorCandidate`, `assuranceCase`, `event`, and `telemetry` targets. Its UUID v4 `planId` and `idempotencyKey` are stable for the same workspace, source, and request timestamp. An executor must scope every action to those identities, track completion, and handle retries; this module only describes targets.

## Retention defaults

The contract sets no automatic retention duration and stores no records. Until the pilot owner approves a retention period, adapters should retain no new copies solely for this contract and should honor an explicit, tenant-scoped deletion request. A future retention schedule needs a documented owner and policy before activation.

## Structured trace and debug flow

Each metric includes a workspace ID, trace ID, non-future ISO timestamp, finite value, and metric name. The emitter forwards only bounded `source_type`, `stage`, and `outcome` dimensions. Debug a pilot issue by following the workspace and trace IDs through source sync, detector, evidence, and case review; do not place payloads or credentials in those fields.

## Metric ownership

The source adapter owns `sync_lag_ms`, `normalization_failure`, and `identity_ambiguity`. The detector adapter owns `detector_latency_ms` and `detector_error`. Extraction owns `extraction_correction` and `evidence_completeness`. Case review owns `case_review_latency_ms`. The summary reports means for durations and completeness, and per-metric event-count denominators for error and correction rates; missing samples are `null`. Values for rates should be 0 or 1 per event. Unsupported revenue claims are prohibited.

## PostHog event names

The bounded funnel names are `audit_activated`, `case_review_started`, and `case_review_completed`. `createFunnelEvent` produces event name and safe properties for a later PostHog adapter. It does not install or call PostHog.
