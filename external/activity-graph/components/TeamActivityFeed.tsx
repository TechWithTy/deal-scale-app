"use client";

import { useEffect, useMemo, useState } from "react";
import type { PermissionSet } from "../utils/permissions";
import { hasPermission } from "../utils/permissions";
import ActivityLineGraph from "./ActivityLineGraph";
import type { ActivityDataPoint, ChartConfigLocal } from "../types";
import {
	filterDataByRange,
	rangeLabel,
	type TimeRangeKey,
} from "../utils/time";

export type TeamEvent = {
	id: string;
	userName: string;
	type: "launch_campaign" | "generate_leads" | "other";
	campaignName?: string;
	leadsGenerated?: number;
	timestamp: string; // ISO
};

type TeamActivityFeedProps = {
	apiPath?: string; // default /api/v1/team/activity
	permissions: PermissionSet;
	days?: number; // for mini graph aggregation window
};

function buildComparativeSeries(
	events: TeamEvent[],
	members: string[],
	days = 14,
): {
	data: ActivityDataPoint[];
	config: ChartConfigLocal;
	lines: string[];
} {
	const today = new Date();
	const keys = members.length
		? members
		: Array.from(new Set(events.map((e) => e.userName)));
	const palette = [
		"hsl(var(--chart-1))",
		"hsl(var(--chart-2))",
		"hsl(var(--chart-3))",
		"hsl(var(--chart-4))",
		"hsl(var(--chart-5))",
	];
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
			(a, k) => ((a[k] = 0), a),
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

function formatEvent(e: TeamEvent): string {
	if (e.type === "launch_campaign" && e.campaignName)
		return `${e.userName} launched ${e.campaignName}`;
	if (e.type === "generate_leads" && typeof e.leadsGenerated === "number")
		return `${e.userName} generated ${e.leadsGenerated} leads`;
	return `${e.userName} performed an action`;
}

export default function TeamActivityFeed({
	apiPath = "/api/v1/team/activity",
	permissions,
	days = 14,
}: TeamActivityFeedProps) {
	const canView =
		hasPermission(permissions, "ManageTeam") ||
		hasPermission(permissions, "ViewReports");
	const [events, setEvents] = useState<TeamEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [range, setRange] = useState<TimeRangeKey>("30d");
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

	useEffect(() => {
		let isMounted = true;
		async function run() {
			try {
				const res = await fetch(apiPath, { cache: "no-store" });
				if (!res.ok) throw new Error("bad status");
				const json = (await res.json()) as TeamEvent[];
				if (isMounted) setEvents(json);
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
				if (isMounted) setEvents(demo);
			} finally {
				if (isMounted) setLoading(false);
			}
		}
		if (canView) run();
		return () => {
			isMounted = false;
		};
	}, [apiPath, canView]);

	const members = useMemo(
		() => Array.from(new Set(events.map((e) => e.userName))).sort(),
		[events],
	);

	const filteredByRange = useMemo(
		() => filterDataByRange(events, range),
		[events, range],
	);
	const filtered = useMemo(
		() =>
			selectedMembers.length === 0
				? filteredByRange
				: filteredByRange.filter((e) => selectedMembers.includes(e.userName)),
		[filteredByRange, selectedMembers],
	);

	const rangeDays = useMemo(() => {
		switch (range) {
			case "24h":
				return 2; // show 2 days bucket when 24h selected
			case "7d":
				return 7;
			case "30d":
				return 30;
			case "quarter":
				return 90;
			case "year":
				return 365;
			default:
				return days;
		}
	}, [range, days]);

	const mini = useMemo(
		() => buildComparativeSeries(filtered, selectedMembers, rangeDays),
		[filtered, selectedMembers, rangeDays],
	);

	if (!canView) {
		return (
			<div className="rounded-md border p-4 text-muted-foreground text-sm">
				You do not have permission to view team activity.
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{/* Controls: members chips + time range */}
			<div className="flex items-center justify-between gap-2">
				<div
					className="flex gap-2 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					role="group"
					aria-label="Filter by team member"
				>
					{members.map((name, idx) => {
						const active = selectedMembers.includes(name);
						return (
							<button
								key={name}
								type="button"
								onClick={() =>
									setSelectedMembers((prev) =>
										prev.includes(name)
											? prev.filter((n) => n !== name)
											: [...prev, name],
									)
								}
								className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors ${
									active
										? "border-primary bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground hover:bg-accent"
								}`}
								aria-pressed={active}
							>
								<span
									className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium"
									style={{
										background:
											mini.config[name]?.color ||
											`hsl(var(--chart-${(idx % 5) + 1}))`,
										color: "hsl(var(--background))",
									}}
									aria-hidden
								>
									{name.slice(0, 1).toUpperCase()}
								</span>
								{name}
							</button>
						);
					})}
				</div>
				<div className="flex items-center gap-1">
					<label htmlFor="team-range" className="text-muted-foreground text-xs">
						Time Range
					</label>
					<select
						id="team-range"
						className="rounded-md border bg-background px-2 py-1 text-xs"
						value={range}
						onChange={(e) => setRange(e.target.value as TimeRangeKey)}
					>
						{(
							["24h", "7d", "30d", "quarter", "year", "all"] as TimeRangeKey[]
						).map((key) => (
							<option key={key} value={key}>
								{rangeLabel(key)}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Mini activity graph */}
			<div className="rounded-md border p-3">
				<ActivityLineGraph
					data={mini.data}
					config={mini.config}
					lines={mini.lines}
					title="Team Activity (Events)"
					description={`${rangeLabel(range)}`}
				/>
			</div>

			{/* Feed */}
			<div className="rounded-md border">
				<div className="border-b p-3">
					<h3 className="font-semibold text-base">Recent Team Activity</h3>
					<p className="text-muted-foreground text-xs">
						Fetched from {apiPath}
					</p>
				</div>
				<div className="divide-y">
					{loading ? (
						<div className="p-3 text-muted-foreground text-sm">Loading…</div>
					) : filtered.length === 0 ? (
						<div className="p-3 text-muted-foreground text-sm">
							No recent activity
						</div>
					) : (
						filtered
							.sort(
								(a, b) =>
									new Date(b.timestamp).getTime() -
									new Date(a.timestamp).getTime(),
							)
							.map((e) => (
								<div
									key={e.id}
									className="flex items-center justify-between gap-3 p-3"
								>
									<div className="text-sm">{formatEvent(e)}</div>
									<div className="text-muted-foreground text-xs">
										{new Date(e.timestamp).toLocaleString()}
									</div>
								</div>
							))
					)}
				</div>
			</div>
		</div>
	);
}
