import { useSession } from "next-auth/react";
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

interface QuickStartWizardDataState {
	readonly personaId: QuickStartPersonaId | null;
	readonly goalId: QuickStartGoalId | null;
	readonly isCompleting: boolean;
	readonly selectPersona: (personaId: QuickStartPersonaId) => void;
	readonly selectGoal: (goalId: QuickStartGoalId) => void;
	readonly applyPreset: (preset?: QuickStartWizardPreset) => void;
	readonly reset: () => void;
	readonly setCompleting: (completing: boolean) => void;
}

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
			isCompleting: false,
			setCompleting: (completing: boolean) => {
				set({ isCompleting: completing });
			},
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
			reset: () => set({ ...createInitialState(), isCompleting: false }),
		}),
		Object.is,
	);

// Subscribe to UserProfile changes
useUserProfileStore.subscribe(
	(state) => state.userProfile?.quickStartDefaults,
	(defaults) => {
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
	},
);

// ALSO subscribe to session changes (for authenticated users without full UserProfile)
if (typeof window !== "undefined") {
	import("next-auth/react").then(({ useSession }) => {
		// This will be handled by the SessionDefaultsSync component
	});
}
