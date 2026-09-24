import { defineRole } from "twenty-sdk/define";

import { RBAC_MATRIX } from "src/security/rbac";

export const ASSURANCE_MANAGER_ROLE_UNIVERSAL_IDENTIFIER =
  "1fa0c076-feba-4ef4-8761-6ba55827a8e8";

export default defineRole({
  universalIdentifier: ASSURANCE_MANAGER_ROLE_UNIVERSAL_IDENTIFIER,
  label: "Assurance Manager",
  description: "Review and disposition assurance cases without credential access.",
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: false,
  canAccessAllTools: false,
  canUpdateAllSettings: false,
  objectPermissions: RBAC_MATRIX.manager.permissions,
});
