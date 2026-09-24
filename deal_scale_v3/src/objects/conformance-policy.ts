import { defineObject } from "twenty-sdk/define";

import { commonFields } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineObject({
  universalIdentifier: ASSURANCE_OBJECTS.conformancePolicy,
  nameSingular: "conformancePolicy",
  namePlural: "conformancePolicies",
  labelSingular: "Conformance Policy",
  labelPlural: "Conformance Policies",
  description: "Versioned policy used to evaluate seller-journey conformance.",
  icon: "IconScale",
  fields: commonFields(ASSURANCE_OBJECTS.conformancePolicy),
});
