import { create } from "zustand";
import {
	createJSONStorage,
	persist,
	type StateStorage,
} from "zustand/middleware";

interface QuickStartWizardExperienceState {
	readonly hasSeenWizard: boolean;
	readonly isHydrated: boolean;
	readonly markWizardSeen: () => void;
	readonly setHydrated: () => void;
	readonly reset: () => void;
}

const defaultState = { hasSeenWizard: false, isHydrated: false } as const;

const createNoopStorage = (): StateStorage => ({
	getItem: () => Promise.resolve(null),
	setItem: () => Promise.resolve(),
	removeItem: () => Promise.resolve(),
});

const resolveStorage = () => {
	if (typeof window === "undefined") {
		return createNoopStorage();
	}

	return createJSONStorage(() => window.localStorage);
};

export const useQuickStartWizardExperienceStore =
	create<QuickStartWizardExperienceState>()(
		persist(
			(set) => ({
				...defaultState,
				markWizardSeen: () => set({ hasSeenWizard: true }),
				setHydrated: () => set({ isHydrated: true }),
				reset: () => set({ hasSeenWizard: false }),
			}),
			{
				name: "quickstart-wizard-experience",
				storage: resolveStorage(),
				onRehydrateStorage: () => (state) => {
					state?.setHydrated();
				},
			},
		),
	);

if (typeof window === "undefined") {
	useQuickStartWizardExperienceStore.getState().setHydrated();
} else {
	const persistApi = useQuickStartWizardExperienceStore.persist;

	persistApi?.onFinishHydration?.(() => {
		useQuickStartWizardExperienceStore.getState().setHydrated();
	});

	if (persistApi?.hasHydrated?.()) {
		useQuickStartWizardExperienceStore.getState().setHydrated();
	}
}
