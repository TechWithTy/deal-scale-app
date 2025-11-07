import type { SavedWorkflow } from "@/types/userProfile";
import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";
import { useUserProfileStore } from "../userProfile";

interface SavedWorkflowsState {
	list: () => SavedWorkflow[];
	createWorkflow: (input: {
		name: string;
		description?: string;
		platform: "n8n" | "make" | "kestra";
		workflowConfig: any;
		aiPrompt?: string;
		generatedByAI?: boolean;
		monetization?: {
			enabled: boolean;
			priceMultiplier: number;
			isPublic: boolean;
			acceptedTerms: boolean;
		};
	}) => string; // returns id
	updateWorkflow: (
		id: string,
		patch: Partial<
			Pick<
				SavedWorkflow,
				"name" | "description" | "workflowConfig" | "platform"
			>
		>,
	) => void;
	deleteWorkflow: (id: string) => void;
	exportToPlatform: (
		id: string,
		platform: "n8n" | "make" | "kestra",
	) => SavedWorkflow | null;
	toggleMonetization: (id: string) => void;
}

export const useSavedWorkflowsStore = create<SavedWorkflowsState>(() => ({
	list: () => useUserProfileStore.getState().userProfile?.savedWorkflows ?? [],

	createWorkflow: ({
		name,
		description,
		platform,
		workflowConfig,
		aiPrompt,
		generatedByAI,
		monetization,
	}) => {
		const id = uuidv4();
		const now = new Date();
		const current =
			useUserProfileStore.getState().userProfile?.savedWorkflows ?? [];
		const next: SavedWorkflow[] = [
			...current,
			{
				id,
				name,
				description,
				platform,
				workflowConfig,
				aiPrompt,
				generatedByAI,
				createdAt: now,
				updatedAt: now,
				monetization,
			},
		];
		useUserProfileStore.getState().updateUserProfile({ savedWorkflows: next });
		return id;
	},

	updateWorkflow: (id, patch) => {
		const current =
			useUserProfileStore.getState().userProfile?.savedWorkflows ?? [];
		const next = current.map((w) =>
			w.id === id
				? {
						...w,
						...patch,
						updatedAt: new Date(),
					}
				: w,
		);
		useUserProfileStore.getState().updateUserProfile({ savedWorkflows: next });
	},

	deleteWorkflow: (id) => {
		const current =
			useUserProfileStore.getState().userProfile?.savedWorkflows ?? [];
		const next = current.filter((w) => w.id !== id);
		useUserProfileStore.getState().updateUserProfile({ savedWorkflows: next });
	},

	exportToPlatform: (id, platform) => {
		const workflow = useUserProfileStore
			.getState()
			.userProfile?.savedWorkflows.find((w) => w.id === id);

		if (!workflow) return null;

		// Create a new workflow with the specified platform
		// The workflowConfig would need to be converted if platform differs
		// This is handled in the UI layer with converter utilities
		return {
			...workflow,
			platform,
		};
	},

	toggleMonetization: (id) => {
		const current =
			useUserProfileStore.getState().userProfile?.savedWorkflows ?? [];
		const next = current.map((w) =>
			w.id === id && w.monetization
				? {
						...w,
						monetization: {
							...w.monetization,
							enabled: !w.monetization.enabled,
						},
						updatedAt: new Date(),
					}
				: w,
		);
		useUserProfileStore.getState().updateUserProfile({ savedWorkflows: next });
	},
}));
