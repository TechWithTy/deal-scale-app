import assert from "node:assert";
import { useSkipTraceReportsStore } from "@/lib/stores/user/userProfile";
import { Before, Given, Then, When } from "@cucumber/cucumber";

let ctx: any = {};
Before(() => {
	ctx = {};
});

Given("I have the Skip Trace reports store", () => {
	ctx.store = useSkipTraceReportsStore.getState();
	assert.ok(ctx.store, "Skip Trace reports store not available");
});

When("I read the progress summary", () => {
	ctx.progress = ctx.store.progress();
});

Then("the progress summary contains step and stepPercent", () => {
	for (const key of ["step", "stepPercent"]) {
		assert.ok(
			Object.prototype.hasOwnProperty.call(ctx.progress, key),
			`Missing progress key ${key}`,
		);
	}
});

When("I read the headers summary", () => {
	ctx.headers = ctx.store.headers();
});

Then("the headers summary contains parsedCount and selectedCount", () => {
	for (const key of ["parsedCount", "selectedCount"]) {
		assert.ok(
			Object.prototype.hasOwnProperty.call(ctx.headers, key),
			`Missing headers key ${key}`,
		);
	}
});
