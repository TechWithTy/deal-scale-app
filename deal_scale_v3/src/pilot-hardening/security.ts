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

export function runSecurityChecklist(input: SecurityChecklistInput): SecurityChecklistResult {
  if (!input.workspaceId || !input.sourceConnectionId || !input.sourceWorkspaceId) {
    throw new Error("workspaceId and sourceConnectionId are required");
  }
  if (input.workspaceId !== input.sourceWorkspaceId) {
    throw new Error("source workspace does not match workspaceId");
  }

  const findings: { code: string; severity: "info" | "warning" | "error" }[] = [];
  if (input.credentialMetadata.accessToken || input.credentialMetadata.refreshToken) {
    findings.push({ code: "credential_redacted", severity: "warning" });
  }
  if (input.connectionStatus !== "connected") {
    findings.push({ code: `connection_${input.connectionStatus}`, severity: "error" });
  }

  return {
    workspaceId: input.workspaceId,
    sourceConnectionId: input.sourceConnectionId,
    passed: !findings.some(({ severity }) => severity === "error"),
    findings,
  };
}
