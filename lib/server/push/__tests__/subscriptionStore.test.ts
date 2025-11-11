import { beforeEach, describe, expect, it } from "vitest";
import type { StoredPushSubscription } from "../subscriptionStore";
import {
	clearPushSubscriptions,
	getPushSubscriptionByEndpoint,
	getPushSubscriptionsForUser,
	removePushSubscription,
	upsertPushSubscription,
} from "../subscriptionStore";

const exampleSubscription: StoredPushSubscription = {
	endpoint: "https://example.com/push/123",
	keys: {
		auth: "auth-token",
		p256dh: "p256dh-key",
	},
	userId: "user-123",
	createdAt: new Date().toISOString(),
	expirationTime: null,
	metadata: { channel: "campaign" },
};

describe("subscriptionStore", () => {
	beforeEach(() => {
		clearPushSubscriptions();
	});

	it("stores and retrieves subscriptions by user", () => {
		upsertPushSubscription(exampleSubscription);
		const subscriptions = getPushSubscriptionsForUser("user-123");
		expect(subscriptions).toHaveLength(1);
		expect(subscriptions[0]?.endpoint).toBe(exampleSubscription.endpoint);
	});

	it("overwrites existing subscription with same endpoint", () => {
		upsertPushSubscription(exampleSubscription);
		upsertPushSubscription({
			...exampleSubscription,
			metadata: { channel: "analytics" },
		});
		const stored = getPushSubscriptionByEndpoint(exampleSubscription.endpoint);
		expect(stored?.metadata).toEqual({ channel: "analytics" });
	});

	it("removes subscriptions by endpoint", () => {
		upsertPushSubscription(exampleSubscription);
		removePushSubscription(exampleSubscription.endpoint);
		expect(
			getPushSubscriptionByEndpoint(exampleSubscription.endpoint),
		).toBeUndefined();
		const forUser = getPushSubscriptionsForUser(exampleSubscription.userId);
		expect(forUser).toHaveLength(0);
	});

	it("returns empty arrays when user has no subscriptions", () => {
		const subscriptions = getPushSubscriptionsForUser("missing-user");
		expect(subscriptions).toEqual([]);
	});
});
