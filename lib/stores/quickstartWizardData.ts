import { create } from "zustand";

import type { QuickStartWizardPreset } from "@/components/quickstart/types";
import {
	getGoalDefinition,
	getGoalsForPersona,
	type QuickStartGoalId,
	type QuickStartPersonaId,
} from "@/lib/config/quickstart/wizardFlows";

interface QuickStartWizardDataState {
	readonly personaId: QuickStartPersonaId | null;
	readonly goalId: QuickStartGoalId | null;
	readonly selectPersona: (personaId: QuickStartPersonaId) => void;
	readonly selectGoal: (goalId: QuickStartGoalId) => void;
	readonly applyPreset: (preset?: QuickStartWizardPreset) => void;
	readonly reset: () => void;
}

const createInitialState = () => ({
	personaId: null as QuickStartPersonaId | null,
	goalId: null as QuickStartGoalId | null,
});

export const useQuickStartWizardDataStore = create<QuickStartWizardDataState>(
	(set) => ({
		...createInitialState(),
		selectPersona: (personaId) =>
			set((state) => {
				if (state.goalId) {
					const definition = getGoalDefinition(state.goalId);
					if (definition?.personaId === personaId) {
						return { personaId, goalId: definition.id };
					}
				}

				return { personaId, goalId: null };
			}),
		selectGoal: (goalId) =>
			set(() => {
				const definition = getGoalDefinition(goalId);
				if (!definition) {
					return {};
				}

				return {
					personaId: definition.personaId,
					goalId: definition.id,
				};
			}),
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
);
