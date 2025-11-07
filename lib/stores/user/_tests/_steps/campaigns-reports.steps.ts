import assert from "node:assert";
import { useUserCampaignReportsStore } from "@/lib/stores/user/userProfile";
import type { TransferType } from "@/types/_dashboard/campaign";
import { Before, Given, Then, When } from "@cucumber/cucumber";

let ctx: any = {};
Before(() => {
	ctx = {};
});

Given("I have the Campaign reports store", () => {
	ctx.store = useUserCampaignReportsStore.getState();
	assert.ok(ctx.store, "Campaign reports store not available");
});

When("I read the channel totals", () => {
	ctx.channels = ctx.store.channelTotals();
});

Then("the channel totals include text, dm, call and social", () => {
	for (const key of ["text", "dm", "call", "social"]) {
		assert.ok(
			Object.prototype.hasOwnProperty.call(ctx.channels, key),
			`Missing channel key ${key}`,
		);
	}
});

When("I read the status counts", () => {
	ctx.status = ctx.store.statusCounts();
});

Then("the status counts is an object", () => {
	assert.strictEqual(typeof ctx.status, "object");
});

When("I read the transfer breakdown", () => {
	ctx.transfers = ctx.store.transferBreakdown();
});

Then("the transfer breakdown keys are valid TransferType values", () => {
	const allowed: TransferType[] = [
		"chat_agent",
		"voice_inbound",
		"voice_outbound",
		"text",
		"social_media",
		"appraisal",
		"live_person",
		"live_person_calendar",
	];
	const keys = Object.keys(ctx.transfers || {});
	for (const k of keys) {
		assert.ok(
			allowed.includes(k as TransferType),
			`Invalid TransferType key: ${k}`,
		);
	}
});
