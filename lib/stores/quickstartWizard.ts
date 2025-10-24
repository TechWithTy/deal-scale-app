import { create } from "zustand";

import type { QuickStartWizardPreset } from "@/components/quickstart/types";
import { useQuickStartWizardDataStore } from "./quickstartWizardData";

export type QuickStartWizardStep =
	| "lead-intake"
	| "campaign-basics"
	| "review"
	| "test-and-launch"
	| "lead-capture"
	| "market-discovery";

export const QUICK_START_DEFAULT_STEP: QuickStartWizardStep = "lead-intake";

interface QuickStartWizardState {
	readonly isOpen: boolean;
	readonly activeStep: QuickStartWizardStep;
	readonly activePreset: QuickStartWizardPreset | null;
	readonly open: (preset?: QuickStartWizardPreset) => void;
	readonly close: () => void;
	readonly goToStep: (step: QuickStartWizardStep) => void;
	readonly reset: () => void;
}

const defaultState = {
	isOpen: false,
	activeStep: QUICK_START_DEFAULT_STEP,
	activePreset: null,
} satisfies Pick<
	QuickStartWizardState,
	"isOpen" | "activeStep" | "activePreset"
>;

export const useQuickStartWizardStore = create<QuickStartWizardState>(
	(set, get) => ({
		...defaultState,
		open: (preset) => {
			const nextStep = preset?.startStep ?? QUICK_START_DEFAULT_STEP;

			set({
				isOpen: true,
				activeStep: nextStep,
				activePreset: preset ?? null,
			});
		},
		close: () => {
			useQuickStartWizardDataStore.getState().reset();
			set({ ...defaultState });
		},
		goToStep: (step) => {
			if (!get().isOpen) {
				return;
			}

			set({ activeStep: step });
		},
		reset: () => {
			useQuickStartWizardDataStore.getState().reset();
			set({ ...defaultState });
		},
	}),
);
