import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "874e04ad-87bc-4cb1-b1fb-52aca77b4e89",
  name: "Promise Ledger",
  icon: "IconBook2",
  position: 3,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ASSURANCE_OBJECTS.promise,
});
