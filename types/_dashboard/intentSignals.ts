/**
 * Intent Signals Type Definitions
 *
 * Defines types for tracking and scoring lead engagement, behavioral, and external intent signals.
 * Intent signals help identify high-value prospects based on their interactions and activities.
 */

/** Type of intent signal based on data source */
export type IntentSignalType = "engagement" | "behavioral" | "external";

/** Specific category of intent signal with associated activities */
export type IntentSignalCategory =
	// Engagement signals (email/communication interactions)
	| "email_open"
	| "email_click"
	| "email_reply"
	| "sms_reply"
	| "call_answered"
	| "call_connected"
	| "voicemail_listened"
	// Behavioral signals (platform/website interactions)
	| "website_visit"
	| "pricing_viewed"
	| "demo_request"
	| "property_viewed"
	| "property_search"
	| "document_downloaded"
	| "form_submitted"
	| "contract_viewed"
	| "multiple_page_visits"
	| "video_watched"
	| "calculator_used"
	// External signals (third-party data)
	| "linkedin_visit"
	| "linkedin_profile_view"
	| "company_growth"
	| "job_change"
	| "funding_event"
	| "social_follow"
	| "social_mention";

/** Individual intent signal record */
export interface IntentSignal {
	/** Unique identifier for the signal */
	id: string;
	/** Type of signal (engagement, behavioral, external) */
	type: IntentSignalType;
	/** Specific category of the signal */
	category: IntentSignalCategory;
	/** ISO timestamp when the signal was recorded */
	timestamp: string;
	/** Raw score value before any decay calculations */
	rawScore: number;
	/** Additional context-specific metadata */
	metadata?: {
		/** Email subject line (for email signals) */
		emailSubject?: string;
		/** Page URL visited (for website signals) */
		pageUrl?: string;
		/** Page title (for website signals) */
		pageTitle?: string;
		/** Call duration in seconds (for call signals) */
		callDuration?: number;
		/** Document name (for download signals) */
		documentName?: string;
		/** Video duration watched in seconds (for video signals) */
		videoWatchTime?: number;
		/** External data source (for external signals) */
		source?: string;
		/** Any additional custom data */
		customData?: Record<string, unknown>;
	};
}

/** Breakdown of scores by signal type */
export interface IntentScoreBreakdown {
	/** Total score from engagement signals */
	engagement: number;
	/** Total score from behavioral signals */
	behavioral: number;
	/** Total score from external signals */
	external: number;
}

/** Trend direction for intent score changes */
export type IntentTrend = "up" | "down" | "stable";

/** Intent level classification */
export type IntentLevel = "high" | "medium" | "low" | "none";

/** Aggregated intent score with analytics */
export interface IntentScore {
	/** Total calculated intent score (0-100) */
	total: number;
	/** Intent level classification based on total score */
	level: IntentLevel;
	/** Breakdown of score by signal type */
	breakdown: IntentScoreBreakdown;
	/** Trend direction compared to previous period */
	trend: IntentTrend;
	/** Percentage change from previous period */
	trendPercent: number;
	/** Number of signals contributing to the score */
	signalCount: number;
	/** Timestamp of last score calculation */
	calculatedAt: string;
}

/** Configuration for signal score weighting */
export interface ScoringWeights {
	/** High intent signals (20-30 points) */
	high: {
		pricing_viewed: number;
		demo_request: number;
		call_connected: number;
		contract_viewed: number;
		form_submitted: number;
		call_answered: number;
	};
	/** Medium intent signals (10-15 points) */
	medium: {
		property_search: number;
		document_downloaded: number;
		multiple_page_visits: number;
		video_watched: number;
		calculator_used: number;
		email_reply: number;
		sms_reply: number;
	};
	/** Low intent signals (3-7 points) */
	low: {
		email_open: number;
		email_click: number;
		website_visit: number;
		linkedin_profile_view: number;
		property_viewed: number;
		voicemail_listened: number;
	};
	/** Very low intent signals (1-2 points) */
	veryLow: {
		linkedin_visit: number;
		social_follow: number;
		social_mention: number;
		company_growth: number;
		job_change: number;
		funding_event: number;
	};
}

/** Default scoring weights for intent signals */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
	high: {
		pricing_viewed: 30,
		demo_request: 28,
		call_connected: 27,
		contract_viewed: 26,
		form_submitted: 25,
		call_answered: 22,
	},
	medium: {
		property_search: 15,
		document_downloaded: 14,
		multiple_page_visits: 13,
		video_watched: 12,
		calculator_used: 12,
		email_reply: 11,
		sms_reply: 11,
	},
	low: {
		email_open: 7,
		email_click: 6,
		website_visit: 5,
		linkedin_profile_view: 5,
		property_viewed: 4,
		voicemail_listened: 4,
	},
	veryLow: {
		linkedin_visit: 2,
		social_follow: 2,
		social_mention: 2,
		company_growth: 1,
		job_change: 1,
		funding_event: 1,
	},
};

/** Helper type for grouping signals by type */
export interface GroupedIntentSignals {
	engagement: IntentSignal[];
	behavioral: IntentSignal[];
	external: IntentSignal[];
}
