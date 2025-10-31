import { createWithEqualityFn } from "zustand/traditional";

import type { QuickStartWizardPreset } from "@/components/quickstart/types";
import { captureQuickStartEvent } from "@/lib/analytics/quickstart";
import {
	getGoalDefinition,
	getGoalsForPersona,
	type QuickStartGoalId,
	type QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";
import { useUserProfileStore } from "@/lib/stores/user/userProfile";
import type { QuickStartDefaults } from "@/types/userProfile";

interface QuickStartWizardDataState {
	readonly personaId: QuickStartPersonaId | null;
	readonly goalId: QuickStartGoalId | null;
	readonly selectPersona: (personaId: QuickStartPersonaId) => void;
	readonly selectGoal: (goalId: QuickStartGoalId) => void;
	readonly applyPreset: (preset?: QuickStartWizardPreset) => void;
	readonly reset: () => void;
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

const createInitialState = () =>
	deriveStateFromDefaults(
		useUserProfileStore.getState().userProfile?.quickStartDefaults,
	);

export const useQuickStartWizardDataStore =
	createWithEqualityFn<QuickStartWizardDataState>(
		(set, get) => ({
			...createInitialState(),
			selectPersona: (personaId) => {
				const previousState = get();
				set((state) => {
					if (state.goalId) {
						const definition = getGoalDefinition(state.goalId);
						if (definition?.personaId === personaId) {
							return { personaId, goalId: definition.id };
						}
					}

					return { personaId, goalId: null };
				});

				const { goalId } = get();
				captureQuickStartEvent("quickstart_persona_selected", {
					personaId,
					goalId,
					previousPersonaId: previousState.personaId,
					previousGoalId: previousState.goalId,
				});
			},
			selectGoal: (goalId) => {
				const previousState = get();
				set(() => {
					const definition = getGoalDefinition(goalId);
					if (!definition) {
						return {};
					}

					return {
						personaId: definition.personaId,
						goalId: definition.id,
					};
				});

				const nextState = get();
				if (!nextState.goalId) {
					return;
				}

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
			reset: () => set(createInitialState()),
		}),
		Object.is,
	);

useUserProfileStore.subscribe(
	(state) => state.userProfile?.quickStartDefaults,
	(defaults) => {
		useQuickStartWizardDataStore.setState((current) => {
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
