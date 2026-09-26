import { definePageLayout, PageLayoutTabLayoutMode } from "twenty-sdk/define";

import {
  PROMISE_LEDGER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  PROMISE_LEDGER_LAYOUT_UNIVERSAL_IDENTIFIER,
  PROMISE_LEDGER_TAB_UNIVERSAL_IDENTIFIER,
  PROMISE_LEDGER_WIDGET_UNIVERSAL_IDENTIFIER,
} from "../seller-journeys/identifiers";

export default definePageLayout({
  universalIdentifier: PROMISE_LEDGER_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: "Promise Ledger",
  type: "STANDALONE_PAGE",
  tabs: [
    {
      universalIdentifier: PROMISE_LEDGER_TAB_UNIVERSAL_IDENTIFIER,
      title: "Ledger",
      position: 0,
      icon: "IconBook2",
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: PROMISE_LEDGER_WIDGET_UNIVERSAL_IDENTIFIER,
          title: "Promise Ledger",
          type: "FRONT_COMPONENT",
          configuration: {
            configurationType: "FRONT_COMPONENT",
            frontComponentUniversalIdentifier: PROMISE_LEDGER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
