import { createWithEqualityFn } from "zustand/traditional";

import type { QuickStartWizardPreset } from "@/components/quickstart/types";
import { captureQuickStartEvent } from "@/lib/analytics/quickstart";
import {
	type QuickStartGoalId,
	type QuickStartPersonaId,
	getGoalDefinition,
	getGoalsForPersona,
} from "@/lib/config/quickstart/wizardFlows";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import type { QuickStartDefaults } from "@/types/userProfile";

export type LeadSourceOption = "csv-upload" | "saved-search" | "integrations";
export type MarketTimelineOption =
	| "immediate"
	| "next-30-days"
	| "this-quarter"
	| "later";

export interface CaptureOptions {
	readonly enableWidget: boolean;
	readonly enableExtension: boolean;
	readonly autoResponderEnabled: boolean;
	readonly forwardingNumber: string;
	readonly notifyEmail: string;
}

export interface LaunchChecklist {
	readonly sandboxValidated: boolean;
	readonly complianceReviewComplete: boolean;
	readonly notificationsEnabled: boolean;
	readonly goLiveApproved: boolean;
}

interface QuickStartWizardDataState {
	readonly personaId: QuickStartPersonaId | null;
	readonly goalId: QuickStartGoalId | null;
	readonly isCompleting: boolean;
	readonly leadSource: LeadSourceOption;
	readonly csvFileName: string | null;
	readonly csvRecordEstimate: number | null;
	readonly selectedIntegrations: readonly string[];
	readonly savedSearchName: string;
	readonly targetMarkets: readonly string[];
	readonly leadNotes: string;
	readonly marketFilters: readonly string[];
	readonly budgetRange: readonly [number, number];
	readonly timeline: MarketTimelineOption;
	readonly marketNotes: string;
	readonly captureOptions: CaptureOptions;
	readonly reviewNotes: string;
	readonly launchChecklist: LaunchChecklist;
	readonly selectPersona: (personaId: QuickStartPersonaId) => void;
	readonly selectGoal: (goalId: QuickStartGoalId) => void;
	readonly applyPreset: (preset?: QuickStartWizardPreset) => void;
	readonly reset: () => void;
	readonly setCompleting: (completing: boolean) => void;
	readonly setLeadSource: (leadSource: LeadSourceOption) => void;
	readonly setCsvDetails: (details: {
		readonly fileName: string | null;
		readonly recordEstimate: number | null;
	}) => void;
	readonly toggleIntegrationSource: (integration: string) => void;
	readonly setSavedSearchName: (savedSearchName: string) => void;
	readonly addTargetMarket: (market: string) => void;
	readonly removeTargetMarket: (market: string) => void;
	readonly setLeadNotes: (leadNotes: string) => void;
	readonly toggleMarketFilter: (filter: string) => void;
	readonly setBudgetRange: (budgetRange: readonly [number, number]) => void;
	readonly setTimeline: (timeline: MarketTimelineOption) => void;
	readonly setMarketNotes: (marketNotes: string) => void;
	readonly setCaptureOption: <Key extends keyof CaptureOptions>(
		key: Key,
		value: CaptureOptions[Key],
	) => void;
	readonly setReviewNotes: (reviewNotes: string) => void;
	readonly toggleLaunchChecklist: (key: keyof LaunchChecklist) => void;
}

const DEFAULT_CAPTURE_OPTIONS: CaptureOptions = {
	enableWidget: true,
	enableExtension: false,
	autoResponderEnabled: true,
	forwardingNumber: "",
	notifyEmail: "",
};

const DEFAULT_LAUNCH_CHECKLIST: LaunchChecklist = {
	sandboxValidated: false,
	complianceReviewComplete: false,
	notificationsEnabled: false,
	goLiveApproved: false,
};

