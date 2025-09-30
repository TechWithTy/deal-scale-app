import { Before, Given, When, Then } from "@cucumber/cucumber";
import assert from "node:assert";
import {
	SUBSCRIPTION_TIERS,
	hasRequiredTier,
	resolveGuardBehavior,
	ensureValidTier,
	type FeatureGuardMode,
	type GuardBehaviorKey,
} from "@/constants/subscription/tiers";

type FeatureGuardCtx = {
	availableTiers: string[];
	userTier?: string;
	requiredTier?: string;
	allowed?: boolean;
	behaviorKey?: GuardBehaviorKey;
};

let ctx: FeatureGuardCtx;

Before(() => {
	ctx = { availableTiers: [] };
});

Given("the available tiers in ascending order:", (table) => {
	const tiers = table
		.hashes()
		.map((row: Record<string, string | undefined>) => row.Tier?.trim() ?? "");
	ctx.availableTiers = tiers;
	assert.deepStrictEqual(
		tiers,
		Array.from(SUBSCRIPTION_TIERS),
		"Tier order in feature file must match the canonical subscription tiers",
	);
});

Given("the user's subscription is {string}", (userTier: string) => {
	ctx.userTier = userTier;
});

When(
	"the user attempts to access a feature requiring {string}",
	(requiredTier: string) => {
		ctx.requiredTier = requiredTier;
		ctx.allowed = hasRequiredTier(ctx.userTier, requiredTier);
	},
);

Then("the access should be {string}", (expectedResult: string) => {
	assert.notStrictEqual(
		ctx.allowed,
		undefined,
		"Access evaluation was not performed before assertion",
	);
	const expected = expectedResult.trim().toLowerCase();
	switch (expected) {
		case "allowed":
			assert.strictEqual(ctx.allowed, true);
			break;
		case "blocked":
			assert.strictEqual(ctx.allowed, false);
			break;
		default:
			throw new Error(`Unknown expected result '${expectedResult}'`);
	}
});

Given("a feature requires {string}", (requiredTier: string) => {
	ctx.requiredTier = requiredTier;
});

When("the guard is configured with mode {string}", (modeText: string) => {
	const required = ctx.requiredTier;
	assert.ok(
		required,
		"Required tier must be set before configuring guard mode",
	);
	const normalizedMode = modeText.trim().toLowerCase() as FeatureGuardMode;
	assert.ok(
		["hide", "disable", "overlay"].includes(normalizedMode),
		`Unsupported guard mode '${modeText}'`,
	);
	const userTier = ensureValidTier(ctx.userTier);
	const allowed = hasRequiredTier(userTier, required);
	ctx.allowed = allowed;
	ctx.behaviorKey = resolveGuardBehavior(allowed, normalizedMode);
});

const BEHAVIOR_EXPECTATIONS: Record<string, GuardBehaviorKey> = {
	"not render the feature": "hidden",
	"render feature but disable interactions": "disabled",
	"show feature with upgrade overlay prompt": "overlay-blocked",
	"show overlay blocking access": "overlay-blocked",
	"no overlay, full access": "allowed",
};

Then("the UI should {string}", (expectedBehavior: string) => {
	assert.ok(
		ctx.behaviorKey,
		"Guard behavior must be evaluated before asserting UI outcome",
	);
	const canonical = BEHAVIOR_EXPECTATIONS[expectedBehavior.trim()];
	assert.ok(
		canonical,
		`Unknown expected behavior '${expectedBehavior}'. Update BEHAVIOR_EXPECTATIONS if new phrasing is introduced.`,
	);
	assert.strictEqual(
		ctx.behaviorKey,
		canonical,
		`Expected behavior '${expectedBehavior}' to resolve to ${canonical}, but received ${ctx.behaviorKey}`,
	);
});
