import { defineObject } from "twenty-sdk/define";

import { assuranceFieldsFor } from "src/assurance/fields";
import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineObject({
  universalIdentifier: ASSURANCE_OBJECTS.sourceConnection,
  nameSingular: "sourceConnection",
  namePlural: "sourceConnections",
  labelSingular: "Source Connection",
  labelPlural: "Source Connections",
  description: "Tenant-scoped external system connection used as provenance.",
  icon: "IconPlugConnected",
  fields: assuranceFieldsFor("sourceConnection"),
});
