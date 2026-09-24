import { defineObject } from "twenty-sdk/define";

import { commonFields, relationField } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

const objectId = ASSURANCE_OBJECTS.sellerIdentity;

export default defineObject({
  universalIdentifier: objectId,
  nameSingular: "sellerIdentity",
  namePlural: "sellerIdentities",
  labelSingular: "Seller Identity",
  labelPlural: "Seller Identities",
  description: "Canonical seller identity resolved from a source connection.",
  icon: "IconUser",
  fields: [
    ...commonFields(objectId),
    relationField({
      objectId,
      slot: 100,
      name: "sourceConnection",
      label: "Source Connection",
      targetObjectId: ASSURANCE_OBJECTS.sourceConnection,
    }),
  ],
});
