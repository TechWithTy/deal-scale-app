/**
 * Goal Flow Executor Hook
 *
 * Orchestrates the automated execution of Quick Start goal flows.
 * Maps cardId values (import, campaign, webhooks, etc.) to headless
 * action handlers that create mock data in the background.
 *
 * Features:
 * - Sequential step execution with delays for UX
 * - Headless operation (no modal interactions required)
 * - Mock data creation in actual stores
 * - Error handling with retry capability
 * - Pause/resume support
 * - Analytics tracking for each step
 *
 * @example
 * const { executeGoalFlow, retry, cancel } = useGoalFlowExecutor({
 *   onImport: handleImport,
 *   onCampaignCreate: handleCampaign,
 *   // ... other handlers
 *   leadListStore,
 *   campaignStore,
 *   personaId,
 * });
 *
 * // Execute a goal's full flow
 * await executeGoalFlow(goalDefinition);
 */

import { useCallback, useEffect, useRef } from "react";

import type {
	QuickStartGoalDefinition,
	QuickStartFlowStepDefinition,
} from "@/lib/config/quickstart/wizardFlows";
import { useGoalFlowExecutionStore } from "@/lib/stores/goalFlowExecution";
import type { WebhookStage } from "@/lib/stores/dashboard";
import { captureQuickStartEvent } from "@/lib/analytics/quickstart";
import {
	headlessImportAction,
	headlessCampaignAction,
	headlessWebhookAction,
	headlessMarketSearchAction,
	headlessExtensionAction,
} from "@/lib/automation/headlessFlowActions";

/**
 * Handlers required by the goal flow executor.
 * These are the "normal" modal-based handlers used for single-click behavior.
 * The executor also uses headless versions for hold-based automation.
 */
interface GoalFlowExecutorHandlers {
	readonly onImport: () => void;
	readonly onCampaignCreate: () => void;
	readonly onOpenWebhookModal: (stage: WebhookStage) => void;
	readonly onStartNewSearch: () => void;
	readonly onBrowserExtension: () => void;
	readonly createRouterPush: (path: string) => () => void;
	readonly leadListStore: any; // For creating mock lead lists
	readonly campaignStore: any; // For creating mock campaigns
	readonly personaId: string | null; // Current user persona
}

interface UseGoalFlowExecutorReturn {
	readonly executeGoalFlow: (goal: QuickStartGoalDefinition) => Promise<void>;
	readonly retry: () => void;
	readonly cancel: () => void;
	readonly currentState: {
		readonly status: ReturnType<typeof useGoalFlowExecutionStore>["status"];
		readonly currentCardId: ReturnType<
			typeof useGoalFlowExecutionStore
		>["currentCardId"];
		readonly progress: ReturnType<typeof useGoalFlowExecutionStore>["progress"];
		readonly error: ReturnType<typeof useGoalFlowExecutionStore>["error"];
		readonly retryCount: ReturnType<
			typeof useGoalFlowExecutionStore
		>["retryCount"];
		readonly maxRetries: ReturnType<
			typeof useGoalFlowExecutionStore
		>["maxRetries"];
	};
}

/**
 * Hook for executing goal flow steps automatically.
 * Maps cardId values to actual handler functions and orchestrates sequential execution.
 */
