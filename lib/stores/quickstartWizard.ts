import { createWithEqualityFn } from "zustand/traditional";

import type { QuickStartWizardPreset } from "@/components/quickstart/types";
import { captureQuickStartEvent } from "@/lib/analytics/quickstart";
import { useQuickStartWizardDataStore } from "./quickstartWizardData";
import { useQuickStartWizardExperienceStore } from "./quickstartWizardExperience";

export type QuickStartWizardStep = "persona" | "goal" | "summary";

export const QUICK_START_DEFAULT_STEP: QuickStartWizardStep = "persona";

interface QuickStartWizardState {
	readonly isOpen: boolean;
	readonly activeStep: QuickStartWizardStep;
	readonly activePreset: QuickStartWizardPreset | null;
	readonly pendingAction: (() => void) | null;
	readonly open: (preset?: QuickStartWizardPreset) => void;
	readonly launchWithAction: (
		preset: QuickStartWizardPreset | undefined,
		action: () => void,
	) => void;
	readonly cancel: () => void;
	readonly close: () => void;
	readonly complete: () => void;
	readonly goToStep: (step: QuickStartWizardStep) => void;
	readonly reset: () => void;
}

const defaultState = {
	isOpen: false,
	activeStep: QUICK_START_DEFAULT_STEP,
	activePreset: null,
	pendingAction: null,
} satisfies Pick<
	QuickStartWizardState,
	"isOpen" | "activeStep" | "activePreset" | "pendingAction"
>;

export const useQuickStartWizardStore =
	createWithEqualityFn<QuickStartWizardState>(
		(set, get) => ({
			...defaultState,
			open: (preset) => {
				useQuickStartWizardDataStore.getState().applyPreset(preset);

				const { personaId, goalId } = useQuickStartWizardDataStore.getState();
				const nextStep: QuickStartWizardStep = goalId
					? "summary"
					: personaId
						? "goal"
						: QUICK_START_DEFAULT_STEP;

				set({
					isOpen: true,
					activeStep: nextStep,
					activePreset: preset ?? null,
				});
			},
			launchWithAction: (preset, action) => {
				set({ pendingAction: action });
				get().open(preset);
			},
			cancel: () => {
				const stateBeforeCancel = get();
				const dataState = useQuickStartWizardDataStore.getState();

				captureQuickStartEvent("quickstart_wizard_cancelled", {
					step: stateBeforeCancel.activeStep,
					personaId: dataState.personaId,
					goalId: dataState.goalId,
					templateId: stateBeforeCancel.activePreset?.templateId ?? null,
					pendingAction: Boolean(stateBeforeCancel.pendingAction),
				});

				useQuickStartWizardExperienceStore.getState().markWizardSeen();
				useQuickStartWizardDataStore.getState().reset();
				set({ ...defaultState });
			},
			close: () => {
				get().cancel();
			},
			complete: () => {
				const stateBeforeComplete = get();
				const dataState = useQuickStartWizardDataStore.getState();
				const pendingAction = stateBeforeComplete.pendingAction;
				const resetWizardData = dataState.reset;

				captureQuickStartEvent("quickstart_plan_completed", {
					personaId: dataState.personaId,
					goalId: dataState.goalId,
					templateId: stateBeforeComplete.activePreset?.templateId ?? null,
					triggeredAction: pendingAction ? "launchWithAction" : "complete",
				});

				set({ ...defaultState });

				try {
					if (pendingAction) {
						pendingAction();
					}
				} finally {
					useQuickStartWizardExperienceStore.getState().markWizardSeen();
					resetWizardData();
				}
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
		Object.is,
	);
