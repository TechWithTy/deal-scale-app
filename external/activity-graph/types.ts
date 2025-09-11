export type ChartSeriesConfig = {
	label?: string;
	color?: string; // Accept CSS var or hex
};

export type ChartConfigLocal = Record<string, ChartSeriesConfig>;

// Minimal data point used by the activity graph
export type ActivityDataPoint = {
	timestamp: string; // ISO string or any string supported by Date
	// additional numeric series values keyed by series key
	[key: string]: number | string;
};

// Minimal payload from Recharts passed to custom node renderers
export type NodePayload = {
	timestamp?: string;
	[key: string]: unknown;
};
