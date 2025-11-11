/**
 * Goal Flow Execution Store
 *
 * Manages the state of automated goal flow execution, including:
 * - Hold animation progress (0-100%)
 * - Current executing step
 * - Error handling and retry logic
 * - Execution history
 * - Pause/resume state
 *
 * Used by HoldableGoalButton and useGoalFlowExecutor to coordinate
 * the automated execution of Quick Start goal flows.
 */

import { createWithEqualityFn } from "zustand/traditional";

import type {
	QuickStartGoalId,
	QuickStartFlowStepDefinition,
	QuickStartGoalDefinition,
} from "@/lib/config/quickstart/wizardFlows";

/**
 * Possible states of the goal flow execution.
 *
 * - idle: No flow active, button ready for interaction
 * - holding: User is holding button, progress bar filling
 * - executing: Automation running, steps being executed
 * - paused: User paused the flow mid-execution
 * - completed: Flow finished successfully, will auto-reset
 * - error: A step failed, retry available
 */
export type GoalFlowExecutionStatus =
	| "idle"
	| "holding"
	| "executing"
	| "paused"
	| "completed"
	| "error";

/**
 * Record of a single step execution attempt.
 * Used for execution history and debugging.
 */
interface StepExecutionRecord {
	readonly cardId: string;
	readonly startTime: number;
	readonly endTime?: number;
	readonly status: "success" | "error";
	readonly error?: string;
}

interface GoalFlowExecutionState {
	// Current execution state
	readonly goalId: QuickStartGoalId | null;
	readonly status: GoalFlowExecutionStatus;
	readonly currentStepIndex: number;
	readonly currentCardId: string | null;
	readonly progress: number; // 0-100
	readonly holdProgress: number; // 0-100 for hold animation

	// Error handling
	readonly error: string | null;
	readonly retryCount: number;
	readonly maxRetries: number;

	// Execution history
	readonly executionHistory: readonly StepExecutionRecord[];

	// Flow steps (cached from goal definition)
	readonly flowSteps: readonly QuickStartFlowStepDefinition[];

	// Store the complete goal for accessing finalAction later
	readonly currentGoal: QuickStartGoalDefinition | null;

	// Actions
	readonly startHolding: (goal: QuickStartGoalDefinition) => void;
	readonly updateHoldProgress: (progress: number) => void;
	readonly completeHold: () => void;
	readonly cancelHold: () => void;
	readonly startExecution: () => void;
	readonly setCurrentStep: (index: number, cardId: string) => void;
	readonly completeCurrentStep: () => void;
	readonly nextStep: () => void;
	readonly handleStepError: (error: string) => void;
	readonly retryCurrentStep: () => void;
	readonly pauseFlow: () => void;
	readonly resumeFlow: () => void;
	readonly completeFlow: () => void;
	readonly reset: () => void;
}

const defaultState = {
	goalId: null,
	status: "idle" as GoalFlowExecutionStatus,
	currentStepIndex: -1,
	currentCardId: null,
	progress: 0,
	holdProgress: 0, // Start at 0%
	error: null,
	retryCount: 0,
	maxRetries: 3,
	executionHistory: [],
	flowSteps: [],
	currentGoal: null,
} satisfies Pick<
	GoalFlowExecutionState,
	| "goalId"
	| "status"
	| "currentStepIndex"
	| "currentCardId"
	| "progress"
	| "holdProgress"
	| "error"
	| "retryCount"
	| "maxRetries"
	| "executionHistory"
	| "flowSteps"
	| "currentGoal"
>;

