import { defineObject } from "twenty-sdk/define";

import { assuranceFieldsFor } from "src/assurance/fields";
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
  fields: assuranceFieldsFor("managerDisposition"),
});
