import { describe, expect, it } from "vitest";
import { FieldType } from "twenty-sdk/define";

import { toTwentySelectValue } from "../src/assurance/common-fields";
import {
  ASSURANCE_FIXTURES,
  ASSURANCE_OBJECT_DEFINITIONS,
  ASSURANCE_OBJECT_IDS,
  ASSURANCE_RELATIONS,
  assuranceCaseSchema,
  detectorCandidateSchema,
  evidenceReferenceSchema,
  sourceConnectionSchema,
} from "../src/assurance/schema";
import { ASSURANCE_OBJECTS, fieldId } from "../src/assurance/identifiers";
import { assuranceFieldsFor } from "../src/assurance/fields";

const REQUESTED_CASE_STATUSES = [
  "needs-review",
  "confirmed-failure",
  "expected-behavior",
  "insufficient-evidence",
  "false-positive",
  "resolved",
  "outcome",
] as const;

const COMPLETE_CASE_FIELDS = {
  sellerIdentityId: "seller-001",
  failureType: "process_sla_breach",
  expectedBehavior: "contact lead",
  actualBehavior: "contacted after deadline",
  exactDivergence: "deadline exceeded by 30 minutes",
  evidenceReferences: [
    {
      id: "evidence-reference-001",
      evidenceType: "call-transcript",
      provenanceRef: "crm://call/call-001",
      sourceVersion: "crm-v3",
    },
  ],
  actor: "case-engine",
  system: "deal-scale",
  deadline: "2026-09-24T12:30:00.000Z",
  confidence: 0.91,
  urgency: "high",
  recommendedHumanAction: "review owner follow-up",
  detectorVersion: "detector-v1",
  policyVersion: "v2",
  dedupeKey: "case:workspace-001:candidate-001:opportunity-001",
} as const;

