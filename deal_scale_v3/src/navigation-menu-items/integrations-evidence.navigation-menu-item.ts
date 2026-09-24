import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "92790944-5312-4156-95d5-5c2b6b7cd309",
  name: "Integrations / Evidence Readiness",
  icon: "IconPlugConnected",
  position: 6,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ASSURANCE_OBJECTS.sourceConnection,
});
