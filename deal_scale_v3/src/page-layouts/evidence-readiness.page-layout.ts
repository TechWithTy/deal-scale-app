import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from "twenty-sdk/define";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "src/assurance-surfaces/identifiers";

export default definePageLayout({
  universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessPageLayout,
  name: "Evidence Readiness",
  type: "STANDALONE_PAGE",
  tabs: [
    {
      universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessPageTab,
      title: "Evidence readiness",
      position: 0,
      icon: "IconPlugConnected",
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessWidget,
          title: "Evidence readiness",
          type: "FRONT_COMPONENT",
          heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
          configuration: {
            configurationType: "FRONT_COMPONENT",
            frontComponentUniversalIdentifier:
              ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessFrontComponent,
          },
        },
      ],
    },
  ],
});
