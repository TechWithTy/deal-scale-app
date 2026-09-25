import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { PROMISE_LEDGER_LAYOUT_UNIVERSAL_IDENTIFIER } from "src/seller-journeys/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "874e04ad-87bc-4cb1-b1fb-52aca77b4e89",
  name: "Promise Ledger",
  icon: "IconBook2",
  position: 3,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: PROMISE_LEDGER_LAYOUT_UNIVERSAL_IDENTIFIER,
});
