import { describe, expect, it } from "vitest";

import {
  detectProcessSlaBreaches,
  isValidProcessSlaCandidateId,
} from "../src/detectors/process-sla-breach";
import {
  conformanceResult,
  lateCompletion,
  obligation,
  sourceConnectionId,
  workspaceId,
} from "./fixtures/process-sla-breach";

const baseInput = {
  workspaceId,
  conformancePolicyId: "policy-sla-v1",
  asOf: "2026-09-24T12:00:00.000Z",
  slaWindowMs: 60 * 60 * 1000,
};

const withEvents = (actualEvents: (typeof lateCompletion)[]) => ({
  ...conformanceResult,
  actualEvents,
  events: actualEvents,
});

const withDeadline = (dueAt: string, graceWindowMs: number, actualEvents: (typeof lateCompletion)[]) => ({
  ...withEvents(actualEvents),
  deadline: { dueAt, graceWindowMs },
  slaWindowMs: graceWindowMs,
  obligations: [{ ...obligation, dueAt }],
});

describe("process SLA breach detector", () => {
  it("reports a late completion with traceable evidence", () => {
    const [finding] = detectProcessSlaBreaches({ ...baseInput, obligations: [obligation], events: [lateCompletion] });

    expect(finding.status).toBe("late");
    expect(finding.reasonCode).toBe("sla_breached");
    expect(finding.completionEventId).toBe(lateCompletion.externalId);
    expect(finding.traceability.sourceConnectionId).toBe(sourceConnectionId);
    expect(isValidProcessSlaCandidateId(finding.candidateId)).toBe(true);
  });

  it("does not report an on-time completion", () => {
    const event = { ...lateCompletion, occurredAt: "2026-09-24T10:30:00.000Z" };
    expect(detectProcessSlaBreaches({ ...baseInput, obligations: [obligation], events: [event] })).toEqual([]);
  });

  it("returns insufficient evidence when the SLA clock is missing", () => {
    const [finding] = detectProcessSlaBreaches({
      ...baseInput,
      obligations: [{ ...obligation, dueAt: null }],
      events: [],
    });
    expect(finding.status).toBe("insufficient_evidence");
    expect(finding.reasonCode).toBe("missing_clock");
  });

  it("does not use another tenant or source connection", () => {
    const foreignEvent = { ...lateCompletion, workspaceId: "00000000-0000-4000-8000-000000000002" };
    const otherSourceEvent = { ...lateCompletion, sourceConnectionId: "conn-other" };
    expect(detectProcessSlaBreaches({ ...baseInput, obligations: [obligation], events: [foreignEvent, otherSourceEvent] })[0].status).toBe("late");
  });

  it("preserves versioned policy, deadline, event, and exception evidence", () => {
    const [finding] = detectProcessSlaBreaches(conformanceResult);

    expect(finding).toMatchObject({
      policyVersion: "v2",
      trigger: "lead_assigned",
      expectedAction: "contact_lead",
      deadline: { dueAt: "2026-09-24T10:00:00.000Z", graceWindowMs: 0 },
      actualEvents: [{ externalId: lateCompletion.externalId }],
      exceptionEvaluation: { evaluated: true, matched: false, reason: null },
    });
  });

  it("treats completion at the deadline as on time and one millisecond later as late", () => {
    const atDeadline = { ...lateCompletion, externalId: "event-at-deadline", occurredAt: conformanceResult.deadline.dueAt };
    const afterDeadline = { ...lateCompletion, externalId: "event-after-deadline", occurredAt: "2026-09-24T10:00:00.001Z" };

    expect(detectProcessSlaBreaches(withEvents([atDeadline]))).toEqual([]);
    expect(detectProcessSlaBreaches(withEvents([afterDeadline]))[0]).toMatchObject({
      status: "late",
      completionEventId: "event-after-deadline",
      deadline: { dueAt: conformanceResult.deadline.dueAt, graceWindowMs: 0 },
    });
  });

  it("includes the grace endpoint and breaches one millisecond beyond it", () => {
    const atGraceEnd = { ...lateCompletion, externalId: "event-at-grace-end", occurredAt: "2026-09-24T10:30:00.000Z" };
    const afterGrace = { ...lateCompletion, externalId: "event-after-grace", occurredAt: "2026-09-24T10:30:00.001Z" };

    expect(detectProcessSlaBreaches(withDeadline(conformanceResult.deadline.dueAt, 30 * 60 * 1000, [atGraceEnd]))).toEqual([]);
    expect(detectProcessSlaBreaches(withDeadline(conformanceResult.deadline.dueAt, 30 * 60 * 1000, [afterGrace]))[0]).toMatchObject({
      status: "late",
      deadline: { dueAt: conformanceResult.deadline.dueAt, graceWindowMs: 30 * 60 * 1000 },
    });
  });

  it("ignores completion events after evaluatedAt", () => {
    const onTime = { ...lateCompletion, externalId: "event-on-time", occurredAt: "2026-09-24T09:30:00.000Z" };
    const futureLate = { ...lateCompletion, externalId: "event-future", occurredAt: "2026-09-24T13:00:00.000Z", observedAt: "2026-09-24T13:00:00.000Z" };

    expect(detectProcessSlaBreaches(withEvents([onTime, futureLate]))).toEqual([]);
  });

  it("prefers the first valid completion over a later completion", () => {
    const onTime = { ...lateCompletion, externalId: "event-first", occurredAt: "2026-09-24T09:30:00.000Z" };
    const later = { ...lateCompletion, externalId: "event-later", occurredAt: "2026-09-24T11:00:00.000Z" };

    expect(detectProcessSlaBreaches(withEvents([later, onTime]))).toEqual([]);
  });

  it("keeps completion evidence within workspace, connection, and opportunity identity", () => {
    const otherWorkspace = { ...lateCompletion, externalId: "event-other-workspace", workspaceId: "00000000-0000-4000-8000-000000000002", occurredAt: "2026-09-24T09:00:00.000Z" };
    const otherConnection = { ...lateCompletion, externalId: "event-other-connection", sourceConnectionId: "conn-other", occurredAt: "2026-09-24T09:00:00.000Z" };
    const otherOpportunity = { ...lateCompletion, externalId: "event-other-opportunity", opportunityReferenceId: "opp-002", occurredAt: "2026-09-24T09:00:00.000Z" };

    const [finding] = detectProcessSlaBreaches(withEvents([otherWorkspace, otherConnection, otherOpportunity, lateCompletion]));
    expect(finding).toMatchObject({
      status: "late",
      opportunityReferenceId: "opp-001",
      evidenceEventIds: [lateCompletion.externalId],
      actualEvents: [{ externalId: lateCompletion.externalId }],
      traceability: { tenantId: workspaceId, sourceConnectionId },
    });
  });
});
