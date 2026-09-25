import { describe, expect, it } from "vitest";

import { ASSURANCE_SURFACE_IDENTIFIERS } from "../src/assurance-surfaces/identifiers";
import auditNavigation from "../src/navigation-menu-items/audit.navigation-menu-item";
import evidenceNavigation from "../src/navigation-menu-items/integrations-evidence.navigation-menu-item";
import auditResultsLayout from "../src/page-layouts/audit-results.page-layout";
import evidenceReadinessLayout from "../src/page-layouts/evidence-readiness.page-layout";

describe("assurance surface layout contracts", () => {
  it("places Audit Results in a standalone front-component page", () => {
    const config = auditResultsLayout.config;
    const widget = config.tabs?.[0]?.widgets?.[0];

    expect(config.type).toBe("STANDALONE_PAGE");
    expect(widget?.type).toBe("FRONT_COMPONENT");
    expect(widget?.configuration).toMatchObject({
      configurationType: "FRONT_COMPONENT",
      frontComponentUniversalIdentifier:
        ASSURANCE_SURFACE_IDENTIFIERS.auditResultsFrontComponent,
    });
    expect(widget?.position).toBeUndefined();
    expect(widget?.heightBehavior).toBe("FIT_CONTENT");
  });

  it("places Evidence Readiness in a standalone front-component page", () => {
    const config = evidenceReadinessLayout.config;
    const widget = config.tabs?.[0]?.widgets?.[0];

    expect(config.type).toBe("STANDALONE_PAGE");
    expect(widget?.type).toBe("FRONT_COMPONENT");
    expect(widget?.configuration).toMatchObject({
      configurationType: "FRONT_COMPONENT",
      frontComponentUniversalIdentifier:
        ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessFrontComponent,
    });
    expect(widget?.position).toBeUndefined();
    expect(widget?.heightBehavior).toBe("FIT_CONTENT");
  });

  it("wires the permitted sidebar entries to their owned layouts", () => {
    expect(auditNavigation.config.type).toBe("PAGE_LAYOUT");
    expect(auditNavigation.config.pageLayoutUniversalIdentifier).toBe(
      ASSURANCE_SURFACE_IDENTIFIERS.auditResultsPageLayout,
    );
    expect(evidenceNavigation.config.type).toBe("PAGE_LAYOUT");
    expect(evidenceNavigation.config.pageLayoutUniversalIdentifier).toBe(
      ASSURANCE_SURFACE_IDENTIFIERS.evidenceReadinessPageLayout,
    );
  });
});
