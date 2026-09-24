import { defineRole } from "twenty-sdk/define";

import { RBAC_MATRIX } from "src/security/rbac";

export const ASSURANCE_REVIEWER_ROLE_UNIVERSAL_IDENTIFIER =
  "acf883f7-e6c0-47bd-96a4-f4eeba283d34";

export default defineRole({
  universalIdentifier: ASSURANCE_REVIEWER_ROLE_UNIVERSAL_IDENTIFIER,
  label: "Assurance Reviewer",
  description: "Read-only assurance review with no credential or execution access.",
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
  canAccessAllTools: false,
  canUpdateAllSettings: false,
  objectPermissions: RBAC_MATRIX.reviewer.permissions,
});