describe("P0 assurance schema", () => {
  it("defines every canonical assurance object with a stable UUID", () => {
    expect(ASSURANCE_OBJECT_DEFINITIONS).toHaveLength(11);
    expect(new Set(Object.values(ASSURANCE_OBJECT_IDS)).size).toBe(11);
    for (const universalIdentifier of Object.values(ASSURANCE_OBJECT_IDS)) {
      expect(universalIdentifier).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    }
  });

  it("keeps relations inside the canonical object set", () => {
    for (const [from, to] of ASSURANCE_RELATIONS) {
      expect(ASSURANCE_OBJECT_DEFINITIONS).toContain(from);
      expect(ASSURANCE_OBJECT_DEFINITIONS).toContain(to);
    }
  });

  it("validates representative observed and inferred fixtures", () => {
    expect(sourceConnectionSchema.parse(ASSURANCE_FIXTURES.sourceConnection).provenanceState).toBe(
      "observed",
    );
    expect(assuranceCaseSchema.parse(ASSURANCE_FIXTURES.assuranceCase).provenanceState).toBe(
      "inferred",
    );
  });

  it("normalizes Twenty select values at the canonical schema boundary", () => {
    const parsed = sourceConnectionSchema.parse({
      ...ASSURANCE_FIXTURES.sourceConnection,
      provenanceState: "OBSERVED",
      connectionStatus: "ACTIVE",
    });

    expect(parsed.provenanceState).toBe("observed");
    expect(parsed.connectionStatus).toBe("active");
  });

  it("aligns Event relation properties with the installed Twenty field name", () => {
    expect(detectorCandidateSchema.shape).toHaveProperty("sellerEventId");
    expect(detectorCandidateSchema.shape).not.toHaveProperty("eventId");
    expect(evidenceReferenceSchema.shape).toHaveProperty("sellerEventId");
    expect(evidenceReferenceSchema.shape).not.toHaveProperty("eventId");
  });

  it("accepts every requested assurance case state and rejects legacy states", () => {
    for (const caseStatus of REQUESTED_CASE_STATUSES) {
      expect(
        assuranceCaseSchema.parse({
          ...ASSURANCE_FIXTURES.assuranceCase,
          ...COMPLETE_CASE_FIELDS,
          caseStatus,
        }).caseStatus,
      ).toBe(caseStatus);
    }

    expect(() =>
      assuranceCaseSchema.parse({
        ...ASSURANCE_FIXTURES.assuranceCase,
        ...COMPLETE_CASE_FIELDS,
        caseStatus: "open",
      }),
    ).toThrow();
  });

  it("preserves every auditable assurance case field in the schema", () => {
    const parsed = assuranceCaseSchema.parse({
      ...ASSURANCE_FIXTURES.assuranceCase,
      ...COMPLETE_CASE_FIELDS,
      caseStatus: "needs-review",
    });

    expect(parsed).toMatchObject({
      ...COMPLETE_CASE_FIELDS,
      deadline: new Date(COMPLETE_CASE_FIELDS.deadline),
    });
    expect(parsed.deadline).toEqual(new Date(COMPLETE_CASE_FIELDS.deadline));
    expect(
      assuranceCaseSchema.parse({
        ...ASSURANCE_FIXTURES.assuranceCase,
        ...COMPLETE_CASE_FIELDS,
        caseStatus: "needs-review",
        deadline: null,
      }).deadline,
    ).toBeNull();
  });

  it("projects the auditable contract to the Twenty assurance case object", () => {
    const fields = assuranceFieldsFor("assuranceCase");
    const fieldNames = fields.map((field) => field.name);
    const fieldByName = new Map(fields.map((field) => [field.name, field]));

    expect(fieldNames).toEqual(
      expect.arrayContaining([
        "caseStatus",
        "sellerIdentityId",
        "failureType",
        "expectedBehavior",
        "actualBehavior",
        "exactDivergence",
        "evidenceReferences",
        "actor",
        "system",
        "deadline",
        "confidence",
        "urgency",
        "recommendedHumanAction",
        "detectorVersion",
        "policyVersion",
        "dedupeKey",
      ]),
    );

    expect(fields.find((field) => field.name === "dedupeKey")).toMatchObject({
      type: FieldType.TEXT,
      isUnique: true,
    });
    const caseStatusField = fieldByName.get("caseStatus");
    expect(caseStatusField).toMatchObject({ type: FieldType.SELECT });
    expect(caseStatusField?.options.map((option: { value: string }) => option.value)).toEqual(
      REQUESTED_CASE_STATUSES.map(toTwentySelectValue),
    );
    const urgencyField = fieldByName.get("urgency");
    expect(urgencyField).toMatchObject({ type: FieldType.SELECT });
    expect(urgencyField?.options.map((option: { value: string }) => option.value)).toEqual([
      "low",
      "medium",
      "high",
    ].map(toTwentySelectValue));
    expect(fieldByName.get("deadline")).toMatchObject({
      type: FieldType.DATE_TIME,
      isNullable: true,
    });
    const evidenceReferenceFields = fields.filter(
      (field) => field.name === "evidenceReferences",
    );
    expect(evidenceReferenceFields).toHaveLength(1);
    expect(evidenceReferenceFields[0]).toMatchObject({
      type: FieldType.RELATION,
      relationTargetObjectMetadataUniversalIdentifier: ASSURANCE_OBJECTS.evidenceReference,
      relationTargetFieldMetadataUniversalIdentifier: fieldId(
        ASSURANCE_OBJECTS.evidenceReference,
        100,
      ),
    });
  });

  it("keeps the detector candidate sellerEventId contract required and nullable", () => {
    expect(
      detectorCandidateSchema.parse({
        ...ASSURANCE_FIXTURES.assuranceCase,
        conformancePolicyId: "policy-001",
        sellerEventId: null,
        detectorType: "pricing-promise",
        confidence: 0.91,
      }).sellerEventId,
    ).toBeNull();
    expect(() =>
      detectorCandidateSchema.parse({
        ...ASSURANCE_FIXTURES.assuranceCase,
        conformancePolicyId: "policy-001",
        detectorType: "pricing-promise",
        confidence: 0.91,
      }),
    ).toThrow();
  });
});
