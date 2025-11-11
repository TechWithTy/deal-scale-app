import { create } from "zustand";

export interface PushState {
	isSupported: boolean;
	permission: NotificationPermission;
	subscription: PushSubscriptionJSON | null;
	isRegistering: boolean;
	lastPromptAt: number | null;
	lastUpdatedAt: number | null;
	setSupported: (supported: boolean) => void;
	setPermission: (permission: NotificationPermission) => void;
	setSubscription: (
		subscription: PushSubscription | PushSubscriptionJSON | null,
	) => void;
	setRegistering: (value: boolean) => void;
	recordPrompt: (timestamp?: number) => void;
	reset: () => void;
}

type PushSnapshot = Omit<
	PushState,
	| "setSupported"
	| "setPermission"
	| "setSubscription"
	| "setRegistering"
	| "recordPrompt"
	| "reset"
>;

const defaultState: PushSnapshot = {
	isSupported: false,
	permission: "default",
	subscription: null,
	isRegistering: false,
	lastPromptAt: null,
	lastUpdatedAt: null,
};

function toJson(
	subscription: PushSubscription | PushSubscriptionJSON | null,
): PushSubscriptionJSON | null {
	if (!subscription) return null;
	if (typeof subscription === "object" && "toJSON" in subscription) {
		return subscription.toJSON();
	}
	return subscription;
}

export const usePushStore = create<PushState>((set) => ({
	...defaultState,
	setSupported: (isSupported) => set({ isSupported }),
	setPermission: (permission) => set({ permission }),
	setSubscription: (subscription) =>
		set({
			subscription: toJson(subscription),
			lastUpdatedAt: subscription ? Date.now() : null,
		}),
	setRegistering: (value) => set({ isRegistering: value }),
	recordPrompt: (timestamp = Date.now()) => set({ lastPromptAt: timestamp }),
	reset: () => set({ ...defaultState }),
}));
