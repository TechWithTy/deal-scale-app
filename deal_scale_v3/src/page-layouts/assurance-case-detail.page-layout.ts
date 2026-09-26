import {
  definePageLayout,
  PageLayoutTabLayoutMode,
} from "twenty-sdk/define";

import { ASSURANCE_CASE_DETAIL_IDENTIFIERS } from "src/assurance-case-detail/contract";

export default definePageLayout({
  universalIdentifier: ASSURANCE_CASE_DETAIL_IDENTIFIERS.layout,
  name: "Assurance Case Detail",
  type: "STANDALONE_PAGE",
  tabs: [
    {
      universalIdentifier: ASSURANCE_CASE_DETAIL_IDENTIFIERS.tab,
      title: "Selected case",
      position: 0,
      icon: "IconShieldCheck",
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        {
          universalIdentifier: ASSURANCE_CASE_DETAIL_IDENTIFIERS.widget,
          title: "Assurance case detail",
          type: "FRONT_COMPONENT",
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
          configuration: {
            configurationType: "FRONT_COMPONENT",
            frontComponentUniversalIdentifier:
              ASSURANCE_CASE_DETAIL_IDENTIFIERS.frontComponent,
          },
        },
      ],
    },
  ],
});
