import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.managerDisposition;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "managerDisposition",
  namePlural: "managerDispositions",
  labelSingular: "Manager Disposition",
  labelPlural: "Manager Dispositions",
  description: "Human review disposition for an assurance case.",
  icon: "IconUserCheck",
  fields: [
    ...commonFields(objectId),
    relationField({
      objectId,
      slot: 100,
      name: "assuranceCase",
      label: "Assurance Case",
      targetObjectId: ASSURANCE_OBJECTS.assuranceCase,
    }),
  ],
});