const createWizardFormState = () => ({
	leadSource: "csv-upload" as LeadSourceOption,
	csvFileName: null as string | null,
	csvRecordEstimate: null as number | null,
	selectedIntegrations: [] as string[],
	savedSearchName: "",
	targetMarkets: [] as string[],
	leadNotes: "",
	marketFilters: [] as string[],
	budgetRange: [25000, 100000] as const,
	timeline: "next-30-days" as MarketTimelineOption,
	marketNotes: "",
	captureOptions: { ...DEFAULT_CAPTURE_OPTIONS },
	reviewNotes: "",
	launchChecklist: { ...DEFAULT_LAUNCH_CHECKLIST },
});

const toggleStringValue = (
	values: readonly string[],
	value: string,
): string[] =>
	values.includes(value)
		? values.filter((current) => current !== value)
		: [...values, value];

const deriveStateFromDefaults = (
	defaults: QuickStartDefaults | null | undefined,
): Pick<QuickStartWizardDataState, "personaId" | "goalId"> => {
	if (!defaults) {
		return {
			personaId: null as QuickStartPersonaId | null,
			goalId: null as QuickStartGoalId | null,
		};
	}

	if (defaults.goalId) {
		const definition = getGoalDefinition(defaults.goalId);
		if (definition) {
			return {
				personaId: definition.personaId,
				goalId: definition.id,
			};
		}
	}

	if (defaults.personaId) {
		const goals = getGoalsForPersona(defaults.personaId);
		return {
			personaId: defaults.personaId,
			goalId: goals.length === 1 ? (goals[0]?.id ?? null) : null,
		};
	}

	return {
		personaId: null,
		goalId: null,
	};
};

const createInitialState = () => {
	// Try to get defaults from UserProfile first
	const profileDefaults =
		useUserProfileStore.getState().userProfile?.quickStartDefaults;

	if (profileDefaults) {
		return deriveStateFromDefaults(profileDefaults);
	}

	// If no profile, try to get from session (for auth users)
	// We need to dynamically check session here since it's not available at module load time
	// The SessionDefaultsSync component will handle syncing session defaults
	// For now, return null values - they'll be populated by the sync
	return {
		personaId: null as QuickStartPersonaId | null,
		goalId: null as QuickStartGoalId | null,
	};
};

