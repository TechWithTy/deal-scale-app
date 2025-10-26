import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface QuickStartWizardExperienceState {
	readonly hasSeenWizard: boolean;
	readonly isHydrated: boolean;
	readonly markWizardSeen: () => void;
	readonly reset: () => void;
}

const defaultState = { hasSeenWizard: false, isHydrated: false } as const;

export const useQuickStartWizardExperienceStore =
	create<QuickStartWizardExperienceState>()(
		persist(
			(set) => ({
				...defaultState,
				markWizardSeen: () => set({ hasSeenWizard: true }),
				reset: () => set({ hasSeenWizard: false }),
			}),
			{
				name: "quickstart-wizard-experience",
				storage: createJSONStorage(() => localStorage),
			},
		),
	);

useQuickStartWizardExperienceStore.persist.onFinishHydration?.(() => {
	useQuickStartWizardExperienceStore.setState({ isHydrated: true });
});

if (useQuickStartWizardExperienceStore.persist.hasHydrated?.()) {
	useQuickStartWizardExperienceStore.setState({ isHydrated: true });
}
