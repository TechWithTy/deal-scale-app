import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "src/assurance-surfaces/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "92790944-5312-4156-95d5-5c2b6b7cd309",
  name: "Integrations / Evidence Readiness",
  icon: "IconPlugConnected",
  position: 6,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  pageLayoutUniversalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessPageLayout,
});
