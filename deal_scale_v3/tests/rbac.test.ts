import { describe, expect, it } from "vitest";

import { ASSURANCE_OBJECTS } from "../src/assurance/identifiers";
import { canAccessWorkspaceRecord, RBAC_MATRIX } from "../src/security/rbac";

describe("workspace RBAC boundaries", () => {
  it("keeps reviewer access read-only", () => {
    expect(RBAC_MATRIX.reviewer.permissions.every((permission) => permission.canReadObjectRecords)).toBe(
      true,
    );
    expect(RBAC_MATRIX.reviewer.permissions.some((permission) => permission.canUpdateObjectRecords)).toBe(
      false,
    );
  });

  it("limits manager writes to case review outcomes", () => {
    const writable = RBAC_MATRIX.manager.permissions
      .filter((permission) => permission.canUpdateObjectRecords)
      .map((permission) => permission.objectName);
    expect(writable).toEqual(["assuranceCase", "managerDisposition", "outcome"]);
  });

  it("separates API-key ingestion from credentials and seller execution", () => {
    expect(RBAC_MATRIX.evidenceIntegration.apiKeyAssignable).toBe(true);
    expect(RBAC_MATRIX.evidenceIntegration.credentialAccess).toBe(false);
    expect(RBAC_MATRIX.evidenceIntegration.sellerContactExecution).toBe(false);
    expect(RBAC_MATRIX.evidenceIntegration.permissions).not.toContainEqual(
      expect.objectContaining({ objectUniversalIdentifier: ASSURANCE_OBJECTS.assuranceCase }),
    );
  });

  it("denies cross-workspace record access", () => {
    expect(
      canAccessWorkspaceRecord({
        actorWorkspaceId: "workspace-a",
        recordWorkspaceId: "workspace-b",
        role: "reviewer",
      }),
    ).toBe(false);
    expect(
      canAccessWorkspaceRecord({
        actorWorkspaceId: "workspace-a",
        recordWorkspaceId: "workspace-a",
        role: "reviewer",
      }),
    ).toBe(true);
  });
});
