import { getCampaignStatus } from "@/lib/api/public-api-dashboard";
import { persistPublicApiCampaignId } from "@/lib/api/public-api-campaign-launch";
import { usePublicApiCampaignStatus } from "@/hooks/usePublicApiCampaignStatus";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/public-api-dashboard", () => ({
	getCampaignStatus: vi.fn(),
}));

const mockedGetCampaignStatus = vi.mocked(getCampaignStatus);

describe("usePublicApiCampaignStatus", () => {
	beforeEach(() => {
		window.localStorage.clear();
		mockedGetCampaignStatus.mockReset();
	});

	afterEach(() => {
		window.localStorage.clear();
	});

	it("stays idle without a selected campaign", () => {
		const { result } = renderHook(() =>
			usePublicApiCampaignStatus(null, "token-123"),
		);

		expect(result.current.source).toBe("idle");
		expect(mockedGetCampaignStatus).not.toHaveBeenCalled();
	});

	it("does not call the API without a public API token", async () => {
		const { result } = renderHook(() =>
			usePublicApiCampaignStatus("local-1", undefined),
		);

		await waitFor(() => expect(result.current.source).toBe("missing_token"));
		expect(mockedGetCampaignStatus).not.toHaveBeenCalled();
	});

	it("loads status using the persisted public campaign ID mapping", async () => {
		mockedGetCampaignStatus.mockResolvedValue({ status: "active" });
		persistPublicApiCampaignId("local-1", "public-1");

		const { result } = renderHook(() =>
			usePublicApiCampaignStatus("local-1", "token-123"),
		);

		await waitFor(() => expect(result.current.source).toBe("live"));
		expect(result.current).toMatchObject({
			publicCampaignId: "public-1",
			status: "active",
		});
		expect(mockedGetCampaignStatus).toHaveBeenCalledWith("public-1", "token-123");
	});
});
