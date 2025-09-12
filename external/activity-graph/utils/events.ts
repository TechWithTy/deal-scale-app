import type { ActivityDataPoint, ChartConfigLocal } from "../types";

export type TeamEvent = {
	id: string;
	userName: string;
	type: "launch_campaign" | "generate_leads" | "other";
	campaignName?: string;
	leadsGenerated?: number;
	timestamp: string; // ISO
};

const palette = [
	"hsl(var(--chart-1))",
	"hsl(var(--chart-2))",
	"hsl(var(--chart-3))",
	"hsl(var(--chart-4))",
	"hsl(var(--chart-5))",
];

export function buildComparativeSeries(
	events: TeamEvent[],
	members: string[],
	days = 14,
): { data: ActivityDataPoint[]; config: ChartConfigLocal; lines: string[] } {
	const today = new Date();
	const keys = members.length
		? members
		: Array.from(new Set(events.map((e) => e.userName)));

	const config: ChartConfigLocal = keys.reduce((acc, name, i) => {
		acc[name] = { label: name, color: palette[i % palette.length] };
		return acc;
	}, {} as ChartConfigLocal);

	// Initialize day buckets per user
	const dayKeys: string[] = [];
	for (let i = days - 1; i >= 0; i--) {
		const d = new Date(today);
		d.setDate(today.getDate() - i);
		dayKeys.push(d.toISOString().slice(0, 10));
	}

	const counts: Record<string, Record<string, number>> = {};
	for (const dk of dayKeys) {
		counts[dk] = keys.reduce(
			(a, k) => {
				a[k] = 0;
				return a;
			},
			{} as Record<string, number>,
		);
	}
	for (const e of events) {
		const dk = new Date(e.timestamp).toISOString().slice(0, 10);
		if (counts[dk] && counts[dk][e.userName] !== undefined)
			counts[dk][e.userName] += 1;
	}

	const data: ActivityDataPoint[] = dayKeys.map((dk) => ({
		timestamp: new Date(dk).toISOString(),
		...counts[dk],
	}));

	return { data, config, lines: keys };
}

export function formatEvent(e: TeamEvent): string {
	if (e.type === "launch_campaign" && e.campaignName)
		return `${e.userName} launched ${e.campaignName}`;
	if (e.type === "generate_leads" && typeof e.leadsGenerated === "number")
		return `${e.userName} generated ${e.leadsGenerated} leads`;
	return `${e.userName} performed an action`;
}

export async function fetchTeamEvents(apiPath: string): Promise<TeamEvent[]> {
	try {
		const res = await fetch(apiPath, { cache: "no-store" });
		if (!res.ok) throw new Error("bad status");
		const json = (await res.json()) as TeamEvent[];
		return json;
	} catch {
		// fallback demo data (last few days)
		const now = new Date();
		const demo: TeamEvent[] = [
			{
				id: "1",
				userName: "Alex",
				type: "launch_campaign",
				campaignName: "Spring Promo",
				timestamp: new Date(
					now.getTime() - 2 * 24 * 60 * 60 * 1000,
				).toISOString(),
			},
			{
				id: "2",
				userName: "Taylor",
				type: "generate_leads",
				leadsGenerated: 50,
				timestamp: new Date(
					now.getTime() - 1 * 24 * 60 * 60 * 1000,
				).toISOString(),
			},
			{
				id: "3",
				userName: "Jordan",
				type: "launch_campaign",
				campaignName: "July Blitz",
				timestamp: new Date(
					now.getTime() - 5 * 24 * 60 * 60 * 1000,
				).toISOString(),
			},
		];
		return demo;
	}
}
