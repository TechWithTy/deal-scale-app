import type { ActivityDataPoint, ChartConfigLocal } from "../types";

export function processActivityData(
	rawData: Array<Record<string, unknown>>,
	valueKeys: string[],
	timestampKey: string,
): ActivityDataPoint[] {
	return rawData.map((item) => ({
		timestamp: String(item[timestampKey] ?? ""),
		...valueKeys.reduce(
			(acc, key) => {
				const v = item[key];
				acc[key] = typeof v === "number" ? v : Number(v ?? 0);
				return acc;
			},
			{} as Record<string, number>,
		),
	}));
}

export function createChartConfig(
	keys: string[],
	colors: string[],
): ChartConfigLocal {
	return keys.reduce<ChartConfigLocal>((config, key, index) => {
		config[key] = {
			label: key.replace(/_/g, " "),
			color: colors[index % colors.length],
		};
		return config;
	}, {} as ChartConfigLocal);
}
