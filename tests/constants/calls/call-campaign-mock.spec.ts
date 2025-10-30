import { describe, expect, test, vi } from "vitest";

const MODULE_PATH = "@/constants/_faker/calls/callCampaign";
const FAKER_PATH = "@faker-js/faker";

describe("call campaign mock data", () => {
        test("fallbackCallCampaignData remains stable without testing mode", async () => {
                vi.resetModules();
                vi.unstubAllEnvs();

                const firstModule = await import(MODULE_PATH);
                const first = firstModule.fallbackCallCampaignData;

                vi.resetModules();
                vi.unstubAllEnvs();

                const secondModule = await import(MODULE_PATH);
                const second = secondModule.fallbackCallCampaignData;

                expect(first).toHaveLength(100);
                expect(second).toHaveLength(100);

                const firstIds = first.slice(0, 10).map((campaign) => campaign.id);
                const secondIds = second.slice(0, 10).map((campaign) => campaign.id);

                expect(secondIds).toStrictEqual(firstIds);
        });

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

        test("importing call campaign mocks does not reseed the shared faker instance", async () => {
                vi.resetModules();
                vi.unstubAllEnvs();
                vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

                const { faker } = await import(FAKER_PATH);
                const seedSpy = vi.spyOn(faker, "seed");

                await import(MODULE_PATH);

                expect(seedSpy).not.toHaveBeenCalled();

                vi.unstubAllEnvs();
        });
});
