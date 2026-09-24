import { defineObject } from "twenty-sdk/define";

import { assuranceFieldsFor } from "src/assurance/fields";
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
  fields: assuranceFieldsFor("opportunityReference"),
});
