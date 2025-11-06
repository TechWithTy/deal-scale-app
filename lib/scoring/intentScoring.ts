/**
 * Intent Scoring Engine
 *
 * Calculates intent scores for leads based on their signals and activities.
 * Implements signal weighting, time decay, and trend analysis.
 */

import type {
	IntentSignal,
	IntentSignalCategory,
	IntentSignalType,
	IntentScore,
	IntentScoreBreakdown,
	IntentTrend,
	IntentLevel,
	ScoringWeights,
	GroupedIntentSignals,
} from "@/types/_dashboard/intentSignals";

import { DEFAULT_SCORING_WEIGHTS } from "@/types/_dashboard/intentSignals";

// Re-export the default weights for external use
export { DEFAULT_SCORING_WEIGHTS };

/** Number of days after which signal decay begins */
const DECAY_START_DAYS = 7;

/** Daily decay rate (5% per day after decay start) */
const DAILY_DECAY_RATE = 0.05;

/** Maximum age of signals to consider (in days) */
const MAX_SIGNAL_AGE_DAYS = 30;

/**
 * Get the weight for a specific signal category
 * @param category - The signal category
 * @param weights - Custom weights (optional, defaults to DEFAULT_SCORING_WEIGHTS)
 * @returns The weight value for the category
 */
export function getSignalWeight(
	category: IntentSignalCategory,
	weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): number {
	// Check high intent signals
	if (category in weights.high) {
		return weights.high[category as keyof typeof weights.high];
	}
	// Check medium intent signals
	if (category in weights.medium) {
		return weights.medium[category as keyof typeof weights.medium];
	}
	// Check low intent signals
	if (category in weights.low) {
		return weights.low[category as keyof typeof weights.low];
	}
	// Check very low intent signals
	if (category in weights.veryLow) {
		return weights.veryLow[category as keyof typeof weights.veryLow];
	}
	// Default weight for unknown categories
	return 1;
}

/**
 * Calculate time-based decay factor for a signal
 * Signals older than DECAY_START_DAYS have their score reduced
 * @param timestamp - ISO timestamp of the signal
 * @returns Decay multiplier (0-1)
 */
export function calculateDecayFactor(timestamp: string): number {
	const signalDate = new Date(timestamp);
	const now = new Date();
	const ageInDays =
		(now.getTime() - signalDate.getTime()) / (1000 * 60 * 60 * 24);

	// No decay for recent signals
	if (ageInDays <= DECAY_START_DAYS) {
		return 1.0;
	}

	// Signals older than max age are ignored
	if (ageInDays > MAX_SIGNAL_AGE_DAYS) {
		return 0;
	}

	// Apply linear decay after decay start
	const daysOverThreshold = ageInDays - DECAY_START_DAYS;
	const decayFactor = 1 - daysOverThreshold * DAILY_DECAY_RATE;

	// Ensure we don't go negative
	return Math.max(0, Math.min(1, decayFactor));
}

/**
 * Group signals by their type (engagement, behavioral, external)
 * @param signals - Array of intent signals
 * @returns Grouped signals object
 */
export function groupSignalsByType(
	signals: IntentSignal[],
): GroupedIntentSignals {
	const grouped: GroupedIntentSignals = {
		engagement: [],
		behavioral: [],
		external: [],
	};

	for (const signal of signals) {
		grouped[signal.type].push(signal);
	}

	return grouped;
}

/**
 * Calculate score for a group of signals
 * @param signals - Array of signals to score
 * @param weights - Scoring weights configuration
 * @returns Total score for the signal group
 */
function calculateGroupScore(
	signals: IntentSignal[],
	weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): number {
	let totalScore = 0;

	for (const signal of signals) {
		const baseWeight = getSignalWeight(signal.category, weights);
		const decayFactor = calculateDecayFactor(signal.timestamp);
		const signalScore = baseWeight * decayFactor;
		totalScore += signalScore;
	}

	return totalScore;
}

/**
 * Determine intent level based on total score
 * @param score - Total intent score
 * @returns Intent level classification
 */
export function getIntentLevel(score: number): IntentLevel {
	if (score >= 75) return "high";
	if (score >= 50) return "medium";
	if (score > 0) return "low";
	return "none";
}

/**
 * Calculate trend compared to previous period
 * @param signals - All signals
 * @param daysBack - Number of days to look back for comparison (default: 7)
 * @returns Trend percentage change
 */
