"use client";

import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DraftPayload = Record<string, unknown>;

export interface CampaignDraft {
	id: string;
	name: string;
	payload: DraftPayload;
	channels?: string[];
	updatedAt: number;
	isOffline: boolean;
}

interface CampaignDraftInput {
	id?: string;
	name: string;
	payload: DraftPayload;
	channels?: string[];
	isOffline?: boolean;
}

interface CampaignDraftState {
	drafts: Record<string, CampaignDraft>;
	upsertDraft: (draft: CampaignDraftInput) => string;
	updateDraft: (
		id: string,
		payload: Partial<Omit<CampaignDraftInput, "id">>,
	) => void;
	markQueued: (id: string) => void;
	markSynced: (id: string) => void;
	removeDraft: (id: string) => void;
	clearAll: () => void;
	getPendingDrafts: () => CampaignDraft[];
}

const STORAGE_KEY = "dealscale:campaign-drafts";

export const useCampaignDraftStore = create<CampaignDraftState>()(
	persist(
		(set, get) => ({
			drafts: {},
			upsertDraft: (draft) => {
				const id = draft.id ?? `draft_${nanoid()}`;
				const now = Date.now();
				set((state) => ({
					drafts: {
						...state.drafts,
						[id]: {
							id,
							name: draft.name,
							payload: {
								...(state.drafts[id]?.payload ?? {}),
								...draft.payload,
							},
							channels: draft.channels ?? state.drafts[id]?.channels ?? [],
							updatedAt: now,
							isOffline: draft.isOffline ?? state.drafts[id]?.isOffline ?? true,
						},
					},
				}));
				return id;
			},
			updateDraft: (id, payload) => {
				set((state) => {
					const existing = state.drafts[id];
					if (!existing) return state;
					return {
						drafts: {
							...state.drafts,
							[id]: {
								...existing,
								name: payload.name ?? existing.name,
								channels: payload.channels ?? existing.channels,
								payload: {
									...existing.payload,
									...(payload.payload ?? {}),
								},
								updatedAt: Date.now(),
								isOffline: payload.isOffline ?? existing.isOffline,
							},
						},
					};
				});
			},
			markQueued: (id) => {
				set((state) => {
					const existing = state.drafts[id];
					if (!existing) return state;
					return {
						drafts: {
							...state.drafts,
							[id]: { ...existing, isOffline: true, updatedAt: Date.now() },
						},
					};
				});
			},
			markSynced: (id) => {
				set((state) => {
					const existing = state.drafts[id];
					if (!existing) return state;
					return {
						drafts: {
							...state.drafts,
							[id]: { ...existing, isOffline: false, updatedAt: Date.now() },
						},
					};
				});
			},
			removeDraft: (id) => {
				set((state) => {
					const next = { ...state.drafts };
					delete next[id];
					return { drafts: next };
				});
			},
			clearAll: () => set({ drafts: {} }),
			getPendingDrafts: () => {
				return Object.values(get().drafts)
					.filter((draft) => draft.isOffline)
					.sort((a, b) => b.updatedAt - a.updatedAt);
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
		},
	),
);
