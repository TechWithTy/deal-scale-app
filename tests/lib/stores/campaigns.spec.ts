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

        test(
                "campaign store hydration is stable across system time shifts",
                async () => {
                        vi.useFakeTimers({ shouldAdvanceTime: false });

                        try {
                                vi.resetModules();
                                vi.unstubAllEnvs();
                                vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");
                                vi.setSystemTime(new Date("2050-05-05T00:00:00.000Z"));

                                const futureCampaignModule = await import(CAMPAIGN_MODULE);
                                const expected = futureCampaignModule.fallbackCallCampaignData;
                                const futureStoreModule = await import(STORE_MODULE);
                                const futureState =
                                        futureStoreModule.useCampaignStore.getState().campaignsByType
                                                .call;

                                expect(futureState).toStrictEqual(expected);

                                vi.resetModules();
                                vi.unstubAllEnvs();
                                vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");
                                vi.setSystemTime(new Date("1990-05-05T00:00:00.000Z"));

                                const pastCampaignModule = await import(CAMPAIGN_MODULE);
                                const pastExpected = pastCampaignModule.fallbackCallCampaignData;
                                const pastStoreModule = await import(STORE_MODULE);
                                const pastState =
                                        pastStoreModule.useCampaignStore.getState().campaignsByType.call;

                                expect(pastExpected).toStrictEqual(expected);
                                expect(pastState).toStrictEqual(expected);
                        } finally {
                                vi.useRealTimers();
                                vi.unstubAllEnvs();
                        }
                },
                20000,
        );
});
