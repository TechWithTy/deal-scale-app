import { defineNavigationMenuItem, NavigationMenuItemType } from "twenty-sdk/define";

import { ASSURANCE_OBJECTS } from "src/assurance/identifiers";

export default defineNavigationMenuItem({
  universalIdentifier: "bf4a182c-2c70-4c2f-81d7-3d86f37f8214",
  name: "Audit",
  icon: "IconClipboardCheck",
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: ASSURANCE_OBJECTS.event,
});
