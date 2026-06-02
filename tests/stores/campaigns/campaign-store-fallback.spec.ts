import { describe, expect, it, vi } from "vitest";

describe("useCampaignStore fallback data", () => {
	it("matches fallback call campaigns", async () => {
		vi.resetModules();
		vi.unstubAllEnvs();
		vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

		const { fallbackCallCampaignData } = await import(
			"@/constants/_faker/calls/callCampaign"
		);
		const { useCampaignStore } = await import("@/lib/stores/campaigns");

		expect(useCampaignStore.getState().campaignsByType.call).toStrictEqual(
			fallbackCallCampaignData,
		);
		expect(useCampaignStore.getState().campaignsByType.call).not.toBe(
			fallbackCallCampaignData,
		);
	});
});
