import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.assuranceCase;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "assuranceCase",
  namePlural: "assuranceCases",
  labelSingular: "Assurance Case",
  labelPlural: "Assurance Cases",
  description: "Auditable case joining a detector candidate to seller evidence.",
  icon: "IconBriefcase2",
  fields: [
    ...commonFields(objectId),
    relationField({
      objectId,
      slot: 100,
      name: "opportunityReference",
      label: "Opportunity Reference",
      targetObjectId: ASSURANCE_OBJECTS.opportunityReference,
    }),
    relationField({
      objectId,
      slot: 101,
      name: "detectorCandidate",
      label: "Detector Candidate",
      targetObjectId: ASSURANCE_OBJECTS.detectorCandidate,
    }),
  ],
});
