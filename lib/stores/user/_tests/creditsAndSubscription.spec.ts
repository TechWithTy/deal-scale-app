import { expect, test } from "@playwright/test";
import { useUserSubscriptionStore } from "../subscription";
import { useUserCreditsStore } from "../userProfile";

test("Credits and subscription selectors return numbers/strings", () => {
	const credits = useUserCreditsStore.getState();
	const remaining = credits.remaining();
	expect(typeof remaining.ai).toBe("number");
	expect(typeof remaining.leads).toBe("number");
	expect(typeof remaining.skipTraces).toBe("number");

	const sub = useUserSubscriptionStore.getState();
	expect(typeof sub.planName()).toBe("string");
	expect(["active", "inactive", "unknown"]).toContain(sub.status());
});
