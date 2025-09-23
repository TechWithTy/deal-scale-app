export type TimeRangeKey = "24h" | "7d" | "30d" | "quarter" | "year" | "all";

export function rangeLabel(key: TimeRangeKey): string {
	switch (key) {
		case "24h":
			return "Last 24 hours";
		case "7d":
			return "Last 7 days";
		case "30d":
			return "Last 30 days";
		case "quarter":
			return "This quarter";
		case "year":
			return "This year";
		default:
			return "All time";
	}
}

export function daysForRange(range: TimeRangeKey, fallback: number): number {
	switch (range) {
		case "24h":
			return 2;
		case "7d":
			return 7;
		case "30d":
			return 30;
		case "quarter":
			return 90;
		case "year":
			return 365;
		default:
			return fallback;
	}
}

export function filterDataByRange<T extends { timestamp: string }>(
	data: T[],
	range: TimeRangeKey,
): T[] {
	if (range === "all" || data.length === 0) return data;

	// Anchor to the latest timestamp available in the dataset
	const timestamps = data
		.map((d) => new Date(d.timestamp).getTime())
		.filter((n) => Number.isFinite(n)) as number[];
	const endMs = Math.max(...timestamps);
	const end = new Date(endMs);

	let start = new Date(0);
	if (range === "24h") {
		start = new Date(endMs - 24 * 60 * 60 * 1000);
	} else if (range === "7d") {
		start = new Date(endMs - 7 * 24 * 60 * 60 * 1000);
	} else if (range === "30d") {
		start = new Date(endMs - 30 * 24 * 60 * 60 * 1000);
	} else if (range === "quarter") {
		const q = Math.floor(end.getMonth() / 3);
		start = new Date(end.getFullYear(), q * 3, 1);
	} else if (range === "year") {
		start = new Date(end.getFullYear(), 0, 1);
	}

	return data.filter((d) => {
		const t = new Date(d.timestamp).getTime();
		return t >= start.getTime() && t <= endMs;
	});
}
