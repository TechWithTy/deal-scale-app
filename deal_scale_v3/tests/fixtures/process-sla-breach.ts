export const workspaceId = "00000000-0000-4000-8000-000000000001";
export const sourceConnectionId = "conn-twenty-001";

export const obligation = {
  name: "Respond to inbound lead",
  externalId: "sla-001",
  workspaceId,
  provenanceState: "observed" as const,
  provenanceRef: "twenty://sla/sla-001",
  sourceVersion: "twenty-v1",
  recordVersion: 1,
  observedAt: "2026-09-24T12:00:00.000Z",
  opportunityReferenceId: "opp-001",
  dueAt: "2026-09-24T10:00:00.000Z",
  ownerId: "rep-001",
  sourceConnectionId,
  completionEventTypes: ["sla_completed"],
};

export const lateCompletion = {
  externalId: "event-completed-late",
  workspaceId,
  provenanceRef: "twenty://event/event-completed-late",
  sourceVersion: "twenty-v1",
  observedAt: "2026-09-24T12:00:00.000Z",
  occurredAt: "2026-09-24T12:00:00.000Z",
  opportunityReferenceId: "opp-001",
  eventType: "sla_completed",
  sourceConnectionId,
  actorId: "rep-001",
};
