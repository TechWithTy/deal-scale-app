import { defineRole } from "twenty-sdk/define";

import { RBAC_MATRIX } from "src/security/rbac";

export const EVIDENCE_INTEGRATION_ROLE_UNIVERSAL_IDENTIFIER =
  "3a5b1937-4022-4c05-8cf6-0e34d89844e0";

export default defineRole({
  universalIdentifier: EVIDENCE_INTEGRATION_ROLE_UNIVERSAL_IDENTIFIER,
  label: "Evidence Integration",
  description: "API-key role limited to evidence ingestion and provenance records.",
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: true,
  canAccessAllTools: false,
  canUpdateAllSettings: false,
  objectPermissions: RBAC_MATRIX.evidenceIntegration.permissions,
});