export const useGoalFlowExecutionStore =
	createWithEqualityFn<GoalFlowExecutionState>(
		(set, get) => ({
			...defaultState,

			startHolding: (goal) => {
				console.log("[goalFlowExecution] startHolding called", {
					goalId: goal.id,
					flowStepsCount: goal.flow.length,
					flowSteps: goal.flow.map((s) => s.cardId),
					hasFinalAction: !!goal.finalAction,
				});

				set({
					goalId: goal.id,
					flowSteps: goal.flow,
					currentGoal: goal,
					status: "holding",
					holdProgress: 0, // Start at 0%
					currentStepIndex: -1,
					currentCardId: null,
					error: null,
					retryCount: 0,
					executionHistory: [],
				});
			},

			updateHoldProgress: (progress) => {
				const currentStatus = get().status;
				if (currentStatus === "holding") {
					set({ holdProgress: progress });
				}
			},

			completeHold: () => {
				const currentStatus = get().status;
				console.log("[goalFlowExecution] completeHold called", {
					currentStatus,
				});

				if (currentStatus === "holding") {
					set({ holdProgress: 100, status: "executing" });
				}
			},

			cancelHold: () => {
				const currentStatus = get().status;
				if (currentStatus === "holding") {
					get().reset();
				}
			},

			startExecution: () => {
				const { flowSteps } = get();
				const firstStep = flowSteps[0];

				console.log("[goalFlowExecution] 🚀 startExecution called", {
					firstStepCardId: firstStep?.cardId,
					totalFlowSteps: flowSteps.length,
					allSteps: flowSteps.map((s) => s.cardId),
				});

				if (!firstStep) {
					console.error(
						"[goalFlowExecution] ❌ ERROR: No flow steps available!",
					);
					return;
				}

				set({
					status: "executing",
					currentStepIndex: 0,
					currentCardId: firstStep.cardId,
					progress: 0,
				});
			},

			setCurrentStep: (index, cardId) => {
				const { flowSteps } = get();
				const totalSteps = flowSteps.length;
				const progress = totalSteps > 0 ? (index / totalSteps) * 100 : 0;

				set({
					currentStepIndex: index,
					currentCardId: cardId,
					progress,
					error: null,
				});
			},

			completeCurrentStep: () => {
				const { currentStepIndex, currentCardId, executionHistory } = get();

				// Record successful step execution
				const record: StepExecutionRecord = {
					cardId: currentCardId ?? "",
					startTime: Date.now(),
					endTime: Date.now(),
					status: "success",
				};

				set({
					executionHistory: [...executionHistory, record],
					retryCount: 0, // Reset retry count on success
				});
			},

			nextStep: () => {
				const { currentStepIndex, flowSteps } = get();
				const nextIndex = currentStepIndex + 1;

				if (nextIndex >= flowSteps.length) {
					// Flow complete
					get().completeFlow();
				} else {
					// Move to next step
					const nextCardId = flowSteps[nextIndex]?.cardId ?? null;
					get().setCurrentStep(nextIndex, nextCardId);
				}
			},

			handleStepError: (error) => {
				const {
					currentStepIndex,
					currentCardId,
					executionHistory,
					retryCount,
				} = get();

				// Record failed step execution
				const record: StepExecutionRecord = {
					cardId: currentCardId ?? "",
					startTime: Date.now(),
					endTime: Date.now(),
					status: "error",
					error,
				};

				set({
					status: "error",
					error,
					executionHistory: [...executionHistory, record],
					retryCount: retryCount + 1,
				});
			},

			retryCurrentStep: () => {
				const { retryCount, maxRetries } = get();

				if (retryCount >= maxRetries) {
					set({
						error: "Maximum retry attempts reached. Please try manually.",
					});
					return;
				}

				// Clear error and resume execution
				set({
					status: "executing",
					error: null,
				});
			},

			pauseFlow: () => {
				const currentStatus = get().status;
				console.log("[goalFlowExecution] pauseFlow called", { currentStatus });

				if (currentStatus === "executing") {
					set({ status: "paused" });
				}
			},

			resumeFlow: () => {
				const currentStatus = get().status;
				console.log("[goalFlowExecution] resumeFlow called", { currentStatus });

				if (currentStatus === "paused") {
					set({ status: "executing" });
				}
			},

			completeFlow: () => {
				console.log("[goalFlowExecution] completeFlow called");

				set({
					status: "completed",
					progress: 100,
					currentStepIndex: get().flowSteps.length,
					currentCardId: null,
				});

				// Auto-reset after 3 seconds to allow button to be used again
				setTimeout(() => {
					const currentStatus = get().status;
					console.log(
						"[goalFlowExecution] Auto-reset timer fired, current status:",
						currentStatus,
					);
					if (currentStatus === "completed") {
						console.log("[goalFlowExecution] Resetting to idle");
						get().reset();
					}
				}, 3000);
			},

			reset: () => {
				console.log("[goalFlowExecution] 🔄 RESET called - returning to idle");
				set({ ...defaultState });
			},
		}),
		Object.is,
	);
