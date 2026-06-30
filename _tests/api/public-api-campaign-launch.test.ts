import {
	buildPublicApiCampaignPayload,
	getPublicApiCampaignId,
	launchPublicApiCampaign,
	persistPublicApiCampaignId,
	toPublicApiCampaignType,
} from "@/lib/api/public-api-campaign-launch";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("public API campaign launch mapper", () => {
	afterEach(() => {
		window.localStorage.clear();
		vi.unstubAllGlobals();
	});

	it.each([
		["call", "voice"],
		["text", "sms"],
		["email", "email"],
		["linkedin", "social"],
		["facebook", "social"],
		["directmail", "mixed"],
	])("maps %s channel to %s campaign type", (channel, expected) => {
		expect(toPublicApiCampaignType(channel)).toBe(expected);
	});

	it("builds a valid CampaignCreate payload", () => {
		const payload = buildPublicApiCampaignPayload({
			areaMode: "leadList",
			campaignName: "Dallas Buyers",
			estimatedCredits: 120,
			leadCount: 50,
			localCampaignId: "campaign-local",
			primaryChannel: "call",
			selectedLeadListId: "list-1",
			startDate: new Date("2026-06-29T00:00:00.000Z"),
		});

		expect(payload).toMatchObject({
			auto_start: true,
			campaign_type: "voice",
			name: "Dallas Buyers",
			status: "active",
			target_count: 50,
		});
		expect(payload.campaign_metadata).toMatchObject({
			estimatedCredits: 120,
			localCampaignId: "campaign-local",
			selectedLeadListId: "list-1",
		});
		expect(payload.workflow_config?.startDate).toBe(
			"2026-06-29T00:00:00.000Z",
		);
	});

	it("posts the mapped payload through the dashboard campaign wrapper", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({ campaign_id: "remote-1" }), {
					status: 200,
				});
			}),
		);

		await launchPublicApiCampaign({
			campaignName: "SMS Follow-up",
			leadCount: 10,
			localCampaignId: "local-1",
			primaryChannel: "text",
			token: "token-123",
		});

		const [path, init] = vi.mocked(fetch).mock.calls[0];
		expect(path).toBe("/api/v1/campaigns/");
		expect(init?.method).toBe("POST");
		expect((init?.headers as Headers).get("Authorization")).toBe(
			"Bearer token-123",
		);
		expect(JSON.parse(String(init?.body))).toMatchObject({
			campaign_type: "sms",
			name: "SMS Follow-up",
			target_count: 10,
		});
		expect(getPublicApiCampaignId("local-1")).toBe("remote-1");
	});

	it("persists local to public campaign ID mappings", () => {
		persistPublicApiCampaignId("local-campaign", "public-campaign");

		expect(getPublicApiCampaignId("local-campaign")).toBe("public-campaign");
		expect(getPublicApiCampaignId("unknown-campaign")).toBe("unknown-campaign");
	});
});
