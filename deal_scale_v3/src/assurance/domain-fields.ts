import { FieldType } from "twenty-sdk/define";

import {
  ASSURANCE_CASE_STATUS_VALUES,
  ASSURANCE_URGENCY_VALUES,
  selectOptions,
} from "src/assurance/common-fields";
import {
  type AssuranceObjectName,
  fieldId,
} from "src/assurance/identifiers";

type AssuranceField = Record<string, unknown>;

const textField = (objectId: string, slot: number, name: string, label: string) => ({
  universalIdentifier: fieldId(objectId, slot),
  type: FieldType.TEXT as const,
  name,
  label,
});

const dateTimeField = (
  objectId: string,
  slot: number,
  name: string,
  label: string,
  isNullable = false,
) => ({
  universalIdentifier: fieldId(objectId, slot),
  type: FieldType.DATE_TIME as const,
  name,
  label,
  ...(isNullable ? { isNullable: true } : {}),
});

const selectField = (
  objectId: string,
  slot: number,
  name: string,
  label: string,
  values: string[],
) => ({
  universalIdentifier: fieldId(objectId, slot),
  type: FieldType.SELECT as const,
  name,
  label,
  options: selectOptions(values),
});

export const domainFields: Record<AssuranceObjectName, (objectId: string) => AssuranceField[]> = {
  sourceConnection: (objectId) => [
    textField(objectId, 9, "provider", "Provider"),
    selectField(objectId, 10, "connectionStatus", "Connection Status", [
      "active",
      "paused",
      "revoked",
    ]),
  ],
  sellerIdentity: (objectId) => [
    textField(objectId, 9, "sellerExternalId", "Seller External ID"),
    textField(objectId, 10, "displayName", "Display Name"),
  ],
  opportunityReference: (objectId) => [
    textField(objectId, 9, "opportunityExternalId", "Opportunity External ID"),
    textField(objectId, 10, "stage", "Stage"),
  ],
  event: (objectId) => [
    textField(objectId, 9, "eventType", "Event Type"),
    dateTimeField(objectId, 10, "occurredAt", "Occurred At"),
  ],
  promise: (objectId) => [
    textField(objectId, 9, "promiseType", "Promise Type"),
    dateTimeField(objectId, 10, "dueAt", "Due At", true),
  ],
  conformancePolicy: (objectId) => [
    textField(objectId, 9, "policyVersion", "Policy Version"),
    selectField(objectId, 10, "policyStatus", "Policy Status", [
      "draft",
      "active",
      "retired",
    ]),
    {
      universalIdentifier: fieldId(objectId, 11),
      type: FieldType.RAW_JSON,
      name: "ruleSet",
      label: "Rule Set",
    },
  ],
  detectorCandidate: (objectId) => [
    textField(objectId, 9, "detectorType", "Detector Type"),
    {
      universalIdentifier: fieldId(objectId, 10),
      type: FieldType.NUMBER,
      name: "confidence",
      label: "Confidence",
    },
  ],
  assuranceCase: (objectId) => [
    selectField(objectId, 9, "caseStatus", "Case Status", [
      ...ASSURANCE_CASE_STATUS_VALUES,
    ]),
    textField(objectId, 10, "sellerIdentityId", "Seller Identity ID"),
    textField(objectId, 11, "failureType", "Failure Type"),
    textField(objectId, 12, "expectedBehavior", "Expected Behavior"),
    textField(objectId, 13, "actualBehavior", "Actual Behavior"),
    textField(objectId, 14, "exactDivergence", "Exact Divergence"),
    textField(objectId, 16, "actor", "Actor"),
    textField(objectId, 17, "system", "System"),
    dateTimeField(objectId, 18, "deadline", "Deadline", true),
    {
      universalIdentifier: fieldId(objectId, 19),
      type: FieldType.NUMBER,
      name: "confidence",
      label: "Confidence",
    },
    selectField(objectId, 20, "urgency", "Urgency", [...ASSURANCE_URGENCY_VALUES]),
    textField(objectId, 21, "recommendedHumanAction", "Recommended Human Action"),
    textField(objectId, 22, "detectorVersion", "Detector Version"),
    textField(objectId, 23, "policyVersion", "Policy Version"),
    {
      ...textField(objectId, 24, "dedupeKey", "Dedupe Key"),
      isUnique: true,
    },
  ],
  evidenceReference: (objectId) => [
    textField(objectId, 9, "evidenceType", "Evidence Type"),
    textField(objectId, 10, "contentHash", "Content Hash"),
  ],
  managerDisposition: (objectId) => [
    selectField(objectId, 9, "disposition", "Disposition", [
      "confirm",
      "dismiss",
      "needs-review",
    ]),
    textField(objectId, 10, "decidedBy", "Decided By"),
  ],
  outcome: (objectId) => [
    textField(objectId, 9, "outcomeType", "Outcome Type"),
    dateTimeField(objectId, 10, "outcomeAt", "Outcome At"),
  ],
};
