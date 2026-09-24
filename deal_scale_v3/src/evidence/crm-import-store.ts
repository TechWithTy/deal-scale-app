import type { NormalizedEvidenceEnvelope } from "./adapter-contracts";
import type {
  CrmImportStatusRecord,
  CrmImportStore,
  SourceConnectionState,
} from "./crm-importer";

export function createInMemoryCrmImportStore(): CrmImportStore & {
  getEvents(): NormalizedEvidenceEnvelope[];
  getSourceConnection(connectionId: string, workspaceId: string): SourceConnectionState | undefined;
  getImportStatus(connectionId: string, workspaceId: string): CrmImportStatusRecord | undefined;
} {
  const events = new Map<string, NormalizedEvidenceEnvelope>();
  const checkpoints = new Map<string, SourceConnectionState["checkpoint"]>();
  const connections = new Map<string, SourceConnectionState>();
  const statuses = new Map<string, CrmImportStatusRecord>();

  return {
    async upsertSourceConnection(connection) {
      connections.set(`${connection.workspaceId}:${connection.connectionId}`, connection);
    },
    async getCheckpoint(key) {
      return checkpoints.get(`${key.workspaceId}:${key.connectionId}`) ?? null;
    },
    async saveCheckpoint(key, checkpoint) {
      const scopedKey = `${key.workspaceId}:${key.connectionId}`;
      checkpoints.set(scopedKey, checkpoint);
      const connection = connections.get(scopedKey);
      if (connection) {
        connections.set(scopedKey, { ...connection, checkpoint });
      }
    },
    async upsertEvents(batch) {
      let imported = 0;
      let duplicates = 0;
      for (const event of batch) {
        if (events.has(event.idempotencyKey)) {
          events.set(event.idempotencyKey, event);
          duplicates += 1;
        } else {
          events.set(event.idempotencyKey, event);
          imported += 1;
        }
      }
      return { imported, duplicates };
    },
    async saveImportStatus(status) {
      statuses.set(`${status.workspaceId}:${status.connectionId}`, status);
    },
    getEvents: () => [...events.values()],
    getSourceConnection: (connectionId, workspaceId) =>
      connections.get(`${workspaceId}:${connectionId}`),
    getImportStatus: (connectionId, workspaceId) =>
      statuses.get(`${workspaceId}:${connectionId}`),
  };
}
