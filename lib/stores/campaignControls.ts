import { create } from "zustand";

export type CampaignPlaybackState = "idle" | "playing" | "paused" | "stopped";

export interface CampaignControlState {
	states: Record<string, CampaignPlaybackState>;
	getStateFor: (campaignId: string) => CampaignPlaybackState;
	play: (campaignId: string) => void;
	pause: (campaignId: string) => void;
	stop: (campaignId: string) => void;
}

export const useCampaignControls = create<CampaignControlState>((set, get) => ({
	states: {},
	getStateFor: (id) => get().states[id] ?? "idle",
	play: (id) =>
		set((s) => ({
			states: { ...s.states, [id]: "playing" },
		})),
	pause: (id) =>
		set((s) => ({
			states: { ...s.states, [id]: "paused" },
		})),
	stop: (id) =>
		set((s) => ({
			states: { ...s.states, [id]: "stopped" },
		})),
}));

// Mock workflow triggers to simulate side-effects when controls are used
export function mockStartWorkflow(campaignId: string) {
	// eslint-disable-next-line no-console
	console.log(`[mock] start workflow for`, campaignId);
}
export function mockPauseWorkflow(campaignId: string) {
	// eslint-disable-next-line no-console
	console.log(`[mock] pause workflow for`, campaignId);
}
export function mockStopWorkflow(campaignId: string) {
	// eslint-disable-next-line no-console
	console.log(`[mock] stop workflow for`, campaignId);
}
