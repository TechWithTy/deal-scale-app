import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.detectorCandidate;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "detectorCandidate",
  namePlural: "detectorCandidates",
  labelSingular: "Detector Candidate",
  labelPlural: "Detector Candidates",
  description: "Candidate finding produced by a versioned detector.",
  icon: "IconRadar",
  fields: [
    ...commonFields(objectId),
    relationField({
      objectId,
      slot: 100,
      name: "conformancePolicy",
      label: "Conformance Policy",
      targetObjectId: ASSURANCE_OBJECTS.conformancePolicy,
    }),
    relationField({
      objectId,
      slot: 101,
      name: "event",
      label: "Event",
      targetObjectId: ASSURANCE_OBJECTS.event,
    }),
  ],
});
