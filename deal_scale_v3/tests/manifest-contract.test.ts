import { describe, expect, it } from "vitest";

import { FieldType } from "twenty-sdk/define";

import { assuranceFieldsFor } from "../src/assurance/fields";
import {
  ASSURANCE_OBJECTS,
  type AssuranceObjectName,
} from "../src/assurance/identifiers";
import { ASSURANCE_OBJECT_DEFINITIONS } from "../src/assurance/schema";
import eventObject from "../src/objects/event";

const expectedFields: Record<AssuranceObjectName, string[]> = {
  sourceConnection: ["provider", "connectionStatus"],
  sellerIdentity: ["sourceConnection", "sellerExternalId", "displayName"],
  opportunityReference: [
    "sellerIdentity",
    "sourceConnection",
    "opportunityExternalId",
    "stage",
  ],
  event: ["opportunityReference", "eventType", "occurredAt"],
  promise: ["opportunityReference", "promiseType", "dueAt"],
  conformancePolicy: ["policyVersion", "policyStatus", "ruleSet"],
  detectorCandidate: [
    "conformancePolicy",
    "event",
    "detectorType",
    "confidence",
  ],
  assuranceCase: [
    "opportunityReference",
    "detectorCandidate",
    "caseStatus",
  ],
  evidenceReference: ["assuranceCase", "event", "evidenceType", "contentHash"],
  managerDisposition: ["assuranceCase", "disposition", "decidedBy"],
  outcome: [
    "assuranceCase",
    "managerDisposition",
    "outcomeType",
    "outcomeAt",
  ],
};

const fieldsByObject = new Map(
  ASSURANCE_OBJECT_DEFINITIONS.map((objectName) => [
    objectName,
    assuranceFieldsFor(objectName),
  ]),
);

describe("assurance object manifest contracts", () => {
  it("uses a non-reserved Twenty API name for the Event object", () => {
    expect(eventObject.config.nameSingular).toBe("sellerEvent");
    expect(eventObject.config.namePlural).toBe("sellerEvents");
  });

  it("maps every contract domain field into object metadata", () => {
    for (const objectName of ASSURANCE_OBJECT_DEFINITIONS) {
      const fields = fieldsByObject.get(objectName) ?? [];
      const names = new Set(fields.map((field) => field.name));

      for (const fieldName of expectedFields[objectName]) {
        expect(names, `${objectName}.${fieldName}`).toContain(fieldName);
      }
    }
  });

  it("uses reciprocal relation fields instead of target name fields", () => {
    for (const [objectName, fields] of fieldsByObject) {
      for (const field of fields) {
        if (field.type !== FieldType.RELATION) continue;

        const targetFields = fieldsByObject.get(
          objectNameForId(field.relationTargetObjectMetadataUniversalIdentifier),
        );
        const targetField = targetFields?.find(
          (candidate) =>
            candidate.universalIdentifier ===
            field.relationTargetFieldMetadataUniversalIdentifier,
        );

        expect(targetField, `${objectName}.${field.name} target`).toBeDefined();
        expect(targetField?.type).toBe(FieldType.RELATION);
        expect(targetField?.relationTargetObjectMetadataUniversalIdentifier).toBe(
          ASSURANCE_OBJECTS[objectName],
        );
        expect(targetField?.relationTargetFieldMetadataUniversalIdentifier).toBe(
          field.universalIdentifier,
        );
      }
    }
  });
});

function objectNameForId(objectId: string): AssuranceObjectName {
  const objectName = (Object.entries(ASSURANCE_OBJECTS) as [
    AssuranceObjectName,
    string,
  ][]).find(([, id]) => id === objectId)?.[0];

  if (!objectName) throw new Error(`Unknown assurance object ID: ${objectId}`);
  return objectName;
}

