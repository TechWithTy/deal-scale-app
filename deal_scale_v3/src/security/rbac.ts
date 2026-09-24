import { ASSURANCE_OBJECTS, type AssuranceObjectName } from "src/assurance/identifiers";

export type AssuranceRole = "reviewer" | "manager" | "evidenceIntegration";

type Permission = {
  canReadObjectRecords: boolean;
  canUpdateObjectRecords: boolean;
  canSoftDeleteObjectRecords: boolean;
  canDestroyObjectRecords: boolean;
};

const readOnly = (objectName: AssuranceObjectName): Permission & {
  objectName: AssuranceObjectName;
  objectUniversalIdentifier: string;
} => ({
  objectName,
  objectUniversalIdentifier: ASSURANCE_OBJECTS[objectName],
  canReadObjectRecords: true,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
});

const managerWriteSet: AssuranceObjectName[] = [
  "assuranceCase",
  "managerDisposition",
  "outcome",
];

const integrationWriteSet: AssuranceObjectName[] = [
  "sourceConnection",
  "sellerIdentity",
  "opportunityReference",
  "event",
  "promise",
  "evidenceReference",
];

export const RBAC_MATRIX = {
  reviewer: {
    apiKeyAssignable: false,
    credentialAccess: false,
    sellerContactExecution: false,
    permissions: Object.keys(ASSURANCE_OBJECTS).map((name) =>
      readOnly(name as AssuranceObjectName),
    ),
  },
  manager: {
    apiKeyAssignable: false,
    credentialAccess: false,
    sellerContactExecution: false,
    permissions: Object.keys(ASSURANCE_OBJECTS).map((name) => {
      const permission = readOnly(name as AssuranceObjectName);
      return managerWriteSet.includes(name as AssuranceObjectName)
        ? { ...permission, canUpdateObjectRecords: true }
        : permission;
    }),
  },
  evidenceIntegration: {
    apiKeyAssignable: true,
    credentialAccess: false,
    sellerContactExecution: false,
    permissions: integrationWriteSet.map((name) => ({
      ...readOnly(name),
      canUpdateObjectRecords: true,
    })),
  },
} satisfies Record<AssuranceRole, {
  apiKeyAssignable: boolean;
  credentialAccess: boolean;
  sellerContactExecution: boolean;
  permissions: Array<Permission & {
    objectName: AssuranceObjectName;
    objectUniversalIdentifier: string;
  }>;
}>;

export const canAccessWorkspaceRecord = ({
  actorWorkspaceId,
  recordWorkspaceId,
  role,
}: {
  actorWorkspaceId: string;
  recordWorkspaceId: string;
  role: AssuranceRole;
}) =>
  actorWorkspaceId === recordWorkspaceId && RBAC_MATRIX[role].permissions.some(
    (permission) => permission.canReadObjectRecords,
  );
