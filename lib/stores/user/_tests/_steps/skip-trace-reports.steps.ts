import { Given, When, Then, Before } from "@cucumber/cucumber";
import assert from "node:assert";
import { useSkipTraceReportsStore } from "@/lib/stores/user/userProfile";

let ctx: any = {};
Before(() => {
	ctx = {};
});

Given("I have the Skip Trace reports store", function () {
	ctx.store = useSkipTraceReportsStore.getState();
	assert.ok(ctx.store, "Skip Trace reports store not available");
});

When("I read the progress summary", function () {
	ctx.progress = ctx.store.progress();
});

Then("the progress summary contains step and stepPercent", function () {
	for (const key of ["step", "stepPercent"]) {
		assert.ok(
			Object.prototype.hasOwnProperty.call(ctx.progress, key),
			`Missing progress key ${key}`,
		);
	}
});

When("I read the headers summary", function () {
	ctx.headers = ctx.store.headers();
});

Then("the headers summary contains parsedCount and selectedCount", function () {
	for (const key of ["parsedCount", "selectedCount"]) {
		assert.ok(
			Object.prototype.hasOwnProperty.call(ctx.headers, key),
			`Missing headers key ${key}`,
		);
	}
});
