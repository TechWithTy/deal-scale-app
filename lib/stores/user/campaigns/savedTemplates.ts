import type { SavedCampaignTemplate } from "@/types/userProfile";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { useUserProfileStore } from "../userProfile";

interface SavedCampaignTemplatesState {
	list: () => SavedCampaignTemplate[];
	createTemplate: (input: {
		name: string;
		description?: string;
		campaignConfig: SavedCampaignTemplate["campaignConfig"];
		priority?: boolean;
		monetization?: SavedCampaignTemplate["monetization"];
	}) => string; // returns id
	updateTemplate: (
		id: string,
		patch: Partial<
			Pick<
				SavedCampaignTemplate,
				"name" | "description" | "campaignConfig" | "priority" | "monetization"
			>
		>,
	) => void;
	deleteTemplate: (id: string) => void;
	applyTemplate: (id: string) => SavedCampaignTemplate["campaignConfig"] | null;
}

export const useSavedCampaignTemplatesStore =
	create<SavedCampaignTemplatesState>(() => ({
		list: () =>
			useUserProfileStore.getState().userProfile?.savedCampaignTemplates ?? [],

		createTemplate: ({
			name,
			description,
			campaignConfig,
			priority,
			monetization,
		}) => {
			const id = uuidv4();
			const now = new Date();
			const current =
				useUserProfileStore.getState().userProfile?.savedCampaignTemplates ??
				[];
			const next: SavedCampaignTemplate[] = [
				...current,
				{
					id,
					name,
					description,
					campaignConfig,
					createdAt: now,
					updatedAt: now,
					...(priority !== undefined ? { priority } : {}),
					...(monetization !== undefined ? { monetization } : {}),
				},
			];
			useUserProfileStore
				.getState()
				.updateUserProfile({ savedCampaignTemplates: next });
			return id;
		},

		updateTemplate: (id, patch) => {
			const current =
				useUserProfileStore.getState().userProfile?.savedCampaignTemplates ??
				[];
			const next = current.map((t) =>
				t.id === id
					? {
							...t,
							...patch,
							updatedAt: new Date(),
						}
					: t,
			);
			useUserProfileStore
				.getState()
				.updateUserProfile({ savedCampaignTemplates: next });
		},

		deleteTemplate: (id) => {
			const current =
				useUserProfileStore.getState().userProfile?.savedCampaignTemplates ??
				[];
			const next = current.filter((t) => t.id !== id);
			useUserProfileStore
				.getState()
				.updateUserProfile({ savedCampaignTemplates: next });
		},

		applyTemplate: (id) => {
			const template = useUserProfileStore
				.getState()
				.userProfile?.savedCampaignTemplates.find((t) => t.id === id);
			return template?.campaignConfig ?? null;
		},
	}));
