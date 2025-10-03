import { clampScore, labelFromScore, toneFromScore } from "./utils";

export const DEFAULT_SCORE = 50;

export interface SentimentSummary {
	score: number;
	label: "Optimistic" | "Cautious" | "Pessimistic";
	tone: string;
}

const wrap = (score: number): SentimentSummary => {
	const safe = clampScore(score);
	return {
		score: safe,
		label: labelFromScore(safe),
		tone: toneFromScore(safe),
	};
};

export const computeInvestorSentiment = (params: {
	yieldPct: number | null;
	trendPct: number | null;
	medianDom: number | null;
	spreadPct: number | null;
	newListingRatio: number;
}): SentimentSummary => {
	let score = DEFAULT_SCORE;
	if (params.yieldPct != null) {
		if (params.yieldPct >= 8) score += 15;
		else if (params.yieldPct >= 6) score += 8;
		else if (params.yieldPct < 4.5) score -= 8;
	}
	if (params.trendPct != null) {
		if (params.trendPct > 1.5) score += 6;
		else if (params.trendPct < -1.5) score -= 6;
	}
	if (params.medianDom != null) {
		if (params.medianDom <= 35) score += 8;
		else if (params.medianDom >= 90) score -= 12;
		else if (params.medianDom >= 60) score -= 6;
	}
	if (params.spreadPct != null) {
		if (params.spreadPct <= 15) score += 4;
		else if (params.spreadPct >= 45) score -= 6;
	}
	if (params.newListingRatio >= 25) score += 3;
	else if (params.newListingRatio <= 5) score -= 3;
	return wrap(score);
};

export const computeWholesalerSentiment = (params: {
	spreadPct: number | null;
	fastestDom: number | null;
	newListingRatio: number;
}): SentimentSummary => {
	let score = DEFAULT_SCORE;
	if (params.spreadPct != null) {
		if (params.spreadPct >= 35) score += 12;
		else if (params.spreadPct >= 20) score += 6;
		else if (params.spreadPct < 12) score -= 6;
	}
	if (params.fastestDom != null) {
		if (params.fastestDom <= 20) score += 8;
		else if (params.fastestDom >= 60) score -= 8;
	}
	if (params.newListingRatio >= 20) score += 4;
	else if (params.newListingRatio <= 5) score -= 4;
	return wrap(score);
};

export const computeBuyerSentiment = (params: {
	affordabilityIndex: number | null;
	medianDom: number | null;
	trendPct: number | null;
}): SentimentSummary => {
	let score = DEFAULT_SCORE;
	if (params.affordabilityIndex != null) {
		if (params.affordabilityIndex <= 25) score += 8;
		else if (params.affordabilityIndex >= 35) score -= 8;
	}
	if (params.medianDom != null) {
		if (params.medianDom >= 75) score += 10;
		else if (params.medianDom <= 35) score -= 8;
	}
	if (params.trendPct != null) {
		if (params.trendPct < -1.5) score += 6;
		else if (params.trendPct > 1.5) score -= 6;
	}
	return wrap(score);
};
