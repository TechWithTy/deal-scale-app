import { describe, expect, it } from "vitest";

import sellerJourneysComponent from "../src/front-components/seller-journeys";
import promiseLedgerComponent from "../src/front-components/promise-ledger";
import sellerJourneysLayout from "../src/page-layouts/seller-journeys.page-layout";
import promiseLedgerLayout from "../src/page-layouts/promise-ledger.page-layout";
import sellerJourneysNavigation from "../src/navigation-menu-items/seller-journeys.navigation-menu-item";
import promiseLedgerNavigation from "../src/navigation-menu-items/promise-ledger.navigation-menu-item";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("Seller Journeys and Promise Ledger manifest contracts", () => {
  it("registers dedicated front components with valid UUID v4 identifiers", () => {
    expect(sellerJourneysComponent.config.universalIdentifier).toMatch(UUID_V4);
    expect(promiseLedgerComponent.config.universalIdentifier).toMatch(UUID_V4);
    expect(sellerJourneysComponent.config.name).toContain("Seller Journeys");
    expect(promiseLedgerComponent.config.name).toContain("Promise Ledger");
  });

  it("connects each page layout widget to its dedicated front component", () => {
    const sellerWidget = sellerJourneysLayout.config.tabs?.[0]?.widgets?.[0];
    const promiseWidget = promiseLedgerLayout.config.tabs?.[0]?.widgets?.[0];

    expect(sellerJourneysLayout.config.universalIdentifier).toMatch(UUID_V4);
    expect(promiseLedgerLayout.config.universalIdentifier).toMatch(UUID_V4);
    expect(sellerWidget?.configuration.frontComponentUniversalIdentifier).toBe(
      sellerJourneysComponent.config.universalIdentifier,
    );
    expect(promiseWidget?.configuration.frontComponentUniversalIdentifier).toBe(
      promiseLedgerComponent.config.universalIdentifier,
    );
  });

  it("uses page-layout navigation targets instead of exposing CRM internals", () => {
    expect(sellerJourneysNavigation.config.type).toBe("PAGE_LAYOUT");
    expect(promiseLedgerNavigation.config.type).toBe("PAGE_LAYOUT");
    expect(sellerJourneysNavigation.config.pageLayoutUniversalIdentifier).toBe(
      sellerJourneysLayout.config.universalIdentifier,
    );
    expect(promiseLedgerNavigation.config.pageLayoutUniversalIdentifier).toBe(
      promiseLedgerLayout.config.universalIdentifier,
    );
  });
});
