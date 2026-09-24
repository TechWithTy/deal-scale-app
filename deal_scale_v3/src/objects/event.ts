import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.event;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "event",
  namePlural: "events",
  labelSingular: "Event",
  labelPlural: "Events",
  description: "Observed or inferred seller-journey event.",
  icon: "IconTimelineEvent",
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
