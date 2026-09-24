import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.evidenceReference;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "evidenceReference",
  namePlural: "evidenceReferences",
  labelSingular: "Evidence Reference",
  labelPlural: "Evidence References",
  description: "Immutable reference to evidence supporting an assurance case.",
  icon: "IconFileSearch",
  fields: [
    ...commonFields(objectId),
    relationField({
      objectId,
      slot: 100,
      name: "assuranceCase",
      label: "Assurance Case",
      targetObjectId: ASSURANCE_OBJECTS.assuranceCase,
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
