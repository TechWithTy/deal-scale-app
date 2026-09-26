import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS } from "src/assurance/assurance-inbox";

export default defineNavigationMenuItem({
  universalIdentifier: "9d321919-5138-41f7-92d2-20bea41154c0",
  name: "Assurance Inbox",
  icon: "IconInbox",
  position: 0,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.pageLayout,
});
