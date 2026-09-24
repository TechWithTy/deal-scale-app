import { defineObject } from "twenty-sdk/define";

import { assuranceFieldsFor } from "src/assurance/fields";
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
  fields: assuranceFieldsFor("outcome"),
});
