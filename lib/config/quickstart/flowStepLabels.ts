/**
 * Human-readable labels for goal flow step execution states.
 * Maps cardId values to user-friendly progress messages.
 */

export type FlowStepPhase = "executing" | "completed";

interface StepLabels {
	readonly executing: string;
	readonly completed: string;
}

const STEP_LABEL_MAP: Record<string, StepLabels> = {
	import: {
		executing: "Preparing leads...",
		completed: "Leads ready ✓",
	},
	campaign: {
		executing: "Creating campaign...",
		completed: "Campaign created ✓",
	},
	webhooks: {
		executing: "Connecting integrations...",
		completed: "Integrations connected ✓",
	},
	"market-deals": {
		executing: "Opening market search...",
		completed: "Market search ready ✓",
	},
	extension: {
		executing: "Opening extension...",
		completed: "Extension ready ✓",
	},
	"control-data": {
		executing: "Opening dashboard...",
		completed: "Dashboard ready ✓",
	},
} as const;

/**
 * Get the display label for a flow step based on its cardId and execution phase.
 *
 * @param cardId - The card identifier from the flow definition
 * @param phase - Whether the step is currently executing or completed
 * @param stepNumber - Optional step number (1-based) for dynamic labeling
 * @param totalSteps - Optional total steps for context
 * @returns Human-readable label for display in the UI
 */
export const getStepLabel = (
	cardId: string,
	phase: FlowStepPhase,
	stepNumber?: number,
	totalSteps?: number,
): string => {
	const labels = STEP_LABEL_MAP[cardId];

	if (!labels) {
		// Fallback for unknown cardIds
		if (stepNumber && totalSteps) {
			return phase === "executing"
				? `Step ${stepNumber}/${totalSteps}: Processing...`
				: `Step ${stepNumber}/${totalSteps} complete ✓`;
		}
		return phase === "executing"
			? `Processing ${cardId}...`
			: `${cardId} complete ✓`;
	}

	// If we have step numbers, use them for better context
	if (stepNumber && totalSteps && phase === "executing") {
		// Extract the action from the label (e.g., "Importing leads..." from "Step 1: Importing leads...")
		const action = labels.executing.replace(/^Step \d+:\s*/, "");
		return `Step ${stepNumber}/${totalSteps}: ${action}`;
	}

	return labels[phase];
};

/**
 * Get both executing and completed labels for a step.
 * Useful for pre-loading or displaying both states.
 *
 * @param cardId - The card identifier from the flow definition
 * @returns Object with both executing and completed labels
 */
export const getStepLabels = (cardId: string): StepLabels => {
	return (
		STEP_LABEL_MAP[cardId] ?? {
			executing: `Processing ${cardId}...`,
			completed: `${cardId} complete ✓`,
		}
	);
};

/**
 * Get a simple action verb for the step (used in "Hold to [verb]" text).
 *
 * @param cardId - The card identifier from the flow definition
 * @returns Action verb (e.g., "Import", "Create Campaign")
 */
export const getStepActionVerb = (cardId: string): string => {
	const verbMap: Record<string, string> = {
		import: "Import Leads",
		campaign: "Create Campaign",
		webhooks: "Setup Webhooks",
		"market-deals": "Search Market",
		extension: "Setup Extension",
		"control-data": "View Dashboard",
	};

	return verbMap[cardId] ?? cardId;
};
