import type { WorkflowPlatformConnection } from "@/types/userProfile";
import { create } from "zustand";
import { useUserProfileStore } from "../userProfile";

interface WorkflowPlatformsState {
	getConnectedPlatforms: () => WorkflowPlatformConnection[];
	connectPlatform: (
		platform: "n8n" | "make" | "kestra",
		config: {
			apiKey?: string;
			instanceUrl?: string;
		},
	) => void;
	disconnectPlatform: (platform: "n8n" | "make" | "kestra") => void;
	isPlatformConnected: (platform: "n8n" | "make" | "kestra") => boolean;
}

export const useWorkflowPlatformsStore = create<WorkflowPlatformsState>(() => ({
	getConnectedPlatforms: () => {
		return useUserProfileStore.getState().userProfile?.workflowPlatforms ?? [];
	},

	connectPlatform: (platform, config) => {
		const current =
			useUserProfileStore.getState().userProfile?.workflowPlatforms ?? [];

		// Check if platform already exists
		const existingIndex = current.findIndex((p) => p.platform === platform);

		let next: WorkflowPlatformConnection[];
		if (existingIndex >= 0) {
			// Update existing connection
			next = current.map((p, idx) =>
				idx === existingIndex
					? {
							...p,
							connected: true,
							apiKey: config.apiKey,
							instanceUrl: config.instanceUrl,
							connectedAt: new Date(),
						}
					: p,
			);
		} else {
			// Add new connection
			next = [
				...current,
				{
					platform,
					connected: true,
					apiKey: config.apiKey,
					instanceUrl: config.instanceUrl,
					connectedAt: new Date(),
				},
			];
		}

		useUserProfileStore
			.getState()
			.updateUserProfile({ workflowPlatforms: next });
	},

	disconnectPlatform: (platform) => {
		const current =
			useUserProfileStore.getState().userProfile?.workflowPlatforms ?? [];
		const next = current.map((p) =>
			p.platform === platform
				? { ...p, connected: false, apiKey: undefined }
				: p,
		);
		useUserProfileStore
			.getState()
			.updateUserProfile({ workflowPlatforms: next });
	},

	isPlatformConnected: (platform) => {
		const platforms =
			useUserProfileStore.getState().userProfile?.workflowPlatforms ?? [];
		const connection = platforms.find((p) => p.platform === platform);
		return connection?.connected ?? false;
	},
}));
