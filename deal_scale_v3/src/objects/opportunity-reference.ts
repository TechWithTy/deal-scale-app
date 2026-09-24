import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.opportunityReference;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "opportunityReference",
  namePlural: "opportunityReferences",
  labelSingular: "Opportunity Reference",
  labelPlural: "Opportunity References",
  description: "Stable seller-journey opportunity reference across source systems.",
  icon: "IconTargetArrow",
  fields: [
    ...commonFields(objectId),
    relationField({
      objectId,
      slot: 100,
      name: "sellerIdentity",
      label: "Seller Identity",
      targetObjectId: ASSURANCE_OBJECTS.sellerIdentity,
    }),
    relationField({
      objectId,
      slot: 101,
      name: "sourceConnection",
      label: "Source Connection",
      targetObjectId: ASSURANCE_OBJECTS.sourceConnection,
    }),
  ],
});
