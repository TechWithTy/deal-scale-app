import {
  definePageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from "twenty-sdk/define";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "src/assurance-surfaces/identifiers";

export default definePageLayout({
  universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.auditResultsPageLayout,
  name: "Audit Results",
  type: "STANDALONE_PAGE",
  tabs: [
    {
      universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.auditResultsPageTab,
      title: "Audit results",
      position: 0,
      icon: "IconClipboardCheck",
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: ASSURANCE_SURFACE_IDENTIFIERS.auditResultsWidget,
          title: "Audit results",
          type: "FRONT_COMPONENT",
          heightBehavior: PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
          configuration: {
            configurationType: "FRONT_COMPONENT",
            frontComponentUniversalIdentifier:
              ASSURANCE_SURFACE_IDENTIFIERS.auditResultsFrontComponent,
          },
        },
      ],
    },
  ],
});
