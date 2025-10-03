const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});
const percentFormatter = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 1,
});
const numberFormatter = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 0,
});

export const THIRTY_DAYS_MS = 1000 * 60 * 60 * 24 * 30;

export const roundTo = (value: number, digits = 0) =>
	Number.parseFloat(value.toFixed(digits));

export const average = (values: number[]): number | null =>
	values.length
		? values.reduce((sum, value) => sum + value, 0) / values.length
		: null;

export const median = (values: number[]): number | null => {
	if (!values.length) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid];
};

export const clampScore = (score: number) =>
	Math.max(0, Math.min(100, Math.round(score)));

export const formatCurrency = (value: number | null | undefined) =>
	value != null ? currencyFormatter.format(value) : "N/A";

export const formatPercent = (value: number | null | undefined) =>
	value != null ? `${percentFormatter.format(value)}%` : "N/A";

export const formatNumber = (value: number | null | undefined) =>
	value != null ? numberFormatter.format(value) : "N/A";

export const labelFromScore = (
	score: number,
): "Optimistic" | "Cautious" | "Pessimistic" => {
	if (score >= 67) return "Optimistic";
	if (score >= 45) return "Cautious";
	return "Pessimistic";
};

export const toneFromScore = (score: number) => {
	if (score >= 85) return "Highly Optimistic";
	if (score >= 75) return "Optimistic";
	if (score >= 65) return "Cautious-Positive";
	if (score >= 55) return "Neutral-Cautious";
	if (score >= 45) return "Guarded";
	if (score >= 35) return "Cautious-Negative";
	return "Pessimistic";
};

export const parseDate = (value?: string) => {
	if (!value) return Number.NaN;
	const time = Date.parse(value);
	return Number.isNaN(time) ? Number.NaN : time;
};

export const computeTrend = (
	values: Array<{ value: number; updatedAt: number }>,
	nowTs: number,
) => {
	const recent = values
		.filter(
			(item) =>
				!Number.isNaN(item.updatedAt) &&
				nowTs - item.updatedAt <= THIRTY_DAYS_MS,
		)
		.map((item) => item.value);
	const older = values
		.filter(
			(item) =>
				!Number.isNaN(item.updatedAt) &&
				nowTs - item.updatedAt > THIRTY_DAYS_MS,
		)
		.map((item) => item.value);
	if (!recent.length || !older.length)
		return { pct: 0, direction: "flat" as const };
	const baseline = median(older);
	const latest = median(recent);
	if (!baseline || !latest) return { pct: 0, direction: "flat" as const };
	const pct = roundTo(((latest - baseline) / baseline) * 100, 2);
	if (pct > 1) return { pct, direction: "up" as const };
	if (pct < -1) return { pct, direction: "down" as const };
	return { pct, direction: "flat" as const };
};
