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
	readonly isCompleting: boolean;
	readonly lastCompletionTime: number | null;
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
	isCompleting: false,
	lastCompletionTime: null,
} satisfies Pick<
	QuickStartWizardState,
	| "isOpen"
	| "activeStep"
	| "activePreset"
	| "pendingAction"
	| "isCompleting"
	| "lastCompletionTime"
>;

// Cooldown period in milliseconds (2.5 seconds)
const COMPLETION_COOLDOWN_MS = 2500;

export const useQuickStartWizardStore =
	createWithEqualityFn<QuickStartWizardState>(
		(set, get) => ({
			...defaultState,
			open: (preset) => {
				useQuickStartWizardDataStore.getState().applyPreset(preset);

				// Always start at step 1 (persona) when wizard opens explicitly
				// This ensures users go through the flow step by step
				// Session defaults will pre-select options, but won't skip steps
				// Only URL parameters or explicit presets with both persona+goal should skip to summary
				const nextStep: QuickStartWizardStep = preset?.goalId
					? "summary" // Only skip to summary if preset explicitly provides goalId
					: QUICK_START_DEFAULT_STEP; // Always start at persona step

				set({
					isOpen: true,
					activeStep: nextStep,
					activePreset: preset ?? null,
					isCompleting: false, // Reset completing flag when opening
					lastCompletionTime: null, // Clear completion cooldown when explicitly opened
				});
			},
			launchWithAction: (preset, action) => {
				set({ pendingAction: action });
				get().open(preset);
			},
			cancel: () => {
				// Don't cancel if we're in the process of completing
				if (get().isCompleting) {
					return;
				}

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
				console.log("🎯 [WIZARD] complete() called");

				// CRITICAL: Check and set isCompleting synchronously to prevent race conditions
				// This must be done BEFORE reading any other state to prevent duplicate calls
				const currentState = get();
				if (currentState.isCompleting) {
					console.warn(
						"⚠️ [WIZARD] complete() called while already completing - ignoring duplicate call",
					);
					return;
				}

				// Set isCompleting immediately to prevent any other calls from proceeding
				set({ isCompleting: true });

				const stateBeforeComplete = get();
				const dataState = useQuickStartWizardDataStore.getState();
				const pendingAction = stateBeforeComplete.pendingAction;
				const resetWizardData = dataState.reset;
				const setDataCompleting = dataState.setCompleting;

				console.log("🎯 [WIZARD] State before complete:", {
					isOpen: stateBeforeComplete.isOpen,
					isCompleting: stateBeforeComplete.isCompleting,
					hasPendingAction: !!pendingAction,
					personaId: dataState.personaId,
					goalId: dataState.goalId,
					activeStep: stateBeforeComplete.activeStep,
				});

				captureQuickStartEvent("quickstart_plan_completed", {
					personaId: dataState.personaId,
					goalId: dataState.goalId,
					templateId: stateBeforeComplete.activePreset?.templateId ?? null,
					triggeredAction: pendingAction ? "launchWithAction" : "complete",
				});

				console.log(
					"🎯 [WIZARD] Setting isOpen=false (isCompleting already set)",
				);
				// Close dialog (isCompleting already set above to prevent race conditions)
				// Set completion time for cooldown mechanism
				const completionTime = Date.now();
				set({
					isOpen: false,
					lastCompletionTime: completionTime,
				});
				console.log("🎯 [WIZARD] Completion cooldown started:", completionTime);

				console.log("🎯 [WIZARD] Setting data store isCompleting=true");
				// Mark wizard data store as completing to prevent session sync from interfering
				setDataCompleting(true);

				// Mark wizard as seen (but don't reset data yet - action might need it)
				useQuickStartWizardExperienceStore.getState().markWizardSeen();

				console.log(
					"🎯 [WIZARD] Scheduling action execution with requestAnimationFrame",
				);
				// Execute pending action after dialog starts closing
				// Use requestAnimationFrame to ensure dialog closing animation has started
				requestAnimationFrame(() => {
					console.log("🎯 [WIZARD] First requestAnimationFrame callback");
					requestAnimationFrame(() => {
						console.log(
							"🎯 [WIZARD] Second requestAnimationFrame callback - executing action",
						);
						// Execute the action BEFORE resetting wizard data
						// This ensures the action has access to wizard data (goalId, personaId, etc.)
						if (pendingAction) {
							console.log("🎯 [WIZARD] Executing pending action");
							pendingAction();
							console.log("🎯 [WIZARD] Pending action executed");
						} else {
							console.log("🎯 [WIZARD] No pending action to execute");
						}

						console.log(
							"🎯 [WIZARD] Setting isCompleting=false in wizard store",
						);
						// Reset isCompleting flag immediately after action executes
						// This ensures modals can open without the flag interfering
						set({ isCompleting: false });

						console.log("🎯 [WIZARD] Scheduling wizard data reset in 500ms");
						// Delay resetting wizard data significantly to ensure modal has time to open
						// This prevents the reset from triggering session sync effects that close the modal
						// We need enough time for the modal to fully mount and stabilize
						setTimeout(() => {
							console.log("🎯 [WIZARD] Resetting wizard data");
							resetWizardData();
							// Reset completing flag in data store after reset
							// Delay resetting the completing flag to prevent session sync from running immediately
							setTimeout(() => {
								console.log(
									"🎯 [WIZARD] Setting data store isCompleting=false",
								);
								setDataCompleting(false);
							}, 200); // Give session sync time to not interfere

							// Finally reset the remaining wizard state after data reset
							setTimeout(() => {
								console.log("🎯 [WIZARD] Resetting remaining wizard state");
								set({
									activeStep: QUICK_START_DEFAULT_STEP,
									activePreset: null,
									pendingAction: null,
								});
								console.log("🎯 [WIZARD] Complete flow finished");
							}, 0);
						}, 500); // Increased delay to ensure modal is fully stable before resetting
					});
				});
			},
			goToStep: (step) => {
				if (!get().isOpen) {
					return;
				}

				set({ activeStep: step });
			},
			reset: () => {
				useQuickStartWizardDataStore.getState().reset();
				set({ ...defaultState, lastCompletionTime: null });
			},
		}),
		Object.is,
	);
