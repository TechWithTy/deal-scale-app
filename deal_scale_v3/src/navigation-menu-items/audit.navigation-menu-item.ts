import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "src/assurance-surfaces/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "bf4a182c-2c70-4c2f-81d7-3d86f37f8214",
  name: "Audit",
  icon: "IconClipboardCheck",
  position: 1,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.auditResultsPageLayout,
});