export function calculateTrend(
	signals: IntentSignal[],
	daysBack = 7,
): { trend: IntentTrend; trendPercent: number } {
	const now = new Date();
	const periodStart = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
	const previousPeriodStart = new Date(
		now.getTime() - daysBack * 2 * 24 * 60 * 60 * 1000,
	);

	// Separate signals into current and previous periods
	const currentPeriodSignals = signals.filter((signal) => {
		const signalDate = new Date(signal.timestamp);
		return signalDate >= periodStart && signalDate <= now;
	});

	const previousPeriodSignals = signals.filter((signal) => {
		const signalDate = new Date(signal.timestamp);
		return signalDate >= previousPeriodStart && signalDate < periodStart;
	});

	// Calculate scores for each period
	const currentScore = calculateGroupScore(currentPeriodSignals);
	const previousScore = calculateGroupScore(previousPeriodSignals);

	// Calculate percentage change
	let trendPercent = 0;
	let trend: IntentTrend = "stable";

	if (previousScore > 0) {
		trendPercent = ((currentScore - previousScore) / previousScore) * 100;
	} else if (currentScore > 0) {
		trendPercent = 100; // New activity from zero
	}

	// Determine trend direction (>5% change is significant)
	if (trendPercent > 5) {
		trend = "up";
	} else if (trendPercent < -5) {
		trend = "down";
	}

	return { trend, trendPercent: Math.round(trendPercent * 10) / 10 };
}

/**
 * Calculate complete intent score from signals
 * @param signals - Array of intent signals for a lead
 * @param weights - Optional custom scoring weights
 * @returns Complete intent score with breakdown and trends
 */
export function calculateIntentScore(
	signals: IntentSignal[],
	weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): IntentScore {
	// Filter out signals older than max age
	const validSignals = signals.filter((signal) => {
		const decayFactor = calculateDecayFactor(signal.timestamp);
		return decayFactor > 0;
	});

	// Group signals by type
	const grouped = groupSignalsByType(validSignals);

	// Calculate scores for each type
	const breakdown: IntentScoreBreakdown = {
		engagement: calculateGroupScore(grouped.engagement, weights),
		behavioral: calculateGroupScore(grouped.behavioral, weights),
		external: calculateGroupScore(grouped.external, weights),
	};

	// Calculate total score (normalize to 0-100 scale)
	// Max theoretical score is around 300+ if all high-value signals are present
	// We'll use a logarithmic scale to keep most scores in reasonable range
	const rawTotal =
		breakdown.engagement + breakdown.behavioral + breakdown.external;
	const normalizedTotal = Math.min(100, Math.round(rawTotal * 0.8));

	// Get intent level
	const level = getIntentLevel(normalizedTotal);

	// Calculate trend
	const { trend, trendPercent } = calculateTrend(validSignals);

	return {
		total: normalizedTotal,
		level,
		breakdown,
		trend,
		trendPercent,
		signalCount: validSignals.length,
		calculatedAt: new Date().toISOString(),
	};
}

/**
 * Sort signals by timestamp (most recent first)
 * @param signals - Array of signals to sort
 * @returns Sorted array of signals
 */
export function sortSignalsByTimestamp(
	signals: IntentSignal[],
): IntentSignal[] {
	return [...signals].sort((a, b) => {
		return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
	});
}

/**
 * Get the most recent signal from an array
 * @param signals - Array of signals
 * @returns The most recent signal or null
 */
export function getMostRecentSignal(
	signals: IntentSignal[],
): IntentSignal | null {
	if (signals.length === 0) return null;
	const sorted = sortSignalsByTimestamp(signals);
	return sorted[0];
}

/**
 * Filter signals by type
 * @param signals - Array of signals
 * @param type - Signal type to filter by
 * @returns Filtered array of signals
 */
export function filterSignalsByType(
	signals: IntentSignal[],
	type: IntentSignalType,
): IntentSignal[] {
	return signals.filter((signal) => signal.type === type);
}

/**
 * Get signal count by category
 * @param signals - Array of signals
 * @returns Object with category counts
 */
export function getSignalCountsByCategory(
	signals: IntentSignal[],
): Record<IntentSignalCategory, number> {
	const counts = {} as Record<IntentSignalCategory, number>;

	for (const signal of signals) {
		counts[signal.category] = (counts[signal.category] || 0) + 1;
	}

	return counts;
}
