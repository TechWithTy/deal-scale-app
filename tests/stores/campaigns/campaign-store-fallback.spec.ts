import { describe, expect, it, vi } from "vitest";

const STORE_MODULE = "@/lib/stores/campaigns";
const CALL_CAMPAIGN_MODULE = "@/constants/_faker/calls/callCampaign";

const loadCampaignStore = async () => {
	vi.resetModules();
	vi.unstubAllEnvs();
	vi.stubEnv("NEXT_PUBLIC_APP_TESTING_MODE", "dev");

	const { fallbackCallCampaignData } = await import(CALL_CAMPAIGN_MODULE);
	const { useCampaignStore } = await import(STORE_MODULE);

	return {
		fallback: fallbackCallCampaignData,
		state: useCampaignStore.getState(),
	};
};

describe("useCampaignStore fallback data", () => {
	it("matches fallback call campaigns across reloads", async () => {
		const first = await loadCampaignStore();
		expect(first.state.campaignsByType.call).toStrictEqual(first.fallback);

		const second = await loadCampaignStore();
		expect(second.state.campaignsByType.call).toStrictEqual(second.fallback);
		expect(second.fallback).toStrictEqual(first.fallback);

		vi.unstubAllEnvs();
	});
});
