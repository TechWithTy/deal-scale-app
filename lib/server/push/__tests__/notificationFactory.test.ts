import { describe, expect, it } from "vitest";
import {
	createCampaignUpdateNotification,
	createLeadReadyNotification,
} from "../notificationFactory";

describe("notificationFactory", () => {
	it("creates lead notification payload with context", () => {
		const payload = createLeadReadyNotification({
			listId: "list-123",
			leadId: "lead-456",
			leadName: "Jordan Miles",
			context: "campaign-results",
		});

		expect(payload.title).toContain("Jordan Miles");
		expect(payload.url).toBe(
			"/dashboard/lead-list/list-123/lead/lead-456?context=campaign-results",
		);
		expect(payload.data?.entity).toBe("lead");
		expect(payload.data?.context).toBe("campaign-results");
	});

	it("falls back to default context", () => {
		const payload = createLeadReadyNotification({
			listId: "list-1",
			leadId: "lead-1",
			leadName: "Sam Ava",
		});
		expect(payload.data?.context).toBe("lead-alert");
	});

	it("creates campaign update notification with default path", () => {
		const payload = createCampaignUpdateNotification({
			campaignId: "cmp-001",
			campaignName: "Summer Outreach",
		});
		expect(payload.url).toContain("campaignId=cmp-001");
		expect(payload.data?.entity).toBe("campaign");
	});
});
