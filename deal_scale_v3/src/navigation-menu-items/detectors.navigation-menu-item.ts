import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "20678282-0a21-47a6-b8e8-010eded25f99",
  name: "Detectors",
  icon: "IconRadar",
  position: 5,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ASSURANCE_OBJECTS.detectorCandidate,
});
