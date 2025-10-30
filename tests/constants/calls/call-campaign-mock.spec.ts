import { describe, expect, test, vi } from "vitest";

const MODULE_PATH = "@/constants/_faker/calls/callCampaign";

describe("call campaign mock data", () => {
        test("mockCallCampaignData remains stable across module reloads", async () => {
                vi.resetModules();
                vi.unstubAllEnvs();
                vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

                const firstModule = await import(MODULE_PATH);
                const first = firstModule.mockCallCampaignData;

                vi.resetModules();
                vi.unstubAllEnvs();
                vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

                const secondModule = await import(MODULE_PATH);
                const second = secondModule.mockCallCampaignData;

                expect(Array.isArray(first)).toBe(true);
                expect(Array.isArray(second)).toBe(true);

                const firstIds = (first || []).slice(0, 10).map((campaign) => campaign.id);
                const secondIds = (second || []).slice(0, 10).map((campaign) => campaign.id);

                expect(secondIds).toStrictEqual(firstIds);

                vi.unstubAllEnvs();
        });
});
