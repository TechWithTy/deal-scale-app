import { FieldType, RelationType } from "twenty-sdk/define";

import {
  ASSURANCE_OBJECTS,
  type AssuranceObjectName,
  fieldId,
} from "src/assurance/identifiers";

type RelationSpec = readonly [
  AssuranceObjectName,
  AssuranceObjectName,
  number,
  number,
  boolean,
];

const objectLabels: Record<AssuranceObjectName, string> = {
  sourceConnection: "Source Connection",
  sellerIdentity: "Seller Identity",
  opportunityReference: "Opportunity Reference",
  event: "Event",
  promise: "Promise",
  conformancePolicy: "Conformance Policy",
  detectorCandidate: "Detector Candidate",
  assuranceCase: "Assurance Case",
  evidenceReference: "Evidence Reference",
  managerDisposition: "Manager Disposition",
  outcome: "Outcome",
};

const objectPlurals: Record<AssuranceObjectName, string> = {
  sourceConnection: "sourceConnections",
  sellerIdentity: "sellerIdentities",
  opportunityReference: "opportunityReferences",
  event: "sellerEvents",
  promise: "promises",
  conformancePolicy: "conformancePolicies",
  detectorCandidate: "detectorCandidates",
  assuranceCase: "assuranceCases",
  evidenceReference: "evidenceReferences",
  managerDisposition: "managerDispositions",
  outcome: "outcomes",
};

const objectPluralLabels: Record<AssuranceObjectName, string> = {
  sourceConnection: "Source Connections",
  sellerIdentity: "Seller Identities",
  opportunityReference: "Opportunity References",
  event: "Events",
  promise: "Promises",
  conformancePolicy: "Conformance Policies",
  detectorCandidate: "Detector Candidates",
  assuranceCase: "Assurance Cases",
  evidenceReference: "Evidence References",
  managerDisposition: "Manager Dispositions",
  outcome: "Outcomes",
};

const relationSpecs: readonly RelationSpec[] = [
  ["sellerIdentity", "sourceConnection", 100, 200, false],
  ["opportunityReference", "sellerIdentity", 100, 200, false],
  ["opportunityReference", "sourceConnection", 101, 201, false],
  ["event", "opportunityReference", 100, 200, false],
  ["promise", "opportunityReference", 100, 201, false],
  ["detectorCandidate", "conformancePolicy", 100, 200, false],
  ["detectorCandidate", "event", 101, 200, true],
  ["assuranceCase", "opportunityReference", 100, 202, false],
  ["assuranceCase", "detectorCandidate", 101, 200, false],
  ["evidenceReference", "assuranceCase", 100, 203, false],
  ["evidenceReference", "event", 101, 201, true],
  ["managerDisposition", "assuranceCase", 100, 204, false],
  ["outcome", "assuranceCase", 100, 205, false],
  ["outcome", "managerDisposition", 101, 200, true],
];

export const relationField = ({
  objectId,
  slot,
  name,
  label,
  targetObjectId,
  targetFieldId,
  relationType,
  isNullable = false,
}: {
  objectId: string;
  slot: number;
  name: string;
  label: string;
  targetObjectId: string;
  targetFieldId: string;
  relationType: RelationType;
  isNullable?: boolean;
}) => ({
  universalIdentifier: fieldId(objectId, slot),
  type: FieldType.RELATION as const,
  name,
  label,
  relationTargetObjectMetadataUniversalIdentifier: targetObjectId,
  relationTargetFieldMetadataUniversalIdentifier: targetFieldId,
  ...(isNullable ? { isNullable: true } : {}),
  universalSettings: {
    relationType,
    joinColumnName:
      relationType === RelationType.MANY_TO_ONE ? `${name}Id` : null,
  },
});

export const relationFieldsFor = (objectName: AssuranceObjectName) => {
  const objectId = ASSURANCE_OBJECTS[objectName];
  const outgoingRelations = relationSpecs
    .filter(([from]) => from === objectName)
    .map(([from, to, slot, targetSlot, isNullable]) =>
      relationField({
        objectId: ASSURANCE_OBJECTS[from],
        slot,
        name: to,
        label: objectLabels[to],
        targetObjectId: ASSURANCE_OBJECTS[to],
        targetFieldId: fieldId(ASSURANCE_OBJECTS[to], targetSlot),
        relationType: RelationType.MANY_TO_ONE,
        isNullable,
      }),
    );
  const incomingRelations = relationSpecs
    .filter(([, to]) => to === objectName)
    .map(([from, _to, sourceSlot, inverseSlot]) =>
      relationField({
        objectId,
        slot: inverseSlot,
        name: objectPlurals[from],
        label: objectPluralLabels[from],
        targetObjectId: ASSURANCE_OBJECTS[from],
        targetFieldId: fieldId(ASSURANCE_OBJECTS[from], sourceSlot),
        relationType: RelationType.ONE_TO_MANY,
        isNullable: true,
      }),
    );

  return [...outgoingRelations, ...incomingRelations];
};

