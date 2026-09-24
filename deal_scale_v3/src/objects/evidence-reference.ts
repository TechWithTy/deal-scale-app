import { defineObject } from "twenty-sdk/define";

import { assuranceFieldsFor } from "src/assurance/fields";
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
  fields: assuranceFieldsFor("evidenceReference"),
});
