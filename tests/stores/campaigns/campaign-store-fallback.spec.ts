import { describe, expect, it } from "vitest";

import { useCampaignStore } from "@/lib/stores/campaigns";

describe("useCampaignStore fallback data", () => {
	it("stays stable after a reset", () => {
		const state = useCampaignStore.getState();
		const initialCallCampaigns = [...state.campaignsByType.call];

		expect(Array.isArray(initialCallCampaigns)).toBe(true);

		state.reset();
		expect(useCampaignStore.getState().campaignsByType.call).toStrictEqual(
			initialCallCampaigns,
		);
	});
});
