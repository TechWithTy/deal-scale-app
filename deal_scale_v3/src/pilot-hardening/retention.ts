import { createHash } from "node:crypto";

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

const resources = [
  "sourceConnection",
  "evidenceReference",
  "detectorCandidate",
  "assuranceCase",
  "event",
  "telemetry",
] as const;

export function buildRetentionDeletionPlan(input: {
  workspaceId: string;
  sourceConnectionId: string;
  requestedAt: string;
}): RetentionDeletionPlan {
  if (!input.workspaceId || !input.sourceConnectionId) {
    throw new Error("workspaceId and sourceConnectionId are required");
  }
  const parsedDate = new Date(input.requestedAt);
  if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString() !== input.requestedAt) {
    throw new Error("requestedAt must be an ISO timestamp");
  }

  const digest = createHash("sha256")
    .update(JSON.stringify([input.workspaceId, input.sourceConnectionId, input.requestedAt]))
    .digest();
  const uuidBytes = Buffer.from(digest.subarray(0, 16));
  uuidBytes[6] = (uuidBytes[6] & 0x0f) | 0x40;
  uuidBytes[8] = (uuidBytes[8] & 0x3f) | 0x80;
  const hex = uuidBytes.toString("hex");
  const planId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;

  return {
    planId,
    idempotencyKey: planId,
    workspaceId: input.workspaceId,
    sourceConnectionId: input.sourceConnectionId,
    requestedAt: input.requestedAt,
    targets: resources.map((resource) => ({
      resource,
      workspaceId: input.workspaceId,
      sourceConnectionId: input.sourceConnectionId,
    })),
  };
}
