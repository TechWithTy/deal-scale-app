import { definePageLayout, PageLayoutTabLayoutMode } from "twenty-sdk/define";

import {
  SELLER_JOURNEYS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  SELLER_JOURNEYS_LAYOUT_UNIVERSAL_IDENTIFIER,
  SELLER_JOURNEYS_TAB_UNIVERSAL_IDENTIFIER,
  SELLER_JOURNEYS_WIDGET_UNIVERSAL_IDENTIFIER,
} from "../seller-journeys/identifiers";

export default definePageLayout({
  universalIdentifier: SELLER_JOURNEYS_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: "Seller Journeys",
  type: "STANDALONE_PAGE",
  tabs: [
    {
      universalIdentifier: SELLER_JOURNEYS_TAB_UNIVERSAL_IDENTIFIER,
      title: "Journey",
      position: 0,
      icon: "IconRoute",
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: SELLER_JOURNEYS_WIDGET_UNIVERSAL_IDENTIFIER,
          title: "Seller Journey",
          type: "FRONT_COMPONENT",
          configuration: {
            configurationType: "FRONT_COMPONENT",
            frontComponentUniversalIdentifier: SELLER_JOURNEYS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
