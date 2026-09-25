import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { SELLER_JOURNEYS_LAYOUT_UNIVERSAL_IDENTIFIER } from "src/seller-journeys/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "abc01661-598e-42bf-8b52-6993e61befa0",
  name: "Seller Journeys",
  icon: "IconRoute",
  position: 2,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: SELLER_JOURNEYS_LAYOUT_UNIVERSAL_IDENTIFIER,
});
