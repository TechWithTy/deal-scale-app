import { describe, expect, it } from "vitest";

import {
  ASSURANCE_FIXTURES,
  ASSURANCE_OBJECT_DEFINITIONS,
  ASSURANCE_OBJECT_IDS,
  ASSURANCE_RELATIONS,
  assuranceCaseSchema,
  sourceConnectionSchema,
} from "../src/assurance/schema";

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
});
