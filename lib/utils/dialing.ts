import type { EndedReason } from "@/types/vapiAi/api/calls/_enums";

/**
 * Returns true if the ended reason represents a voicemail detection.
 */
export function isVoicemail(reason: EndedReason | null | undefined): boolean {
	return reason === "voicemail";
}

/**
 * Returns true if the ended reason is considered an answered call (excluding voicemail).
 * This is the baseline definition before applying the voicemail flag override.
 */
export function isAnswered(reason: EndedReason | null | undefined): boolean {
	if (!reason) return false;
	// Treat these as answered connections by default
	return (
		reason === "customer-ended-call" ||
		reason === "assistant-ended-call" ||
		reason === "assistant-said-end-call-phrase" ||
		reason === "assistant-forwarded-call"
	);
}

/**
 * Applies the campaign setting: when enabled, voicemail is treated as answered.
 */
export function isAnsweredConsideringVoicemail(
	reason: EndedReason | null | undefined,
	countVoicemailAsAnswered: boolean | undefined,
): boolean {
	if (isAnswered(reasonsafe(reason))) return true;
	if (countVoicemailAsAnswered && isVoicemail(reason)) return true;
	return false;
}

/**
 * Lightweight guard to keep type-narrowing readable.
 */
function reasonsafe(r?: EndedReason | null): EndedReason | null {
	return r ?? null;
}

export type PacingCheckInput = {
	// attempts made lifetime and caps
	totalAttemptsMade?: number; // attempts already made for this lead/number
	totalDialAttempts?: number; // cap
	// attempts made today and daily caps
	dailyAttemptsMade?: number;
	maxDailyAttempts?: number; // cap per day
	// pacing cooldown
	lastAttemptAt?: Date | string | number; // when the last attempt started/ended
	minMinutesBetweenCalls?: number; // minutes
	// outcome awareness
	lastEndedReason?: EndedReason | null;
	countVoicemailAsAnswered?: boolean;
	// current time injection (for testability)
	now?: Date;
};

export type PacingCheckResult = {
	canAttemptNow: boolean;
	reason?:
		| "reached_total_cap"
		| "reached_daily_cap"
		| "cooldown_active"
		| "answered_stop"
		| "ok";
	nextAllowedAt?: Date; // when cooldown clears (if any)
};

/**
 * Determines if a new attempt is allowed right now considering caps/cooldown and answered state.
 * - If last call was answered (considering voicemail flag), you may choose to stop redialing this lead.
 * - Enforces total cap, daily cap, and pacing cooldown.
 */
export function canDialNow(input: PacingCheckInput): PacingCheckResult {
	const now = input.now ?? new Date();
	// Stop further attempts if the last outcome is considered answered
	if (
		isAnsweredConsideringVoicemail(
			input.lastEndedReason ?? null,
			input.countVoicemailAsAnswered,
		)
	) {
		return { canAttemptNow: false, reason: "answered_stop" };
	}

	// Total cap
	if (
		isFiniteNum(input.totalDialAttempts) &&
		isFiniteNum(input.totalAttemptsMade) &&
		(input.totalAttemptsMade as number) >= (input.totalDialAttempts as number)
	) {
		return { canAttemptNow: false, reason: "reached_total_cap" };
	}

	// Daily cap
	if (
		isFiniteNum(input.maxDailyAttempts) &&
		isFiniteNum(input.dailyAttemptsMade) &&
		(input.dailyAttemptsMade as number) >= (input.maxDailyAttempts as number)
	) {
		return { canAttemptNow: false, reason: "reached_daily_cap" };
	}

	// Cooldown pacing
	if (isFiniteNum(input.minMinutesBetweenCalls) && input.lastAttemptAt) {
		const last = new Date(input.lastAttemptAt);
		const msCooldown = (input.minMinutesBetweenCalls as number) * 60 * 1000;
		const next = new Date(last.getTime() + msCooldown);
		if (now < next) {
			return {
				canAttemptNow: false,
				reason: "cooldown_active",
				nextAllowedAt: next,
			};
		}
	}

	return { canAttemptNow: true, reason: "ok" };
}

/**
 * Returns a normalized bucket label for reporting/analytics.
 */
export function outcomeBucket(
	reason: EndedReason | null | undefined,
	countVoicemailAsAnswered?: boolean,
): "answered" | "voicemail" | "unanswered" | "failed" {
	if (
		isAnsweredConsideringVoicemail(reason ?? null, !!countVoicemailAsAnswered)
	) {
		return "answered";
	}
	if (isVoicemail(reason)) return "voicemail";
	if (reason === "customer-did-not-answer" || reason === "customer-busy") {
		return "unanswered";
	}
	return "failed"; // technical or other
}

/**
 * Increments attempt counters taking into account answered/voicemail policy.
 * Returns an object with booleans for consumer logic to decide what to increment.
 */
export function attemptCountingPolicy(
	reason: EndedReason | null | undefined,
	countVoicemailAsAnswered?: boolean,
): {
	countAsAnswered: boolean; // whether to count toward an "answered" tally
	countTowardAttemptCaps: boolean; // whether this attempt should count toward attempt limits
} {
	const answered = isAnsweredConsideringVoicemail(
		reasonsafe(reason),
		!!countVoicemailAsAnswered,
	);
	// Most orgs count every dial attempt toward caps, regardless of outcome.
	// Keep this explicit for flexibility if product chooses otherwise.
	return {
		countAsAnswered: answered,
		countTowardAttemptCaps: true,
	};
}

function isFiniteNum(n: unknown): n is number {
	return typeof n === "number" && Number.isFinite(n);
}
