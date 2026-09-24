import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "7198e02b-e370-4962-b340-2e2470929e98",
  name: "Policies",
  icon: "IconScale",
  position: 4,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ASSURANCE_OBJECTS.conformancePolicy,
});
