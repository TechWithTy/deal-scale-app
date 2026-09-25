import { createHash } from "node:crypto";

import { z } from "zod";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const nonempty = z.string().trim().min(1);

const actualEventSchema = z.object({
  externalId: nonempty,
  workspaceId: z.string().uuid(),
  sourceConnectionId: nonempty,
  opportunityReferenceId: nonempty,
  eventType: nonempty,
  provenanceRef: nonempty,
  sourceVersion: nonempty,
  observedAt: z.coerce.date(),
  occurredAt: z.coerce.date(),
  actorId: nonempty.optional(),
});

export const processSlaBreachInputSchema = z
  .object({
    workspaceId: z.string().uuid(),
    sourceConnectionId: nonempty,
    opportunityReferenceId: nonempty,
    obligationId: nonempty,
    sourceVersion: nonempty,
    completionEventTypes: z.array(nonempty).min(1),
    policy: z.object({
      policyId: nonempty,
      policyVersion: nonempty,
      trigger: nonempty,
      expectedAction: nonempty,
    }),
    deadline: z.object({
      dueAt: z.coerce.date().nullable(),
      graceWindowMs: z.number().finite().nonnegative(),
    }),
    actualEvents: z.array(actualEventSchema),
    exceptionEvaluation: z.object({
      evaluated: z.boolean(),
      matched: z.boolean(),
      reason: z.string().nullable(),
    }),
    evaluatedAt: z.coerce.date(),
  })
  .superRefine((input, ctx) => {
    input.actualEvents.forEach((event, index) => {
      if (event.workspaceId !== input.workspaceId) {
        ctx.addIssue({
          code: "custom",
          path: ["actualEvents", index, "workspaceId"],
          message: "Event workspaceId must match the conformance workspaceId",
        });
      }
      if (event.sourceConnectionId !== input.sourceConnectionId) {
        ctx.addIssue({
          code: "custom",
          path: ["actualEvents", index, "sourceConnectionId"],
          message: "Event sourceConnectionId must match the conformance sourceConnectionId",
        });
      }
      if (event.opportunityReferenceId !== input.opportunityReferenceId) {
        ctx.addIssue({
          code: "custom",
          path: ["actualEvents", index, "opportunityReferenceId"],
          message: "Event opportunityReferenceId must match the conformance opportunityReferenceId",
        });
      }
    });
  });

export type ProcessSlaBreachInput = z.input<typeof processSlaBreachInputSchema>;
export type ProcessSlaStatus = "late" | "on_time" | "exception" | "insufficient_evidence";
export type ProcessSlaReasonCode = "sla_breached" | "missing_clock" | "exception_matched";

type ActualEvent = z.output<typeof actualEventSchema>;
type ActualEventEvidence = Omit<ActualEvent, "observedAt" | "occurredAt"> & {
  observedAt: string;
  occurredAt: string;
};

export type ProcessSlaFinding = {
  candidateId: string;
  status: ProcessSlaStatus;
  reasonCode: ProcessSlaReasonCode;
  policyId: string;
  policyVersion: string;
  trigger: string;
  expectedAction: string;
  obligationExternalId: string;
  opportunityReferenceId: string;
  dueAt: Date | null;
  deadline: { dueAt: string | null; graceWindowMs: number };
  completionEventId: string | null;
  actualEventIds: string[];
  evidenceEventIds: string[];
  actualEvents: ActualEventEvidence[];
  exceptionEvaluation: { evaluated: boolean; matched: boolean; reason: string | null };
  traceability: {
    tenantId: string;
    sourceConnectionId: string;
    opportunityReferenceId: string;
    sourceVersion: string;
    provenanceRefs: string[];
  };
};

const deterministicUuidV4 = (seed: string) => {
  const bytes = createHash("sha256").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const evaluateConformance = (input: z.output<typeof processSlaBreachInputSchema>): ProcessSlaFinding | null => {
  const events = input.actualEvents
    .filter(
      (event) =>
        event.workspaceId === input.workspaceId &&
        event.sourceConnectionId === input.sourceConnectionId &&
        event.opportunityReferenceId === input.opportunityReferenceId &&
        event.occurredAt.getTime() <= input.evaluatedAt.getTime(),
    )
    .sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime() || left.externalId.localeCompare(right.externalId));
  const completion = events.find((event) => input.completionEventTypes.includes(event.eventType)) ?? null;
  const dueAt = input.deadline.dueAt;
  const comparisonAt = completion?.occurredAt ?? input.evaluatedAt;
  const status: ProcessSlaStatus = input.exceptionEvaluation.matched
    ? "exception"
    : dueAt === null
      ? "insufficient_evidence"
      : comparisonAt.getTime() > dueAt.getTime() + input.deadline.graceWindowMs
        ? "late"
        : "on_time";
  if (status === "on_time") return null;

  const actualEventIds = events.map((event) => event.externalId);
  const seed = JSON.stringify([
    input.workspaceId,
    input.sourceConnectionId,
    input.opportunityReferenceId,
    input.policy.policyId,
    input.policy.policyVersion,
    input.obligationId,
    input.evaluatedAt.toISOString(),
    status,
    [...actualEventIds].sort(),
  ]);

  return {
    candidateId: deterministicUuidV4(seed),
    status,
    reasonCode: status === "late" ? "sla_breached" : status === "exception" ? "exception_matched" : "missing_clock",
    policyId: input.policy.policyId,
    policyVersion: input.policy.policyVersion,
    trigger: input.policy.trigger,
    expectedAction: input.policy.expectedAction,
    obligationExternalId: input.obligationId,
    opportunityReferenceId: input.opportunityReferenceId,
    dueAt,
    deadline: { dueAt: dueAt?.toISOString() ?? null, graceWindowMs: input.deadline.graceWindowMs },
    completionEventId: completion?.externalId ?? null,
    actualEventIds,
    evidenceEventIds: actualEventIds,
    actualEvents: events.map((event) => ({
      ...event,
      observedAt: event.observedAt.toISOString(),
      occurredAt: event.occurredAt.toISOString(),
    })),
    exceptionEvaluation: input.exceptionEvaluation,
    traceability: {
      tenantId: input.workspaceId,
      sourceConnectionId: input.sourceConnectionId,
      opportunityReferenceId: input.opportunityReferenceId,
      sourceVersion: input.sourceVersion,
      provenanceRefs: [...new Set(events.map((event) => event.provenanceRef))],
    },
  };
};

export const detectProcessSlaBreaches = (rawResult: ProcessSlaBreachInput | ProcessSlaBreachInput[]): ProcessSlaFinding[] => {
  const results = Array.isArray(rawResult) ? rawResult : [rawResult];
  const findings = new Map<string, ProcessSlaFinding>();
  for (const rawInput of results) {
    const finding = evaluateConformance(processSlaBreachInputSchema.parse(rawInput));
    if (finding && !findings.has(finding.candidateId)) findings.set(finding.candidateId, finding);
  }
  return [...findings.values()];
};

export const isValidProcessSlaCandidateId = (candidateId: string) => UUID_V4.test(candidateId);
