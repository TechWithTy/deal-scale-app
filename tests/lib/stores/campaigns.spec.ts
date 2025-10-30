import { describe, expect, test, vi } from "vitest";

const STORE_MODULE = "@/lib/stores/campaigns";
const CAMPAIGN_MODULE = "@/constants/_faker/calls/callCampaign";

describe("campaign store hydration", () => {
        test(
                "call campaigns align with fallback dataset",
                async () => {
                        vi.resetModules();
                        vi.unstubAllEnvs();
                        vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

                        const { fallbackCallCampaignData } = await import(
                                CAMPAIGN_MODULE,
                        );
                        const { useCampaignStore } = await import(STORE_MODULE);

                        expect(
                                useCampaignStore.getState().campaignsByType.call,
                        ).toStrictEqual(fallbackCallCampaignData);

                        vi.resetModules();
                        vi.unstubAllEnvs();
                        vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

                        const fallbackAgain = (
                                await import(CAMPAIGN_MODULE)
                        ).fallbackCallCampaignData;
                        const storeAgain = (
                                await import(STORE_MODULE)
                        ).useCampaignStore;

                        expect(storeAgain.getState().campaignsByType.call).toStrictEqual(
                                fallbackAgain,
                        );

                        vi.unstubAllEnvs();
                },
                20000,
        );
});
