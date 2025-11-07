import assert from "node:assert";
import { useUserLeadsReportsStore } from "@/lib/stores/user/userProfile";
import { Before, Given, Then, When } from "@cucumber/cucumber";

let ctx: any = {};
Before(() => {
	ctx = {};
});

Given("I have the Leads reports store", () => {
	ctx.store = useUserLeadsReportsStore.getState();
	assert.ok(ctx.store, "Leads reports store not available");
});

When("I read the DNC summary", () => {
	ctx.dnc = ctx.store.dncSummary();
});

Then("the DNC summary contains totalDNC, byFlag and bySource", () => {
	for (const key of ["totalDNC", "byFlag", "bySource"]) {
		assert.ok(
			Object.prototype.hasOwnProperty.call(ctx.dnc, key),
			`Missing DNC key ${key}`,
		);
	}
});

When("I read the leads status counts", () => {
	ctx.status = ctx.store.statusCounts();
});

Then("the leads status counts is an object", () => {
	assert.strictEqual(typeof ctx.status, "object");
});
