import { describe, expect, it } from "vitest";

import { deriveRecommendedEnrichmentOptions } from "@/components/reusables/modals/user/lead/utils/enrichmentRecommendations";

const makeSelection = (fields: Record<string, string>): Record<string, string | undefined> =>
        ({ ...fields });

describe("deriveRecommendedEnrichmentOptions", () => {
        it("selects email-centric tools when email data is mapped", () => {
                const selection = makeSelection({ emailField: "Email__0" });

                const options = deriveRecommendedEnrichmentOptions(selection);

                expect(options).toContain("email_intelligence");
                expect(options).not.toContain("phone_hunter");
        });

        it("includes phone enrichment when phone numbers are present", () => {
                const selection = makeSelection({ phone1Field: "Phone__0" });

                const options = deriveRecommendedEnrichmentOptions(selection);

                expect(options).toContain("phone_hunter");
        });

        it("falls back to premium options when no free tools are available", () => {
                const selection = makeSelection({ domainField: "Domain__0" });

                const options = deriveRecommendedEnrichmentOptions(selection);

                expect(options).toEqual(["domain_recon"]);
        });

        it("returns an empty list when required inputs are missing", () => {
                const selection = makeSelection({});

                const options = deriveRecommendedEnrichmentOptions(selection);

                expect(options).toEqual([]);
        });
});