export const useQuickStartWizardDataStore =
	createWithEqualityFn<QuickStartWizardDataState>(
		(set, get) => ({
			...createInitialState(),
			...createWizardFormState(),
			isCompleting: false,
			setCompleting: (completing: boolean) => {
				set({ isCompleting: completing });
			},
			setLeadSource: (leadSource) => set({ leadSource }),
			setCsvDetails: ({ fileName, recordEstimate }) =>
				set({ csvFileName: fileName, csvRecordEstimate: recordEstimate }),
			toggleIntegrationSource: (integration) =>
				set((state) => ({
					selectedIntegrations: toggleStringValue(
						state.selectedIntegrations,
						integration,
					),
				})),
			setSavedSearchName: (savedSearchName) => set({ savedSearchName }),
			addTargetMarket: (market) =>
				set((state) => {
					const trimmed = market.trim();
					if (!trimmed || state.targetMarkets.includes(trimmed)) {
						return {};
					}

					return { targetMarkets: [...state.targetMarkets, trimmed] };
				}),
			removeTargetMarket: (market) =>
				set((state) => ({
					targetMarkets: state.targetMarkets.filter(
						(current) => current !== market,
					),
				})),
			setLeadNotes: (leadNotes) => set({ leadNotes }),
			toggleMarketFilter: (filter) =>
				set((state) => ({
					marketFilters: toggleStringValue(state.marketFilters, filter),
				})),
			setBudgetRange: (budgetRange) =>
				set({ budgetRange: [budgetRange[0], budgetRange[1]] }),
			setTimeline: (timeline) => set({ timeline }),
			setMarketNotes: (marketNotes) => set({ marketNotes }),
			setCaptureOption: (key, value) =>
				set((state) => ({
					captureOptions: {
						...state.captureOptions,
						[key]: value,
					},
				})),
			setReviewNotes: (reviewNotes) => set({ reviewNotes }),
			toggleLaunchChecklist: (key) =>
				set((state) => ({
					launchChecklist: {
						...state.launchChecklist,
						[key]: !state.launchChecklist[key],
					},
				})),
			selectPersona: (personaId) => {
				console.log("👤 [WIZARD DATA] selectPersona() called:", personaId);
				const previousState = get();
				console.log("👤 [WIZARD DATA] Previous state:", {
					personaId: previousState.personaId,
					goalId: previousState.goalId,
					isCompleting: previousState.isCompleting,
				});

				// Prevent selection if completing
				if (previousState.isCompleting) {
					console.warn(
						"⚠️ [WIZARD DATA] selectPersona() called while completing - ignoring",
					);
					return;
				}

				set((state) => {
					if (state.goalId) {
						const definition = getGoalDefinition(state.goalId);
						if (definition?.personaId === personaId) {
							console.log(
								"👤 [WIZARD DATA] Persona matches existing goal, keeping goalId",
							);
							return { personaId, goalId: definition.id };
						}
					}

					console.log("👤 [WIZARD DATA] Setting persona, clearing goalId");
					return { personaId, goalId: null };
				});

				const { goalId } = get();
				console.log("👤 [WIZARD DATA] Persona selected, new state:", {
					personaId,
					goalId,
				});
				captureQuickStartEvent("quickstart_persona_selected", {
					personaId,
					goalId,
					previousPersonaId: previousState.personaId,
					previousGoalId: previousState.goalId,
				});
			},
			selectGoal: (goalId) => {
				console.log("🎯 [WIZARD DATA] selectGoal() called:", goalId);
				const previousState = get();
				console.log("🎯 [WIZARD DATA] Previous state:", {
					personaId: previousState.personaId,
					goalId: previousState.goalId,
					isCompleting: previousState.isCompleting,
				});

				// Prevent selection if completing
				if (previousState.isCompleting) {
					console.warn(
						"⚠️ [WIZARD DATA] selectGoal() called while completing - ignoring",
					);
					return;
				}

				set(() => {
					const definition = getGoalDefinition(goalId);
					if (!definition) {
						console.warn(
							"⚠️ [WIZARD DATA] Goal definition not found for:",
							goalId,
						);
						return {};
					}

					console.log("🎯 [WIZARD DATA] Setting goal and persona:", {
						personaId: definition.personaId,
						goalId: definition.id,
					});
					return {
						personaId: definition.personaId,
						goalId: definition.id,
					};
				});

				const nextState = get();
				if (!nextState.goalId) {
					console.warn("⚠️ [WIZARD DATA] Goal not set after selectGoal()");
					return;
				}

				console.log("🎯 [WIZARD DATA] Goal selected, new state:", {
					personaId: nextState.personaId,
					goalId: nextState.goalId,
				});
				captureQuickStartEvent("quickstart_goal_selected", {
					personaId: nextState.personaId,
					goalId: nextState.goalId,
					previousGoalId: previousState.goalId,
				});
			},
			applyPreset: (preset) =>
				set(() => {
					if (!preset) {
						return createInitialState();
					}

					if (preset.goalId) {
						const definition = getGoalDefinition(preset.goalId);
						if (definition) {
							return {
								personaId: definition.personaId,
								goalId: definition.id,
							};
						}
					}

					if (preset.personaId) {
						const goals = getGoalsForPersona(preset.personaId);
						return {
							personaId: preset.personaId,
							goalId: goals.length === 1 ? (goals[0]?.id ?? null) : null,
						};
					}

					return createInitialState();
				}),
			reset: () =>
				set({
					...createInitialState(),
					...createWizardFormState(),
					isCompleting: false,
				}),
		}),
		Object.is,
	);

// Subscribe to UserProfile changes
useUserProfileStore.subscribe((state) => {
	const defaults = state.userProfile?.quickStartDefaults;

	useQuickStartWizardDataStore.setState((current) => {
		// Don't sync if wizard is completing (prevents interference with modal opening)
		if (current.isCompleting) {
			return {};
		}
		if (current.personaId || current.goalId) {
			return {};
		}

		const nextState = deriveStateFromDefaults(defaults);

		if (
			current.personaId === nextState.personaId &&
			current.goalId === nextState.goalId
		) {
			return {};
		}

		return nextState;
	});
});
