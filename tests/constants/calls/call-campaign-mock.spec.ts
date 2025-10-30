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

                expect(second).toStrictEqual(first);
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

        test("datasets remain stable even when system time shifts dramatically", async () => {
                vi.useFakeTimers();

                try {
                        vi.resetModules();
                        vi.unstubAllEnvs();
                        vi.setSystemTime(new Date("2020-01-01T00:00:00.000Z"));

                        const firstModule = await import(MODULE_PATH);
                        const firstFallback = firstModule.fallbackCallCampaignData;

                        vi.resetModules();
                        vi.unstubAllEnvs();
                        vi.setSystemTime(new Date("2030-12-31T23:59:59.000Z"));

                        const secondModule = await import(MODULE_PATH);
                        const secondFallback = secondModule.fallbackCallCampaignData;

                        expect(secondFallback).toStrictEqual(firstFallback);

                        vi.resetModules();
                        vi.unstubAllEnvs();
                        vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

                        vi.setSystemTime(new Date("2018-06-15T12:00:00.000Z"));
                        const firstMockModule = await import(MODULE_PATH);
                        const firstMock = firstMockModule.mockCallCampaignData ?? [];

                        vi.resetModules();
                        vi.unstubAllEnvs();
                        vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");
                        vi.setSystemTime(new Date("2035-03-20T08:30:00.000Z"));

                        const secondMockModule = await import(MODULE_PATH);
                        const secondMock = secondMockModule.mockCallCampaignData ?? [];

                        const sumCalls = (campaigns: unknown[]) =>
                                (campaigns as { calls?: number }[]).reduce(
                                        (total, item) => total + (item.calls ?? 0),
                                        0,
                                );

                        expect(secondMock).toStrictEqual(firstMock);
                        expect(sumCalls(secondMock)).toBe(sumCalls(firstMock));
                } finally {
                        vi.useRealTimers();
                        vi.unstubAllEnvs();
                }
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