export const useGoalFlowExecutor = (
	handlers: GoalFlowExecutorHandlers,
): UseGoalFlowExecutorReturn => {
	const store = useGoalFlowExecutionStore();
	const executionInProgressRef = useRef(false);

	console.log("[useGoalFlowExecutor] Hook initialized with handlers:", {
		hasOnImport: !!handlers.onImport,
		hasOnCampaignCreate: !!handlers.onCampaignCreate,
		hasOnOpenWebhookModal: !!handlers.onOpenWebhookModal,
		hasOnStartNewSearch: !!handlers.onStartNewSearch,
		hasOnBrowserExtension: !!handlers.onBrowserExtension,
		hasCreateRouterPush: !!handlers.createRouterPush,
	});

	/**
	 * Stored resource IDs from automation steps.
	 */
	const createdLeadListIdRef = useRef<string | null>(null);
	const createdCampaignIdRef = useRef<string | null>(null);
	const createdWebhookIdRef = useRef<string | null>(null);

	/**
	 * Maps a cardId to its corresponding headless handler function.
	 * These handlers execute in the background without opening modals.
	 */
	const getHeadlessHandlerForCardId = useCallback(
		(cardId: string, goalId: string): (() => Promise<void>) | null => {
			const handlerMap: Record<string, () => Promise<void>> = {
				import: async () => {
					if (!handlers.personaId) {
						throw new Error("Persona ID required for import");
					}
					const listId = await headlessImportAction(
						goalId as any,
						handlers.personaId as any,
						handlers.leadListStore,
					);
					createdLeadListIdRef.current = listId;
				},
				campaign: async () => {
					if (!handlers.personaId) {
						throw new Error("Persona ID required for campaign");
					}
					const leadListId =
						createdLeadListIdRef.current ||
						handlers.leadListStore.leadLists?.[0]?.id ||
						"demo_list";

					const campaignId = await headlessCampaignAction(
						goalId as any,
						handlers.personaId as any,
						leadListId,
						handlers.campaignStore,
					);
					createdCampaignIdRef.current = campaignId;
				},
				webhooks: async () => {
					const webhookId = await headlessWebhookAction(goalId as any);
					createdWebhookIdRef.current = webhookId;
				},
				"market-deals": async () => {
					await headlessMarketSearchAction();
				},
				extension: async () => {
					await headlessExtensionAction();
				},
				"control-data": async () => {
					// For dashboard navigation, we'll handle this in final action
					console.log(
						"[HeadlessFlow] Control data step - skipping (handled by final action)",
					);
				},
			};

			return handlerMap[cardId] ?? null;
		},
		[handlers],
	);

	/**
	 * Executes a single flow step using headless automation.
	 */
	const executeStep = useCallback(
		async (
			step: QuickStartFlowStepDefinition,
			stepNumber: number,
			totalSteps: number,
		): Promise<void> => {
			const handler = getHeadlessHandlerForCardId(
				step.cardId,
				store.goalId || "",
			);

			if (!handler) {
				throw new Error(`No handler found for cardId: ${step.cardId}`);
			}

			// Capture analytics for step start
			captureQuickStartEvent("goal_flow_step_started", {
				goalId: store.goalId,
				cardId: step.cardId,
				stepIndex: store.currentStepIndex,
				stepNumber,
				totalSteps,
			});

			// Execute the headless handler
			try {
				// Show what's about to happen
				console.log(
					`[useGoalFlowExecutor] Executing headless handler for ${step.cardId}`,
				);

				// Display step in UI for 1 second before execution
				await new Promise((resolve) => setTimeout(resolve, 1000));

				// Execute the headless handler (async, creates mock data in background)
				await handler();

				console.log(
					`[useGoalFlowExecutor] Headless handler completed for ${step.cardId}`,
				);

				// Keep step visible to show completion for 1.2 seconds
				await new Promise((resolve) => setTimeout(resolve, 1200));

				// Capture analytics for step completion
				captureQuickStartEvent("goal_flow_step_completed", {
					goalId: store.goalId,
					cardId: step.cardId,
					stepIndex: store.currentStepIndex,
					stepNumber,
					totalSteps,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error occurred";

				// Capture analytics for step error
				captureQuickStartEvent("goal_flow_step_failed", {
					goalId: store.goalId,
					cardId: step.cardId,
					stepIndex: store.currentStepIndex,
					error: errorMessage,
				});

				throw error;
			}
		},
		[getHeadlessHandlerForCardId, store.goalId, store.currentStepIndex],
	);

	/**
	 * Executes all steps in the goal flow sequentially.
	 */
	const executeAllSteps = useCallback(async (): Promise<void> => {
		const { flowSteps, currentStepIndex, status } = store;
		const totalSteps = flowSteps.length;

		// Prevent double execution
		if (executionInProgressRef.current) {
			console.log(
				"[useGoalFlowExecutor] Execution already in progress, skipping",
			);
			return;
		}

		// Check if we should even start (might be paused)
		if (status !== "executing") {
			console.log("[useGoalFlowExecutor] Not executing - status is:", status);
			return;
		}

		// Mark as executing
		executionInProgressRef.current = true;

		console.log("[useGoalFlowExecutor] Starting flow execution", {
			totalSteps,
			startingFromIndex: currentStepIndex,
		});

		// Start from the current step index (useful for retries and resume)
		for (let i = currentStepIndex; i < flowSteps.length; i++) {
			// Check for pause before each step
			if (store.status === "paused") {
				console.log("[useGoalFlowExecutor] Flow paused, stopping execution");
				executionInProgressRef.current = false;
				return;
			}

			const step = flowSteps[i];

			if (!step) continue;

			const stepNumber = i + 1;
			console.log(
				`[useGoalFlowExecutor] Executing step ${stepNumber}/${totalSteps}: ${step.cardId}`,
			);

			// Update store to reflect current step
			store.setCurrentStep(i, step.cardId);

			try {
				// Execute the step with step number info
				await executeStep(step, stepNumber, totalSteps);

				// Check for pause after step completes
				if (store.status === "paused") {
					console.log(
						"[useGoalFlowExecutor] Flow paused after step completion",
					);
					executionInProgressRef.current = false;
					return;
				}

				// Mark step as complete
				store.completeCurrentStep();

				console.log(
					`[useGoalFlowExecutor] Step ${stepNumber}/${totalSteps} completed`,
				);

				// Delay between steps for better visual feedback
				await new Promise((resolve) => setTimeout(resolve, 800));

				// Check for pause after delay
				if (store.status === "paused") {
					console.log("[useGoalFlowExecutor] Flow paused after delay");
					executionInProgressRef.current = false;
					return;
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to execute step";

				console.error(
					`[useGoalFlowExecutor] Step ${stepNumber}/${totalSteps} failed:`,
					error,
				);

				// Handle step error in store
				store.handleStepError(errorMessage);

				// Mark execution as complete (failed)
				executionInProgressRef.current = false;

				// Stop execution on error
				return;
			}
		}

		// All steps completed successfully
		console.log("[useGoalFlowExecutor] All steps completed successfully");
		store.completeFlow();

		// Capture analytics for flow completion
		captureQuickStartEvent("goal_flow_completed", {
			goalId: store.goalId,
			totalSteps: flowSteps.length,
		});

		// Mark execution as complete and clear created resources
		executionInProgressRef.current = false;

		// Don't clear resource IDs yet - we need them for final action
	}, [store, executeStep]);

	/**
	 * Execute the final action after all flow steps complete.
	 */
	const executeFinalAction = useCallback(
		async (goal: QuickStartGoalDefinition): Promise<void> => {
			if (!goal.finalAction) {
				console.log("[useGoalFlowExecutor] No final action defined");
				return;
			}

			console.log("[useGoalFlowExecutor] Executing final action", {
				type: goal.finalAction.type,
				route: goal.finalAction.route,
				cardId: goal.finalAction.cardId,
			});

			const { type, route } = goal.finalAction;

			// Wait 2 seconds to let user see the "Flow Complete!" message
			await new Promise((resolve) => setTimeout(resolve, 2000));

			try {
				if (type === "route" && route) {
					// Show completion summary
					const pageName =
						route.split("/").pop()?.replace(/-/g, " ") || "destination";

					const createdItems = [];
					if (createdLeadListIdRef.current) {
						const listName = handlers.leadListStore.leadLists?.find(
							(l: any) => l.id === createdLeadListIdRef.current,
						)?.listName;
						if (listName) createdItems.push(`Lead list: ${listName}`);
					}
					if (createdCampaignIdRef.current) {
						createdItems.push("Campaign configured");
					}
					if (createdWebhookIdRef.current) {
						createdItems.push("CRM integration connected");
					}

					toast.success("🎉 Automated setup complete!", {
						description:
							createdItems.length > 0
								? createdItems.join(" • ")
								: "All steps completed successfully",
						duration: 4000,
					});

					// Don't navigate - stay on Quick Start page
					// User can manually go to campaigns page if needed
					console.log(
						"[useGoalFlowExecutor] Flow complete, staying on Quick Start page",
					);

					// Clear resource IDs after showing summary
					setTimeout(() => {
						createdLeadListIdRef.current = null;
						createdCampaignIdRef.current = null;
						createdWebhookIdRef.current = null;
					}, 1000);
				}

				// Capture analytics for final action
				captureQuickStartEvent("goal_flow_final_action", {
					goalId: goal.id,
					actionType: type,
					route: route ?? null,
				});
			} catch (error) {
				console.error(
					"[useGoalFlowExecutor] Error executing final action:",
					error,
				);
			}
		},
		[handlers],
	);

	/**
	 * Main function to start goal flow execution.
	 * Can be called directly (one-click) or after holding completes.
	 */
	const executeGoalFlow = useCallback(
		async (goal: QuickStartGoalDefinition): Promise<void> => {
			console.log("[useGoalFlowExecutor] 🚀 executeGoalFlow called", {
				goalId: goal.id,
				flowSteps: goal.flow.length,
				hasFinalAction: !!goal.finalAction,
				currentStoreGoal: store.currentGoal?.id,
			});

			// If currentGoal isn't set, this is a one-click automation
			// We need to initialize the store with the goal first
			if (!store.currentGoal || store.currentGoal.id !== goal.id) {
				console.log(
					"[useGoalFlowExecutor] 🔧 Initializing store with goal (one-click mode)",
				);
				// Set the goal in the store first (but don't enter holding state)
				store.startHolding(goal);

				// Immediately transition to executing (skip holding animation)
				// Small delay to let state update propagate
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			// Start execution from the first step
			console.log(
				"[useGoalFlowExecutor] 📍 Calling startExecution, current store:",
				{
					goalId: store.goalId,
					flowSteps: store.flowSteps.length,
					currentStepIndex: store.currentStepIndex,
				},
			);

			store.startExecution();

			// Capture analytics for flow start
			captureQuickStartEvent("goal_flow_started", {
				goalId: goal.id,
				personaId: goal.personaId,
				totalSteps: goal.flow.length,
			});

			// Execute all steps
			await executeAllSteps();

			// After all steps complete, execute the final action
			const currentGoal = store.currentGoal;
			if (currentGoal) {
				await executeFinalAction(currentGoal);
			}
		},
		[store, executeAllSteps, executeFinalAction],
	);

	/**
	 * Retry the current failed step.
	 */
	const retry = useCallback(() => {
		// Clear execution flag to allow retry
		executionInProgressRef.current = false;

		store.retryCurrentStep();

		// Resume execution from the current step will be triggered by useEffect
	}, [store]);

	/**
	 * Cancel the current flow execution.
	 */
	const cancel = useCallback(() => {
		// Capture analytics for cancellation
		captureQuickStartEvent("goal_flow_cancelled", {
			goalId: store.goalId,
			currentStep: store.currentStepIndex,
		});

		// Clear execution flag and created resources
		executionInProgressRef.current = false;
		createdLeadListIdRef.current = null;
		createdCampaignIdRef.current = null;
		createdWebhookIdRef.current = null;

		store.reset();
	}, [store]);

	/**
	 * Auto-trigger execution when status changes to "executing"
	 * (after hold animation completes or after resume).
	 * Only triggers when transitioning TO executing status, not on every step change.
	 */
	const status = useGoalFlowExecutionStore((state) => state.status);
	const currentStepIndex = useGoalFlowExecutionStore(
		(state) => state.currentStepIndex,
	);
	const flowStepsLength = useGoalFlowExecutionStore(
		(state) => state.flowSteps.length,
	);

	const prevStatusRef = useRef(status);
	useEffect(() => {
		const currentStatus = status;
		const prevStatus = prevStatusRef.current;

		console.log("[useGoalFlowExecutor] 👀 Status effect triggered", {
			prevStatus,
			currentStatus,
			currentStepIndex,
			flowStepsLength,
			executionInProgress: executionInProgressRef.current,
		});

		// Only execute when transitioning TO "executing" from another status
		if (
			currentStatus === "executing" &&
			prevStatus !== "executing" &&
			currentStepIndex >= 0 &&
			flowStepsLength > 0 &&
			!executionInProgressRef.current
		) {
			console.log(
				"[useGoalFlowExecutor] ✅ Conditions met - starting flow execution",
			);
			executeAllSteps();
		}

		// Update previous status
		prevStatusRef.current = currentStatus;
	}, [status, currentStepIndex, flowStepsLength, executeAllSteps]);

	return {
		executeGoalFlow,
		retry,
		cancel,
		currentState: {
			status: store.status,
			currentCardId: store.currentCardId,
			progress: store.progress,
			error: store.error,
			retryCount: store.retryCount,
			maxRetries: store.maxRetries,
		},
	};
};
