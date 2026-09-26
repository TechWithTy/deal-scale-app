import { definePageLayout, PageLayoutTabLayoutMode } from "twenty-sdk/define";

import {
  ASSURANCE_INBOX_OBJECT_UNIVERSAL_IDENTIFIER,
  ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS,
} from "src/assurance/assurance-inbox";

export default definePageLayout({
  universalIdentifier: ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.pageLayout,
  name: "Assurance Inbox",
  type: "STANDALONE_PAGE",
  objectUniversalIdentifier: ASSURANCE_INBOX_OBJECT_UNIVERSAL_IDENTIFIER,
  tabs: [
    {
      universalIdentifier: ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.pageLayoutTab,
      title: "Review queue",
      position: 0,
      icon: "IconInbox",
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.widget,
          title: " ",
          type: "FRONT_COMPONENT",
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
          configuration: {
            configurationType: "FRONT_COMPONENT",
            frontComponentUniversalIdentifier:
              ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.frontComponent,
          },
        },
      ],
    },
  ],
});
