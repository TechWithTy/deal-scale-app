import { describe, expect, it } from "vitest";

import {
  detectProcessSlaBreaches,
  isValidProcessSlaCandidateId,
} from "../src/detectors/process-sla-breach";
import { lateCompletion, obligation, sourceConnectionId, workspaceId } from "./fixtures/process-sla-breach";

const baseInput = {
  workspaceId,
  conformancePolicyId: "policy-sla-v1",
  asOf: "2026-09-24T12:00:00.000Z",
  slaWindowMs: 60 * 60 * 1000,
};

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
});
