import { defineObject } from "twenty-sdk/define";

import { assuranceFieldsFor } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.event;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "sellerEvent",
  namePlural: "sellerEvents",
  labelSingular: "Event",
  labelPlural: "Events",
  description: "Observed or inferred seller-journey event.",
  icon: "IconTimelineEvent",
  fields: assuranceFieldsFor("event"),
});

