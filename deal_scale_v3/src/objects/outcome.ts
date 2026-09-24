import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.outcome;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "outcome",
  namePlural: "outcomes",
  labelSingular: "Outcome",
  labelPlural: "Outcomes",
  description: "Observed result of an assurance case and its disposition.",
  icon: "IconFlagCheck",
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
      name: "managerDisposition",
      label: "Manager Disposition",
      targetObjectId: ASSURANCE_OBJECTS.managerDisposition,
    }),
  ],
});
