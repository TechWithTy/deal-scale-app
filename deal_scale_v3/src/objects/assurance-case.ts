import { defineObject } from "twenty-sdk/define";

import { assuranceFieldsFor } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.assuranceCase;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "assuranceCase",
  namePlural: "assuranceCases",
  labelSingular: "Assurance Case",
  labelPlural: "Assurance Cases",
  description: "Auditable case joining a detector candidate to seller evidence.",
  icon: "IconBriefcase2",
  fields: assuranceFieldsFor("assuranceCase"),
});
