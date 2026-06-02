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
				const stateBeforeOpen = get();

				// Check if we're within the completion cooldown period
				// If so, don't open the wizard (prevents reopening after completion)
				if (stateBeforeOpen.lastCompletionTime !== null) {
					const timeSinceCompletion =
						Date.now() - stateBeforeOpen.lastCompletionTime;
					if (timeSinceCompletion < COMPLETION_COOLDOWN_MS) {
						console.log(
							"🚫 [WIZARD] open() blocked by completion cooldown:",
							`${timeSinceCompletion}ms < ${COMPLETION_COOLDOWN_MS}ms`,
						);
						return;
					}
				}

				console.log("🚀 [WIZARD] open() called:", {
					hasPreset: !!preset,
					hasPendingAction: !!stateBeforeOpen.pendingAction,
					currentIsOpen: stateBeforeOpen.isOpen,
					lastCompletionTime: stateBeforeOpen.lastCompletionTime,
				});

				// Apply preset only if provided - don't reset if undefined (preserves session defaults)
				// applyPreset(undefined) would reset the data store, clearing session defaults
				if (preset) {
					useQuickStartWizardDataStore.getState().applyPreset(preset);
				}

				// Always start at step 1 (persona) when wizard opens explicitly
				// This ensures users go through the flow step by step
				// Session defaults will pre-select options, but won't skip steps
				// Only URL parameters or explicit presets with both persona+goal should skip to summary
				const nextStep: QuickStartWizardStep = preset?.goalId
					? "summary" // Only skip to summary if preset explicitly provides goalId
					: QUICK_START_DEFAULT_STEP; // Always start at persona step

				// Preserve pendingAction when opening
				const currentPendingAction = stateBeforeOpen.pendingAction;
				set({
					isOpen: true,
					activeStep: nextStep,
					activePreset: preset ?? null,
					isCompleting: false, // Reset completing flag when opening
					lastCompletionTime: null, // Clear completion cooldown when explicitly opened
					pendingAction: currentPendingAction, // Preserve pendingAction
				});
				const stateAfterOpen = get();
				console.log("🚀 [WIZARD] State after open() set:", {
					hasPendingAction: !!stateAfterOpen.pendingAction,
					isOpen: stateAfterOpen.isOpen,
					activeStep: stateAfterOpen.activeStep,
				});
			},
			launchWithAction: (preset, action) => {
				const currentState = get();

				// Check if we're within the completion cooldown period
				// If so, don't launch the wizard (prevents reopening after completion)
				// BUT: If the wizard is already open, allow it (user might be re-launching from within wizard)
				if (currentState.lastCompletionTime !== null && !currentState.isOpen) {
					const timeSinceCompletion =
						Date.now() - currentState.lastCompletionTime;
					if (timeSinceCompletion < COMPLETION_COOLDOWN_MS) {
						console.log(
							"🚫 [WIZARD] launchWithAction blocked by completion cooldown:",
							`${timeSinceCompletion}ms < ${COMPLETION_COOLDOWN_MS}ms`,
							"Wizard is closed, blocking to prevent reopening",
						);
						// Still set the pending action in case the user wants to retry after cooldown
						// But don't open the wizard
						set({ pendingAction: action });
						return;
					}
				}

				console.log("🚀 [WIZARD] launchWithAction called:", {
					hasPreset: !!preset,
					hasAction: !!action,
					actionType: typeof action,
				});
				set({ pendingAction: action });
				const stateAfterSet = get();
				console.log("🚀 [WIZARD] State after setting pendingAction:", {
					hasPendingAction: !!stateAfterSet.pendingAction,
					isOpen: stateAfterSet.isOpen,
				});
				get().open(preset);
				const stateAfterOpen = get();
				console.log("🚀 [WIZARD] State after open():", {
					hasPendingAction: !!stateAfterOpen.pendingAction,
					isOpen: stateAfterOpen.isOpen,
				});
			},
			cancel: () => {
				// Don't cancel if we're in the process of completing
				if (get().isCompleting) {
					return;
				}

				const stateBeforeCancel = get();
				const dataState = useQuickStartWizardDataStore.getState();

				console.log("🚫 [WIZARD] cancel() called:", {
					hasPendingAction: !!stateBeforeCancel.pendingAction,
				});

				captureQuickStartEvent("quickstart_wizard_cancelled", {
					step: stateBeforeCancel.activeStep,
					personaId: dataState.personaId,
					goalId: dataState.goalId,
					templateId: stateBeforeCancel.activePreset?.templateId ?? null,
					pendingAction: Boolean(stateBeforeCancel.pendingAction),
				});

				useQuickStartWizardExperienceStore.getState().markWizardSeen();
				useQuickStartWizardDataStore.getState().reset();
				// Clear pendingAction when canceling
				set({ ...defaultState, pendingAction: null });
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
					"🎯 [WIZARD] Scheduling action execution with delay to ensure modal is fully closed",
				);
				console.log("🎯 [WIZARD] Pending action details:", {
					hasPendingAction: !!pendingAction,
					actionType: typeof pendingAction,
					actionString: pendingAction?.toString().substring(0, 100),
				});
				const actionToExecute = pendingAction;
				const executePendingAction = () => {
					console.log("🎯 [WIZARD] Checking pending action:", {
						hasPendingAction: !!actionToExecute,
						actionType: typeof actionToExecute,
						hasStatePendingAction: !!get().pendingAction,
					});
					if (actionToExecute) {
						console.log("🎯 [WIZARD] Executing pending action");
						try {
							actionToExecute();
							console.log("🎯 [WIZARD] Pending action executed successfully");
						} catch (error) {
							console.error(
								"❌ [WIZARD] Error executing pending action:",
								error,
							);
						}
					} else {
						console.log(
							"🎯 [WIZARD] No pending action to execute - actionToExecute is null/undefined",
						);
					}

					console.log("🎯 [WIZARD] Setting isCompleting=false in wizard store");
					set({ isCompleting: false });

					console.log("🎯 [WIZARD] Scheduling wizard data reset in 500ms");
					setTimeout(() => {
						console.log("🎯 [WIZARD] Resetting wizard data");
						resetWizardData();
						setTimeout(() => {
							console.log("🎯 [WIZARD] Setting data store isCompleting=false");
							setDataCompleting(false);
						}, 200);

						setTimeout(() => {
							console.log("🎯 [WIZARD] Resetting remaining wizard state");
							set({
								activeStep: QUICK_START_DEFAULT_STEP,
								activePreset: null,
								pendingAction: null,
							});
							console.log("🎯 [WIZARD] Complete flow finished");
						}, 1000);
					}, 500);
				};

				const shouldExecuteImmediately = Boolean(
					(actionToExecute as (() => void) & {
						__executeImmediately?: boolean;
					})?.__executeImmediately,
				);

				if (shouldExecuteImmediately) {
					console.log(
						"🎯 [WIZARD] Immediate pending action flagged - executing without delay",
					);
					executePendingAction();
				} else {
					console.log(
						"🎯 [WIZARD] Scheduling action execution with delay to ensure modal is fully closed",
					);
					setTimeout(() => {
						console.log(
							"🎯 [WIZARD] setTimeout callback executing after 300ms delay",
						);
						executePendingAction();
					}, 300);
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
				set({ ...defaultState, lastCompletionTime: null });
			},
		}),
		Object.is,
	);
