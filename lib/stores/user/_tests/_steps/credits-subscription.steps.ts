import assert from "node:assert";
import { useUserSubscriptionStore } from "@/lib/stores/user/subscription";
import { useUserCreditsStore } from "@/lib/stores/user/userProfile";
import { Before, Given, Then, When } from "@cucumber/cucumber";

let ctx: any = {};
Before(() => {
	ctx = {};
});

Given("I have the Credits store", () => {
	ctx.credits = useUserCreditsStore.getState();
	assert.ok(ctx.credits, "Credits store not available");
});

When("I read the remaining credits", () => {
	ctx.remaining = ctx.credits.remaining();
});

Then(
	"the remaining credits return numbers for ai, leads and skipTraces",
	() => {
		for (const key of ["ai", "leads", "skipTraces"]) {
			assert.strictEqual(
				typeof ctx.remaining[key],
				"number",
				`Remaining ${key} is not a number`,
			);
		}
	},
);

Given("I have the Subscription store", () => {
	ctx.sub = useUserSubscriptionStore.getState();
	assert.ok(ctx.sub, "Subscription store not available");
});

When("I read the plan name and status", () => {
	ctx.planName = ctx.sub.planName();
	ctx.status = ctx.sub.status();
});

Then(
	"the plan name is a string and status is one of active, inactive or unknown",
	() => {
		assert.strictEqual(typeof ctx.planName, "string");
		assert.ok(["active", "inactive", "unknown"].includes(ctx.status));
	},
);
