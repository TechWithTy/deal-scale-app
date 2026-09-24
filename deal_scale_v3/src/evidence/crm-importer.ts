import {
  type ConnectionHealth,
  type CrmEvidenceAdapter,
  type EvidenceCheckpoint,
  EvidenceAdapterException,
  type NormalizedEvidenceEnvelope,
} from "./adapter-contracts";

export type CrmImportStatus = "running" | "completed" | "failed";

export interface SourceConnectionState {
  workspaceId: string;
  connectionId: string;
  name: string;
  provider: string;
  connectionStatus: "active" | "paused" | "revoked";
  health: ConnectionHealth;
  checkpoint: EvidenceCheckpoint | null;
}

export interface CrmImportStatusRecord {
  workspaceId: string;
  connectionId: string;
  status: CrmImportStatus;
  pages: number;
  imported: number;
  duplicates: number;
  retries: number;
  errorCode: string | null;
  updatedAt: string;
}

export interface CrmImportStore {
  upsertSourceConnection(connection: SourceConnectionState): Promise<void>;
  getCheckpoint(key: CrmImportKey): Promise<EvidenceCheckpoint | null>;
  saveCheckpoint(key: CrmImportKey, checkpoint: EvidenceCheckpoint): Promise<void>;
  upsertEvents(events: readonly NormalizedEvidenceEnvelope[]): Promise<{
    imported: number;
    duplicates: number;
  }>;
  saveImportStatus(status: CrmImportStatusRecord): Promise<void>;
}

export interface CrmImportKey {
  workspaceId: string;
  connectionId: string;
}

export interface CrmImportResult {
  pages: number;
  imported: number;
  duplicates: number;
  retries: number;
}

export interface CrmImportOptions {
  workspaceId: string;
  connectionId: string;
  connectionName: string;
  adapter: CrmEvidenceAdapter;
  store: CrmImportStore;
  now?: () => string;
  retry?: {
    maxAttempts: number;
    delay: (milliseconds: number) => Promise<void>;
  };
}

const defaultRetryDelay = async (milliseconds: number): Promise<void> => {
  if (milliseconds <= 0) return;
  await new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
};

async function readWithRetry(
  options: CrmImportOptions,
  request: Parameters<CrmEvidenceAdapter["readPage"]>[0],
  onRetry: () => void,
): Promise<Awaited<ReturnType<CrmEvidenceAdapter["readPage"]>>> {
  const maxAttempts = options.retry?.maxAttempts ?? 3;
  const delay = options.retry?.delay ?? defaultRetryDelay;
  let retries = 0;

  while (true) {
    try {
      return await options.adapter.readPage(request);
    } catch (error) {
      if (!(error instanceof EvidenceAdapterException) || !error.details.retryable || retries >= maxAttempts - 1) {
        throw error;
      }

      retries += 1;
      onRetry();
      await delay(error.details.retryAfterMs ?? 0);
    }
  }
}

export async function importCrmHistory(options: CrmImportOptions): Promise<CrmImportResult> {
  const now = options.now ?? (() => new Date().toISOString());
  const key = { workspaceId: options.workspaceId, connectionId: options.connectionId };
  const existingCheckpoint = await options.store.getCheckpoint(key);
  let health: ConnectionHealth;

  try {
    health = await options.adapter.checkHealth();
  } catch (error) {
    await options.store.saveImportStatus({
      ...key,
      status: "failed",
      pages: 0,
      imported: 0,
      duplicates: 0,
      retries: 0,
      errorCode: error instanceof EvidenceAdapterException ? error.details.code : "health-check-failed",
      updatedAt: now(),
    });
    throw error;
  }

  if (health.workspaceId !== options.workspaceId) {
    await options.store.saveImportStatus({
      ...key,
      status: "failed",
      pages: 0,
      imported: 0,
      duplicates: 0,
      retries: 0,
      errorCode: "workspace-mismatch",
      updatedAt: now(),
    });
    throw new Error("CRM connection health workspace does not match import workspace");
  }

  if (health.status !== "healthy" && health.status !== "degraded") {
    await options.store.upsertSourceConnection({
      ...key,
      name: options.connectionName,
      provider: options.adapter.provider,
      connectionStatus: health.status === "unauthorized" ? "revoked" : "active",
      health,
      checkpoint: existingCheckpoint,
    });
    await options.store.saveImportStatus({
      ...key,
      status: "failed",
      pages: 0,
      imported: 0,
      duplicates: 0,
      retries: 0,
      errorCode: health.status,
      updatedAt: now(),
    });
    throw new Error(`CRM connection is ${health.status}`);
  }

  await options.store.upsertSourceConnection({
    workspaceId: options.workspaceId,
    connectionId: options.connectionId,
    name: options.connectionName,
    provider: options.adapter.provider,
    connectionStatus: "active",
    health,
    checkpoint: existingCheckpoint,
  });

  let checkpoint = existingCheckpoint;
  let pages = 0;
  let imported = 0;
  let duplicates = 0;
  let retries = 0;

  await options.store.saveImportStatus({
    workspaceId: options.workspaceId,
    connectionId: options.connectionId,
    status: "running",
    pages,
    imported,
    duplicates,
    retries,
    errorCode: null,
    updatedAt: now(),
  });

  try {
    do {
      const page = await readWithRetry(options, {
        workspaceId: options.workspaceId,
        connectionId: options.connectionId,
        cursor: checkpoint?.cursor ?? null,
        limit: 500,
      }, () => {
        retries += 1;
      });
      const counts = await options.store.upsertEvents(page.items);

      pages += 1;
      imported += counts.imported;
      duplicates += counts.duplicates;
      checkpoint = { ...page.checkpoint, cursor: page.nextCursor };
      await options.store.saveCheckpoint(key, checkpoint);

      await options.store.saveImportStatus({
        workspaceId: options.workspaceId,
        connectionId: options.connectionId,
        status: "running",
        pages,
        imported,
        duplicates,
        retries,
        errorCode: null,
        updatedAt: now(),
      });
    } while (checkpoint.cursor !== null);

    await options.store.saveImportStatus({
      workspaceId: options.workspaceId,
      connectionId: options.connectionId,
      status: "completed",
      pages,
      imported,
      duplicates,
      retries,
      errorCode: null,
      updatedAt: now(),
    });

    return { pages, imported, duplicates, retries };
  } catch (error) {
    await options.store.saveImportStatus({
      workspaceId: options.workspaceId,
      connectionId: options.connectionId,
      status: "failed",
      pages,
      imported,
      duplicates,
      retries,
      errorCode: error instanceof EvidenceAdapterException ? error.details.code : "unknown",
      updatedAt: now(),
    });
    throw error;
  }
}
