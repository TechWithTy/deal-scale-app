"use client";

import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Target,
	Loader2,
	CheckCircle2,
	AlertCircle,
	RotateCcw,
	X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/_utils";
import type { QuickStartGoalDefinition } from "@/lib/config/quickstart/wizardFlows";
import { useGoalFlowExecutionStore } from "@/lib/stores/goalFlowExecution";
import { getStepLabel } from "@/lib/config/quickstart/flowStepLabels";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Props for the HoldableGoalButton component.
 *
 * @property goal - The goal definition containing flow steps and metadata
 * @property isCurrentGoal - Whether this goal is currently selected
 * @property onHoldComplete - Callback when 2s hold completes (triggers automation)
 * @property onNormalClick - Callback for quick clicks (opens first step modal)
 * @property onRetry - Callback to retry a failed step
 * @property onCancel - Callback to cancel the entire flow
 * @property className - Optional additional CSS classes
 */
interface HoldableGoalButtonProps {
	readonly goal: QuickStartGoalDefinition;
	readonly isCurrentGoal: boolean;
	readonly onHoldComplete: () => void;
	readonly onNormalClick: () => void;
	readonly onRetry: () => void;
	readonly onCancel: () => void;
	readonly className?: string;
}

/** Total time user must hold before automation triggers */
const HOLD_DURATION = 2000; // 2 seconds

/** Progress bar starting position (0% = empty) */
const HOLD_START_PROGRESS = 0;

/** Threshold to distinguish click from hold */
const CLICK_THRESHOLD = 200; // ms

/** Delay before showing hold animation (prevents accidental holds on quick clicks) */
const HOLD_ANIMATION_DELAY = 300; // ms

/**
 * Interactive goal button supporting both single-click (opens modal)
 * and hold-to-automate (headless execution) interactions.
 *
 * Features:
 * - Single click: Opens first step modal for manual workflow
 * - Hold 2s: Executes entire flow headlessly with mock data
 * - Visual progress bar during hold
 * - Real-time step updates during execution
 * - Pause/resume capability
 * - Error handling with retry
 * - Theme-adaptive styling
 */

