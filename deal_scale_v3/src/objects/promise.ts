import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.promise;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "promise",
  namePlural: "promises",
  labelSingular: "Promise",
  labelPlural: "Promises",
  description: "Commercial or process promise made during the seller journey.",
  icon: "IconRosetteDiscountCheck",
  fields: [
    ...commonFields(objectId),
    relationField({
      objectId,
      slot: 100,
      name: "opportunityReference",
      label: "Opportunity Reference",
      targetObjectId: ASSURANCE_OBJECTS.opportunityReference,
    }),
  ],
});
