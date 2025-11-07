import { beforeEach, describe, expect, it } from "vitest";
import { usePushStore } from "../pushStore";

describe("pushStore", () => {
	beforeEach(() => {
		usePushStore.getState().reset();
	});

	it("initializes with default values", () => {
		const state = usePushStore.getState();
		expect(state.isSupported).toBe(false);
		expect(state.permission).toBe("default");
		expect(state.subscription).toBeNull();
		expect(state.isRegistering).toBe(false);
		expect(state.lastPromptAt).toBeNull();
	});

	it("updates support and permission flags", () => {
		usePushStore.getState().setSupported(true);
		usePushStore.getState().setPermission("granted");
		const state = usePushStore.getState();
		expect(state.isSupported).toBe(true);
		expect(state.permission).toBe("granted");
	});

	it("stores subscriptions as JSON payloads", () => {
		const subscription = {
			endpoint: "https://example.com/endpoint",
			expirationTime: null,
			keys: {
				auth: "auth-token",
				p256dh: "p256dh-key",
			},
		} satisfies PushSubscriptionJSON;

		usePushStore.getState().setSubscription(subscription);
		const state = usePushStore.getState();
		expect(state.subscription).toEqual(subscription);
		expect(typeof state.lastUpdatedAt).toBe("number");
	});

	it("records when prompts occur", () => {
		usePushStore.getState().recordPrompt(123);
		expect(usePushStore.getState().lastPromptAt).toBe(123);
	});

	it("resets to initial state", () => {
		usePushStore.getState().setSupported(true);
		usePushStore.getState().setPermission("denied");
		usePushStore.getState().setSubscription(null);
		usePushStore.getState().recordPrompt(Date.now());
		usePushStore.getState().reset();
		const state = usePushStore.getState();
		expect(state.isSupported).toBe(false);
		expect(state.permission).toBe("default");
		expect(state.subscription).toBeNull();
		expect(state.lastPromptAt).toBeNull();
	});
});