export const HoldableGoalButton: FC<HoldableGoalButtonProps> = ({
	goal,
	isCurrentGoal,
	onHoldComplete,
	onNormalClick,
	onRetry,
	onCancel,
	className,
}) => {
	const [isHolding, setIsHolding] = useState(false);
	const [localHoldProgress, setLocalHoldProgress] =
		useState(HOLD_START_PROGRESS);
	const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
	const holdAnimationDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
	const holdStartTimeRef = useRef<number | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const clickStartTimeRef = useRef<number | null>(null);

	const {
		goalId: activeGoalId,
		status,
		currentCardId,
		currentStepIndex,
		flowSteps,
		error,
		retryCount,
		maxRetries,
		startHolding,
		completeHold,
		cancelHold,
		pauseFlow,
		resumeFlow,
	} = useGoalFlowExecutionStore();

	const isThisGoalActive = activeGoalId === goal.id;
	const isIdle = status === "idle";
	const isHoldingState = status === "holding" && isThisGoalActive;
	const isExecuting = status === "executing" && isThisGoalActive;
	const isPaused = status === "paused" && isThisGoalActive;
	const isCompleted = status === "completed" && isThisGoalActive;
	const isError = status === "error" && isThisGoalActive;

	// Cleanup timers on unmount
	useEffect(() => {
		return () => {
			if (holdTimerRef.current) {
				clearTimeout(holdTimerRef.current);
			}
			if (holdAnimationDelayTimerRef.current) {
				clearTimeout(holdAnimationDelayTimerRef.current);
			}
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	// Update hold progress animation
	const updateHoldProgress = () => {
		if (!holdStartTimeRef.current) return;

		const elapsed = Date.now() - holdStartTimeRef.current;
		// Progress from 0% to 100% over HOLD_DURATION
		const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);

		setLocalHoldProgress(progress);

		if (progress < 100) {
			animationFrameRef.current = requestAnimationFrame(updateHoldProgress);
		}
	};

	const handlePointerDown = (e: React.PointerEvent) => {
		console.log("═══════════════════════════════════════");
		console.log("[HoldableGoalButton] 🖱️ POINTER DOWN", {
			goalId: goal.id,
			isIdle,
			isThisGoalActive,
			status,
			activeGoalId,
			pointerType: e.pointerType,
			button: e.button,
		});

		// Only allow interaction if we're in idle state
		if (!isIdle) {
			console.log(
				"[HoldableGoalButton] ❌ BLOCKED: not in idle state, status is:",
				status,
			);
			return;
		}

		if (isThisGoalActive && status !== "idle") {
			console.log(
				"[HoldableGoalButton] ❌ BLOCKED: this goal is already active",
			);
			return;
		}

		// Record click start time for distinguishing click vs hold
		clickStartTimeRef.current = Date.now();

		console.log(
			"[HoldableGoalButton] ⏰ Click start time recorded:",
			clickStartTimeRef.current,
		);
		console.log(
			"[HoldableGoalButton] ⏳ Waiting",
			HOLD_ANIMATION_DELAY,
			"ms before showing hold animation",
		);

		// Delay showing the hold animation to allow normal clicks
		holdAnimationDelayTimerRef.current = setTimeout(() => {
			console.log(
				"[HoldableGoalButton] Starting hold animation (held long enough)",
			);

			// Start hold animation
			setIsHolding(true);
			holdStartTimeRef.current = Date.now();
			setLocalHoldProgress(HOLD_START_PROGRESS);

			// Start the store's holding state
			startHolding(goal);

			// Start progress animation
			animationFrameRef.current = requestAnimationFrame(updateHoldProgress);

			// Set timer for hold completion (automated flow trigger)
			// Subtract the delay we already waited
			holdTimerRef.current = setTimeout(() => {
				console.log(
					"[HoldableGoalButton] Hold complete (2s+), executing automated flow",
				);
				setIsHolding(false);
				completeHold();
				onHoldComplete();
			}, HOLD_DURATION - HOLD_ANIMATION_DELAY);
		}, HOLD_ANIMATION_DELAY);
	};

	const handlePointerUp = (e?: React.PointerEvent) => {
		console.log("───────────────────────────────────────");
		console.log("[HoldableGoalButton] 🖱️ POINTER UP", {
			isHolding,
			hasClickStartTime: !!clickStartTimeRef.current,
			isIdle,
			status,
		});

		// If no click start time, this wasn't initiated by us - ignore
		if (!clickStartTimeRef.current) {
			console.log(
				"[HoldableGoalButton] ⚠️ No click start time, ignoring pointer up",
			);
			return;
		}

		// Calculate hold duration
		const holdDuration = Date.now() - clickStartTimeRef.current;

		console.log("[HoldableGoalButton] ⏱️ Hold duration:", holdDuration, "ms");
		console.log("[HoldableGoalButton] 📊 Thresholds:", {
			animationDelay: HOLD_ANIMATION_DELAY,
			totalDuration: HOLD_DURATION,
			isHolding,
		});

		// Clear the animation delay timer if it hasn't fired yet
		if (holdAnimationDelayTimerRef.current) {
			console.log("[HoldableGoalButton] Clearing animation delay timer");
			clearTimeout(holdAnimationDelayTimerRef.current);
			holdAnimationDelayTimerRef.current = null;
		}

		// If it was a quick click (released before animation even started)
		if (holdDuration < HOLD_ANIMATION_DELAY) {
			console.log(
				"[HoldableGoalButton] ✅ QUICK CLICK DETECTED (<",
				HOLD_ANIMATION_DELAY,
				"ms)",
			);
			console.log(
				"[HoldableGoalButton] 🎯 Calling onNormalClick for goal:",
				goal.id,
			);
			console.log(
				"[HoldableGoalButton] 🔹 Is one-click automatable?",
				goal.isOneClickAutomatable,
			);

			// Clear click start time
			clickStartTimeRef.current = null;

			// Call the normal click handler (async)
			setTimeout(async () => {
				try {
					await onNormalClick();
					console.log(
						"[HoldableGoalButton] ✓ onNormalClick completed successfully",
					);
				} catch (error) {
					console.error(
						"[HoldableGoalButton] ❌ Error in onNormalClick:",
						error,
					);
				}
			}, 0);

			return;
		}

		// If released before 2 seconds but after animation started, cancel the automated flow
		if (isHolding || holdDuration >= HOLD_ANIMATION_DELAY) {
			console.log(
				"[HoldableGoalButton] Canceling hold (released before completion)",
				{
					isHolding,
					holdDuration,
				},
			);

			// Clean up all state
			setIsHolding(false);
			holdStartTimeRef.current = null;
			clickStartTimeRef.current = null;
			setLocalHoldProgress(HOLD_START_PROGRESS);

			if (holdTimerRef.current) {
				clearTimeout(holdTimerRef.current);
				holdTimerRef.current = null;
			}

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}

			// Only cancel hold in store if we actually started the hold state
			if (isHolding) {
				console.log("[HoldableGoalButton] Canceling hold in store");
				cancelHold();
			}
		}
	};

	const handleRetryClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onRetry();
	};

	const handleCancelClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onCancel();
	};

	const handlePauseClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log("[HoldableGoalButton] Pause clicked");
		pauseFlow();
	};

	const handleResumeClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log("[HoldableGoalButton] Resume clicked");
		resumeFlow();
	};

	// Determine button text based on state
	const getButtonText = (): string => {
		if (isError) {
			return `Failed: ${error ?? "Unknown error"}`;
		}

		if (isCompleted) {
			return "Flow Complete! ✓";
		}

		if (isPaused && currentCardId) {
			const stepNumber = currentStepIndex + 1;
			const totalSteps = flowSteps.length;
			return `Paused at ${stepNumber}/${totalSteps}`;
		}

		if (isExecuting && currentCardId) {
			const stepNumber = currentStepIndex + 1;
			const totalSteps = flowSteps.length;
			return getStepLabel(currentCardId, "executing", stepNumber, totalSteps);
		}

		if (isHoldingState) {
			const holdPercentage = Math.round(localHoldProgress);
			return `Hold 2s to automate (${holdPercentage}%)`;
		}

		return goal.title;
	};

	// Determine button icon
	const getButtonIcon = () => {
		if (isError) {
			return <AlertCircle className="h-4 w-4" />;
		}

		if (isCompleted) {
			return <CheckCircle2 className="h-4 w-4" />;
		}

		if (isExecuting) {
			return <Loader2 className="h-4 w-4 animate-spin" />;
		}

		return <Target className="h-4 w-4" />;
	};

	// Calculate background fill percentage
	const fillPercentage = isHoldingState
		? localHoldProgress
		: isExecuting
			? 100 // Show full during execution
			: 0; // Start at 0

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className="relative"
						onMouseEnter={() =>
							console.log(
								"[HoldableGoalButton] Mouse enter - should do nothing",
							)
						}
						onMouseLeave={() =>
							console.log(
								"[HoldableGoalButton] Mouse leave - should do nothing",
							)
						}
					>
						<Button
							type="button"
							variant={isCurrentGoal && isIdle ? "default" : "outline"}
							onPointerDown={handlePointerDown}
							onPointerUp={handlePointerUp}
							onPointerLeave={handlePointerUp}
							onPointerCancel={handlePointerUp}
							disabled={isExecuting || isPaused || isCompleted}
							className={cn(
								"relative w-full justify-center gap-2 overflow-hidden transition-all duration-300",
								isCurrentGoal &&
									isIdle &&
									"bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/40",
								!isCurrentGoal &&
									isIdle &&
									"border-primary/30 hover:bg-primary/10",
								isHoldingState &&
									"border-amber-500 shadow-lg shadow-amber-500/40",
								isExecuting && "border-blue-500 shadow-lg shadow-blue-500/30",
								isPaused &&
									"border-amber-600 bg-amber-600/10 shadow-lg shadow-amber-600/40",
								isCompleted &&
									"border-green-500 bg-green-500/10 shadow-lg shadow-green-500/40",
								isError &&
									"border-red-500 bg-red-500/10 shadow-lg shadow-red-500/40",
								className,
							)}
						>
							{/* Animated background fill */}
							<motion.div
								className={cn(
									"absolute inset-0 z-0",
									isHoldingState &&
										"bg-gradient-to-r from-amber-500/40 to-orange-500/40",
									isExecuting &&
										"bg-gradient-to-r from-blue-500/30 to-indigo-500/30",
									isCompleted &&
										"bg-gradient-to-r from-green-500/30 to-emerald-500/30",
									isError && "bg-gradient-to-r from-red-500/20 to-rose-500/20",
								)}
								initial={{ width: `${HOLD_START_PROGRESS}%` }}
								animate={{
									width: isHoldingState
										? `${localHoldProgress}%`
										: isExecuting
											? "100%"
											: `${fillPercentage}%`,
								}}
								transition={{
									duration: isExecuting ? 0.5 : 0.1,
									ease: "easeInOut",
								}}
							/>

							{/* Button content */}
							<span className="relative z-10 flex items-center gap-2">
								{getButtonIcon()}
								<span className="truncate">{getButtonText()}</span>
							</span>

							{/* Pulse animation for holding state */}
							{isHoldingState && (
								<motion.div
									className="absolute inset-0 z-0 bg-amber-400/20"
									animate={{ opacity: [0.3, 0.6, 0.3] }}
									transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
								/>
							)}
						</Button>

						{/* Retry button overlay for error state */}
						<AnimatePresence>
							{isError && retryCount < maxRetries && (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									className="absolute inset-0 flex items-center justify-center gap-2"
								>
									<Button
										type="button"
										size="sm"
										variant="destructive"
										onClick={handleRetryClick}
										className="gap-2 shadow-lg"
									>
										<RotateCcw className="h-3 w-3" />
										Retry ({retryCount}/{maxRetries})
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={handleCancelClick}
										className="gap-2 shadow-lg"
									>
										<X className="h-3 w-3" />
										Cancel
									</Button>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Pause/Cancel button overlay for executing state */}
						<AnimatePresence>
							{isExecuting && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-2"
								>
									<Button
										type="button"
										size="sm"
										variant="secondary"
										onClick={handlePauseClick}
										className="gap-2 shadow-lg border-2 border-amber-500/20 hover:border-amber-500/40"
									>
										Pause
									</Button>
									<Button
										type="button"
										size="sm"
										variant="secondary"
										onClick={handleCancelClick}
										className="gap-2 shadow-lg border-2 border-destructive/20 hover:border-destructive/40"
									>
										<X className="h-3 w-3" />
										Stop
									</Button>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Resume/Cancel button overlay for paused state */}
						<AnimatePresence>
							{isPaused && (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									className="absolute inset-0 flex items-center justify-center gap-2"
								>
									<Button
										type="button"
										size="sm"
										variant="default"
										onClick={handleResumeClick}
										className="gap-2 shadow-lg"
									>
										Resume
									</Button>
									<Button
										type="button"
										size="sm"
										variant="outline"
										onClick={handleCancelClick}
										className="gap-2 shadow-lg"
									>
										<X className="h-3 w-3" />
										Cancel
									</Button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<div className="space-y-1 text-sm max-w-xs">
						<p className="font-semibold">{goal.title}</p>
						<p className="text-muted-foreground text-xs">{goal.description}</p>
						{isIdle && (
							<>
								<p className="text-primary text-xs font-medium">
									Click = Open first step | Hold 2s = Run all headlessly
								</p>
								<p className="text-muted-foreground text-xs">
									{goal.flow.length} steps:{" "}
									{goal.flow.map((s) => s.cardId).join(" → ")}
								</p>
								{goal.isOneClickAutomatable && (
									<p className="text-amber-500 text-xs font-medium">
										⚡ Quick-start enabled - optimized for speed
									</p>
								)}
							</>
						)}
						{isError && (
							<p className="text-destructive text-xs font-medium">
								{error ?? "An error occurred"}
							</p>
						)}
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
