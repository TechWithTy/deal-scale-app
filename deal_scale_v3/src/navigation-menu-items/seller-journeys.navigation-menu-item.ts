import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "abc01661-598e-42bf-8b52-6993e61befa0",
  name: "Seller Journeys",
  icon: "IconRoute",
  position: 2,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ASSURANCE_OBJECTS.opportunityReference,
});
