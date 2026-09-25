import { describe, expect, it } from "vitest";

import assuranceInboxFrontComponent from "../src/front-components/assurance-inbox";
import {
  ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS,
  createAssuranceInboxModel,
} from "../src/assurance/assurance-inbox";
import assuranceInboxNavigation from "../src/navigation-menu-items/assurance-inbox.navigation-menu-item";
import assuranceInboxPageLayout from "../src/page-layouts/assurance-inbox.page-layout";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("Assurance Inbox contracts", () => {
  it("uses valid UUID v4 identifiers for every owned Twenty entity", () => {
    for (const identifier of Object.values(ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS)) {
      expect(identifier).toMatch(UUID_V4);
    }
  });

  it("keeps the queue behind the assurance inbox feature flag", () => {
    const disabled = createAssuranceInboxModel({ role: "reviewer" });
    const enabled = createAssuranceInboxModel({
      role: "reviewer",
      featureFlags: { assurance_inbox: true },
    });

    expect(disabled.enabled).toBe(false);
    expect(disabled.cases).toHaveLength(0);
    expect(enabled.enabled).toBe(true);
    expect(enabled.cases.length).toBeGreaterThan(0);
  });

  it("exposes safe evidence signals while keeping CRM internals out of the view model", () => {
    const model = createAssuranceInboxModel({
      role: "reviewer",
      featureFlags: { assurance_inbox: true },
    });
    const firstCase = model.cases[0];

    expect(firstCase).toMatchObject({
      confidence: expect.any(Number),
      evidenceLabel: expect.any(String),
      provenanceLabel: expect.any(String),
      nextReviewLabel: expect.any(String),
    });
    expect(firstCase).not.toHaveProperty("workspaceId");
    expect(firstCase).not.toHaveProperty("externalId");
    expect(firstCase).not.toHaveProperty("opportunityReferenceId");
    expect(firstCase).not.toHaveProperty("detectorCandidateId");
    expect(firstCase).not.toHaveProperty("provenanceRef");
  });

  it("uses existing RBAC boundaries for review and disposition affordances", () => {
    const reviewer = createAssuranceInboxModel({
      role: "reviewer",
      featureFlags: { assurance_inbox: true },
    });
    const manager = createAssuranceInboxModel({
      role: "manager",
      featureFlags: { assurance_inbox: true },
    });

    expect(reviewer.canTakeDisposition).toBe(false);
    expect(manager.canTakeDisposition).toBe(true);
    expect(
      createAssuranceInboxModel({
        role: "reviewer",
        actorWorkspaceId: "00000000-0000-4000-8000-000000000099",
        featureFlags: { assurance_inbox: true },
      }).cases,
    ).toHaveLength(0);
  });

  it("wires the front component into a standalone page layout and owned nav item", () => {
    expect(assuranceInboxFrontComponent.success).toBe(true);
    expect(assuranceInboxFrontComponent.config.universalIdentifier).toBe(
      ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.frontComponent,
    );
    expect(assuranceInboxPageLayout.config.type).toBe("STANDALONE_PAGE");
    expect(assuranceInboxPageLayout.config.tabs?.[0]?.widgets?.[0]?.configuration).toMatchObject({
      configurationType: "FRONT_COMPONENT",
      frontComponentUniversalIdentifier:
        ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.frontComponent,
    });
    expect(assuranceInboxNavigation.config).toMatchObject({
      type: "PAGE_LAYOUT",
      pageLayoutUniversalIdentifier: ASSURANCE_INBOX_UNIVERSAL_IDENTIFIERS.pageLayout,
    });
  });
});
