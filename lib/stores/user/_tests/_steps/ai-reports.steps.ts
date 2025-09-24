import { Given, When, Then, Before } from "@cucumber/cucumber";
import assert from "node:assert";
import { useAIReportsStore } from "@/lib/stores/user/userProfile";

let ctx: any = {};
Before(() => {
	ctx = {};
});

Given("I have the AI reports store", () => {
	ctx.store = useAIReportsStore.getState();
	assert.ok(ctx.store, "AI reports store not available");
});

When("I read the Direct Mail summary", () => {
	ctx.dm = ctx.store.directMailSummary();
});

Then("the DM summary contains sent, delivered and failed", () => {
	assert.ok(Object.prototype.hasOwnProperty.call(ctx.dm, "sent"));
	assert.ok(Object.prototype.hasOwnProperty.call(ctx.dm, "delivered"));
	assert.ok(Object.prototype.hasOwnProperty.call(ctx.dm, "failed"));
});

When("I read the Social summary", function () {
	ctx.social = ctx.store.socialSummary();
});

Then(
	"the Social summary contains totalCampaigns and totalActions",
	function () {
		assert.ok(
			Object.prototype.hasOwnProperty.call(ctx.social, "totalCampaigns"),
		);
		assert.ok(Object.prototype.hasOwnProperty.call(ctx.social, "totalActions"));
	},
);

When("I read the Kanban summary", function () {
	ctx.kanban = ctx.store.kanbanSummary();
});

Then("the Kanban summary contains totalTasks", function () {
	assert.ok(Object.prototype.hasOwnProperty.call(ctx.kanban, "totalTasks"));
});
