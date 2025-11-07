import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCampaignDraftStore } from "../campaignDraftStore";

const originalNow = Date.now;

function mockDateNow(value: number) {
	vi.spyOn(Date, "now").mockReturnValue(value);
}

describe("campaignDraftStore", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		Object.defineProperty(globalThis, "localStorage", {
			value: createMemoryStorage(),
			configurable: true,
		});
		useCampaignDraftStore.getState().clearAll();
	});

	it("creates drafts and marks them offline by default", () => {
		mockDateNow(1700000000000);
		const id = useCampaignDraftStore.getState().upsertDraft({
			name: "Launch Sellers",
			payload: { channel: "email" },
		});
		const draft = useCampaignDraftStore.getState().drafts[id];
		expect(draft?.isOffline).toBe(true);
		expect(draft?.updatedAt).toBe(1700000000000);
	});

	it("updates drafts and marks as synced", () => {
		const id = useCampaignDraftStore
			.getState()
			.upsertDraft({ name: "Launch Sellers", payload: {} });
		useCampaignDraftStore.getState().markSynced(id);
		const draft = useCampaignDraftStore.getState().drafts[id];
		expect(draft?.isOffline).toBe(false);
	});

	it("returns pending drafts queued for sync", () => {
		const store = useCampaignDraftStore.getState();
		const first = store.upsertDraft({ name: "Primary", payload: {} });
		const second = store.upsertDraft({ name: "Secondary", payload: {} });
		store.markSynced(second);
		const pending = store.getPendingDrafts();
		expect(pending.map((draft) => draft.id)).toEqual([first]);
	});
});

function createMemoryStorage() {
	let store: Record<string, string> = {};
	return {
		getItem(key: string) {
			return Object.prototype.hasOwnProperty.call(store, key)
				? store[key]
				: null;
		},
		setItem(key: string, value: string) {
			store[key] = value;
		},
		removeItem(key: string) {
			delete store[key];
		},
		clear() {
			store = {};
		},
	};
}
