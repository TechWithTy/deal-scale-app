import { createHash } from "node:crypto";

import { z } from "zod";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const obligationSchema = z.object({
  name: z.string().min(1),
  externalId: z.string().min(1),
  workspaceId: z.string().min(1),
  provenanceState: z.enum(["observed", "inferred"]),
  provenanceRef: z.string().min(1),
  sourceVersion: z.string().min(1),
  recordVersion: z.number().int().positive(),
  observedAt: z.coerce.date(),
  opportunityReferenceId: z.string().min(1),
  dueAt: z.coerce.date().nullable(),
  ownerId: z.string().min(1),
  sourceConnectionId: z.string().min(1),
  completionEventTypes: z.array(z.string().min(1)).default(["sla_completed"]),
});

const eventSchema = z.object({
  externalId: z.string().min(1),
  workspaceId: z.string().min(1),
  provenanceRef: z.string().min(1),
  sourceVersion: z.string().min(1),
  observedAt: z.coerce.date(),
  occurredAt: z.coerce.date(),
  opportunityReferenceId: z.string().min(1),
  eventType: z.string().min(1),
  sourceConnectionId: z.string().min(1),
  actorId: z.string().min(1).optional(),
});

export const processSlaBreachInputSchema = z.object({
  workspaceId: z.string().min(1),
  conformancePolicyId: z.string().min(1),
  asOf: z.coerce.date(),
  slaWindowMs: z.number().finite().nonnegative(),
  obligations: z.array(obligationSchema),
  events: z.array(eventSchema),
});

export type ProcessSlaBreachInput = z.input<typeof processSlaBreachInputSchema>;
export type ProcessSlaStatus = "late" | "on_time" | "insufficient_evidence";
export type ProcessSlaReasonCode =
  | "sla_breached"
  | "missing_clock";

export type ProcessSlaFinding = {
  candidateId: string;
  status: ProcessSlaStatus;
  reasonCode: ProcessSlaReasonCode;
  obligationExternalId: string;
  dueAt: Date | null;
  completionEventId: string | null;
  evidenceEventIds: string[];
  traceability: {
    tenantId: string;
    sourceConnectionId: string;
    ownerId: string;
    provenanceRef: string;
    sourceVersion: string;
    observedAt: Date;
  };
};

const deterministicUuidV4 = (seed: string) => {
  const bytes = createHash("sha256").update(seed).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const detectProcessSlaBreaches = (rawInput: ProcessSlaBreachInput): ProcessSlaFinding[] => {
  const input = processSlaBreachInputSchema.parse(rawInput);
  return input.obligations
    .filter((obligation) => obligation.workspaceId === input.workspaceId)
    .flatMap((obligation) => {
      const events = input.events
        .filter(
          (event) =>
            event.workspaceId === obligation.workspaceId &&
            event.sourceConnectionId === obligation.sourceConnectionId &&
            event.opportunityReferenceId === obligation.opportunityReferenceId,
        )
        .sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
      const completion = events.find((event) => obligation.completionEventTypes.includes(event.eventType)) ?? null;
      if (obligation.dueAt === null) {
        return [{
          candidateId: deterministicUuidV4(`${input.workspaceId}|${obligation.externalId}|missing_clock`),
          status: "insufficient_evidence" as const,
          reasonCode: "missing_clock" as const,
          obligationExternalId: obligation.externalId,
          dueAt: null,
          completionEventId: completion?.externalId ?? null,
          evidenceEventIds: events.map((event) => event.externalId),
          traceability: {
            tenantId: obligation.workspaceId,
            sourceConnectionId: obligation.sourceConnectionId,
            ownerId: obligation.ownerId,
            provenanceRef: obligation.provenanceRef,
            sourceVersion: obligation.sourceVersion,
            observedAt: completion?.observedAt ?? obligation.observedAt,
          },
        }];
      }
      const comparisonAt = completion?.occurredAt ?? input.asOf;
      if (!completion && comparisonAt < obligation.dueAt) return [];
      if (comparisonAt.getTime() - obligation.dueAt.getTime() <= input.slaWindowMs) return [];
      return [{
        candidateId: deterministicUuidV4(`${input.workspaceId}|${obligation.externalId}|${completion?.externalId ?? "late"}`),
        status: "late" as const,
        reasonCode: "sla_breached" as const,
        obligationExternalId: obligation.externalId,
        dueAt: obligation.dueAt,
        completionEventId: completion?.externalId ?? null,
        evidenceEventIds: events.map((event) => event.externalId),
        traceability: {
          tenantId: obligation.workspaceId,
          sourceConnectionId: obligation.sourceConnectionId,
          ownerId: obligation.ownerId,
          provenanceRef: obligation.provenanceRef,
          sourceVersion: obligation.sourceVersion,
          observedAt: completion?.observedAt ?? obligation.observedAt,
        },
      }];
    });
};

export const isValidProcessSlaCandidateId = (candidateId: string) => UUID_V4.test(candidateId);
