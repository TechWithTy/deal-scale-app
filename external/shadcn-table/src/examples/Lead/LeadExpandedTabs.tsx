import { IntentScoreWidget } from "@/components/tables/lead-tables/tabs/IntentScoreWidget";
import { IntentSignalCard } from "@/components/tables/lead-tables/tabs/IntentSignalCard";
import { groupSignalsByType } from "@/lib/scoring/intentScoring";
import type { IntentSignal } from "@/types/_dashboard/intentSignals";
import {
	Activity,
	type LucideIcon,
	Mail,
	MessageSquare,
	Phone,
	Send,
	Share2,
	StickyNote,
	Target,
	TrendingUp,
} from "lucide-react";
import * as React from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { Button } from "../../components/ui/button";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../../components/ui/tabs";
import { LeadCard } from "./LeadCard";
import type { ActivityEvent, DemoLead, DemoRow } from "./types";

const TIMELINE_PAGE_SIZE = 10;
const CHART_HEIGHT = 148;
const ACTIVITY_CHART_SERIES: Array<{
	key: ActivityEvent["kind"];
	label: string;
	color: string;
}> = [
	{ key: "call", label: "Phone", color: "#2563eb" },
	{ key: "text", label: "Text", color: "#059669" },
	{ key: "email", label: "Email", color: "#7c3aed" },
	{ key: "social", label: "Social", color: "#db2777" },
	{ key: "outreach", label: "Outreach", color: "#d97706" },
	{ key: "voicemail", label: "Voicemail", color: "#64748b" },
	{ key: "note", label: "Note", color: "#52525b" },
];

interface LeadExpandedTabsProps {
	lead: DemoLead;
	rowId: string;
	setData: React.Dispatch<React.SetStateAction<DemoRow[]>>;
}

function PaginationControls({
	page,
	pageCount,
	total,
	onPageChange,
}: {
	page: number;
	pageCount: number;
	total: number;
	onPageChange: (page: number) => void;
}) {
	const start = total === 0 ? 0 : page * TIMELINE_PAGE_SIZE + 1;
	const end = Math.min(total, (page + 1) * TIMELINE_PAGE_SIZE);

	if (pageCount <= 1) {
		return (
			<p className="text-muted-foreground text-xs">
				Showing {total} of {total}
			</p>
		);
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-2 border-border border-t pt-3">
			<p className="text-muted-foreground text-xs">
				Showing {start}-{end} of {total}
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={page === 0}
					onClick={() => onPageChange(Math.max(0, page - 1))}
				>
					Previous
				</Button>
				<span className="text-muted-foreground text-xs">
					Page {page + 1} of {pageCount}
				</span>
				<Button
					variant="outline"
					size="sm"
					disabled={page >= pageCount - 1}
					onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
				>
					Next
				</Button>
			</div>
		</div>
	);
}

function formatShortDate(value: string) {
	return new Date(value).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

function toDailyActivityData(
	items: Array<{ timestamp: string; value: number }>,
	valueKey: "events" | "points",
) {
	const totals = new Map<string, number>();

	for (const item of items) {
		const dateKey = item.timestamp.slice(0, 10);
		totals.set(dateKey, (totals.get(dateKey) ?? 0) + item.value);
	}

	return [...totals.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.reduce<Array<Record<string, string | number>>>((points, [date, value]) => {
			const previous = points.at(-1)?.[valueKey];
			const cumulative = (typeof previous === "number" ? previous : 0) + value;

			points.push({
				date,
				label: formatShortDate(date),
				[valueKey]: cumulative,
			});
			return points;
		}, []);
}

function toActivityTypeTrendData(activity: ActivityEvent[]) {
	const dailyCounts = new Map<
		string,
		Partial<Record<ActivityEvent["kind"], number>>
	>();
	const cumulativeCounts = ACTIVITY_CHART_SERIES.reduce(
		(counts, series) => {
			counts[series.key] = 0;
			return counts;
		},
		{} as Record<ActivityEvent["kind"], number>,
	);

	for (const event of activity) {
		const dateKey = event.ts.slice(0, 10);
		const counts = dailyCounts.get(dateKey) ?? {};
		counts[event.kind] = (counts[event.kind] ?? 0) + 1;
		dailyCounts.set(dateKey, counts);
	}

	return [...dailyCounts.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([date, counts]) => {
			for (const series of ACTIVITY_CHART_SERIES) {
				cumulativeCounts[series.key] += counts[series.key] ?? 0;
			}

			return {
				date,
				label: formatShortDate(date),
				...cumulativeCounts,
			};
		});
}

function ActivityTypeLineGraph({
	data,
}: {
	data: Array<Record<string, string | number>>;
}) {
	if (data.length === 0) {
		return null;
	}

	const latest = data[data.length - 1] ?? {};
	const total = ACTIVITY_CHART_SERIES.reduce((sum, series) => {
		const value = latest[series.key];
		return sum + (typeof value === "number" ? value : 0);
	}, 0);

	return (
		<div className="rounded-md border border-border bg-card p-3 shadow-sm">
			<div className="mb-2 flex flex-wrap items-start justify-between gap-2">
				<div>
					<p className="font-medium text-sm">Activity by Type</p>
					<p className="text-muted-foreground text-xs">
						{total.toLocaleString()} events across {data.length} day
						{data.length === 1 ? "" : "s"}
					</p>
				</div>
				<div className="rounded-md bg-muted px-2 py-1 text-right">
					<p className="font-semibold text-sm">{total.toLocaleString()}</p>
					<p className="text-[11px] text-muted-foreground">total</p>
				</div>
			</div>
			<div className="h-[148px] w-full">
				<ResponsiveContainer width="100%" height={CHART_HEIGHT}>
					<LineChart data={data} margin={{ top: 8, right: 10, left: -24 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="hsl(var(--border))"
							opacity={0.6}
						/>
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							fontSize={11}
							interval="preserveStartEnd"
						/>
						<YAxis
							allowDecimals={false}
							tickLine={false}
							axisLine={false}
							fontSize={11}
						/>
						<RechartsTooltip
							contentStyle={{
								borderRadius: 8,
								border: "1px solid hsl(var(--border))",
								fontSize: 12,
								boxShadow: "0 8px 24px rgb(15 23 42 / 0.12)",
							}}
						/>
						{ACTIVITY_CHART_SERIES.map((series) => (
							<Line
								key={series.key}
								type="monotone"
								dataKey={series.key}
								name={series.label}
								stroke={series.color}
								strokeWidth={2}
								dot={false}
								activeDot={{ r: 4 }}
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-2 flex flex-wrap gap-2">
				{ACTIVITY_CHART_SERIES.map((series) => {
					const value = latest[series.key];
					const count = typeof value === "number" ? value : 0;

					return (
						<div
							key={series.key}
							className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs"
						>
							<span
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: series.color }}
							/>
							<span>{series.label}</span>
							<span className="text-muted-foreground">{count}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ActivityLineGraph({
	data,
	valueKey,
	label,
	stroke = "#2563eb",
	unitLabel,
}: {
	data: Array<Record<string, string | number>>;
	valueKey: string;
	label: string;
	stroke?: string;
	unitLabel: string;
}) {
	if (data.length === 0) {
		return null;
	}
	const latest = data[data.length - 1]?.[valueKey];
	const total = typeof latest === "number" ? latest : 0;

	return (
		<div className="rounded-md border border-border bg-card p-3 shadow-sm">
			<div className="mb-2 flex flex-wrap items-start justify-between gap-2">
				<div>
					<p className="font-medium text-sm">{label}</p>
					<p className="text-muted-foreground text-xs">
						{total.toLocaleString()} {unitLabel} across {data.length} day
						{data.length === 1 ? "" : "s"}
					</p>
				</div>
				<div className="rounded-md bg-muted px-2 py-1 text-right">
					<p className="font-semibold text-sm">{total.toLocaleString()}</p>
					<p className="text-[11px] text-muted-foreground">total</p>
				</div>
			</div>
			<div className="h-[148px] w-full">
				<ResponsiveContainer width="100%" height={CHART_HEIGHT}>
					<LineChart data={data} margin={{ top: 8, right: 10, left: -24 }}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="hsl(var(--border))"
							opacity={0.6}
						/>
						<XAxis
							dataKey="label"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							fontSize={11}
							interval="preserveStartEnd"
						/>
						<YAxis
							allowDecimals={false}
							tickLine={false}
							axisLine={false}
							fontSize={11}
						/>
						<RechartsTooltip
							contentStyle={{
								borderRadius: 8,
								border: "1px solid hsl(var(--border))",
								fontSize: 12,
								boxShadow: "0 8px 24px rgb(15 23 42 / 0.12)",
							}}
						/>
						<Line
							type="monotone"
							dataKey={valueKey}
							stroke={stroke}
							strokeWidth={2.5}
							dot={data.length <= 8 ? { r: 2.5 } : false}
							activeDot={{ r: 4 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

function ActivityTimeline({ lead }: { lead: DemoLead }) {
	const [page, setPage] = React.useState(0);
	const activity = [...(lead.activity ?? [])].sort((a, b) =>
		b.ts.localeCompare(a.ts),
	);
	const pageCount = Math.max(
		1,
		Math.ceil(activity.length / TIMELINE_PAGE_SIZE),
	);
	const visibleActivity = activity.slice(
		page * TIMELINE_PAGE_SIZE,
		(page + 1) * TIMELINE_PAGE_SIZE,
	);
	const activityTypeChartData = toActivityTypeTrendData(activity);

	if (activity.length === 0) {
		return (
			<div className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-sm">
				No activity recorded for this lead yet.
			</div>
		);
	}

	return (
		<div className="space-y-3 rounded-md border border-border p-4">
			<div className="flex items-center justify-between gap-3">
				<h4 className="font-medium text-sm">Activity Timeline</h4>
				<span className="text-muted-foreground text-xs">
					{activity.length} event{activity.length === 1 ? "" : "s"}
				</span>
			</div>
			<ActivityTypeLineGraph data={activityTypeChartData} />
			<div className="space-y-3">
				{visibleActivity.map((event) => (
					<ActivityEventRow
						key={`${event.ts}-${event.kind}-${event.summary}`}
						event={event}
					/>
				))}
			</div>
			<PaginationControls
				page={page}
				pageCount={pageCount}
				total={activity.length}
				onPageChange={setPage}
			/>
		</div>
	);
}

function getActivityMeta(kind: ActivityEvent["kind"]): {
	label: string;
	icon: LucideIcon;
	className: string;
} {
	switch (kind) {
		case "call":
			return {
				label: "Phone call",
				icon: Phone,
				className:
					"bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
			};
		case "text":
			return {
				label: "Text",
				icon: MessageSquare,
				className:
					"bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
			};
		case "email":
			return {
				label: "Email",
				icon: Mail,
				className:
					"bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
			};
		case "social":
			return {
				label: "Social media",
				icon: Share2,
				className:
					"bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
			};
		case "outreach":
			return {
				label: "Outreach",
				icon: Send,
				className:
					"bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
			};
		case "voicemail":
			return {
				label: "Voicemail",
				icon: Phone,
				className:
					"bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
			};
		case "note":
			return {
				label: "Note",
				icon: StickyNote,
				className:
					"bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
			};
	}
}

function ActivityEventRow({ event }: { event: ActivityEvent }) {
	const meta = getActivityMeta(event.kind);
	const Icon = meta.icon;

	return (
		<div className="flex items-start justify-between gap-4 border-border border-b pb-3 last:border-0 last:pb-0">
			<div className="flex min-w-0 gap-3">
				<div
					className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.className}`}
				>
					<Icon className="h-4 w-4" />
				</div>
				<div className="min-w-0">
					<div className="mb-1 flex flex-wrap items-center gap-2">
						<span
							className={`rounded-full px-2 py-0.5 font-medium text-[11px] ${meta.className}`}
						>
							{meta.label}
						</span>
						<time className="text-muted-foreground text-xs">
							{new Date(event.ts).toLocaleString(undefined, {
								month: "short",
								day: "numeric",
								hour: "numeric",
								minute: "2-digit",
							})}
						</time>
					</div>
					<p className="font-medium text-sm">{event.summary}</p>
				</div>
			</div>
		</div>
	);
}

type IntentTabValue = "all" | "engagement" | "behavioral" | "external";

const intentTabs: Array<{
	value: IntentTabValue;
	label: string;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
}> = [
	{
		value: "all",
		label: "All",
		title: "All Activity Timeline",
		icon: Activity,
	},
	{
		value: "engagement",
		label: "Engagement",
		title: "Engagement Signals",
		icon: Target,
	},
	{
		value: "behavioral",
		label: "Behavioral",
		title: "Behavioral Signals",
		icon: Activity,
	},
	{
		value: "external",
		label: "External",
		title: "External Signals",
		icon: TrendingUp,
	},
];

function sortSignals(signals: IntentSignal[]) {
	return [...signals].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
	);
}

function IntentSignalTimeline({
	signals,
	title,
	icon: Icon,
}: {
	signals: IntentSignal[];
	title: string;
	icon: React.ComponentType<{ className?: string }>;
}) {
	const [page, setPage] = React.useState(0);
	const sortedSignals = sortSignals(signals);
	const pageCount = Math.max(
		1,
		Math.ceil(sortedSignals.length / TIMELINE_PAGE_SIZE),
	);
	const visibleSignals = sortedSignals.slice(
		page * TIMELINE_PAGE_SIZE,
		(page + 1) * TIMELINE_PAGE_SIZE,
	);
	const chartData = toDailyActivityData(
		sortedSignals.map((signal) => ({
			timestamp: signal.timestamp,
			value: signal.rawScore,
		})),
		"points",
	);

	return (
		<div className="space-y-3 rounded-md border border-border p-4">
			<div className="flex items-center justify-between gap-3">
				<h4 className="flex items-center gap-2 font-medium text-sm">
					<Icon className="h-4 w-4" />
					{title}
				</h4>
				<span className="text-muted-foreground text-xs">
					{signals.length} signal{signals.length === 1 ? "" : "s"}
				</span>
			</div>
			<ActivityLineGraph
				data={chartData}
				valueKey="points"
				label="Cumulative Intent Points"
				stroke="#16a34a"
				unitLabel="points"
			/>
			{visibleSignals.length > 0 ? (
				<div className="space-y-3">
					{visibleSignals.map((signal) => (
						<IntentSignalCard
							key={signal.id}
							signal={signal}
							showMetadata={false}
						/>
					))}
				</div>
			) : (
				<div className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-sm">
					No {title.toLowerCase()} recorded yet.
				</div>
			)}
			<PaginationControls
				page={page}
				pageCount={pageCount}
				total={signals.length}
				onPageChange={setPage}
			/>
		</div>
	);
}

function IntentSignals({ lead }: { lead: DemoLead }) {
	const [activeTab, setActiveTab] = React.useState<IntentTabValue>("all");

	if (
		!lead.intentSignals ||
		!lead.intentScore ||
		lead.intentSignals.length === 0
	) {
		return (
			<div className="rounded-md border border-dashed p-4 text-center text-muted-foreground text-sm">
				No intent signals recorded for this lead yet.
			</div>
		);
	}

	const grouped = groupSignalsByType(lead.intentSignals);
	const signalsByTab: Record<IntentTabValue, IntentSignal[]> = {
		all: lead.intentSignals,
		engagement: grouped.engagement,
		behavioral: grouped.behavioral,
		external: grouped.external,
	};

	return (
		<div className="space-y-4">
			<IntentScoreWidget score={lead.intentScore} showBreakdown={true} />
			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as IntentTabValue)}
				className="w-full"
			>
				<TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
					{intentTabs.map((tab) => (
						<TabsTrigger key={tab.value} value={tab.value}>
							{tab.label} ({signalsByTab[tab.value].length})
						</TabsTrigger>
					))}
				</TabsList>
				{intentTabs.map((tab) => (
					<TabsContent key={tab.value} value={tab.value} className="mt-3">
						<IntentSignalTimeline
							signals={signalsByTab[tab.value]}
							title={tab.title}
							icon={tab.icon}
						/>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}

export function LeadExpandedTabs({
	lead,
	rowId,
	setData,
}: LeadExpandedTabsProps) {
	return (
		<Tabs defaultValue="details" className="w-full">
			<TabsList className="grid w-full grid-cols-3">
				<TabsTrigger value="details">Lead Details</TabsTrigger>
				<TabsTrigger value="activity">Activity</TabsTrigger>
				<TabsTrigger value="intent">Intent Signals</TabsTrigger>
			</TabsList>
			<TabsContent value="details" className="mt-3">
				<LeadCard lead={lead} rowId={rowId} setData={setData} />
			</TabsContent>
			<TabsContent value="activity" className="mt-3">
				<ActivityTimeline lead={lead} />
			</TabsContent>
			<TabsContent value="intent" className="mt-3">
				<IntentSignals lead={lead} />
			</TabsContent>
		</Tabs>
	);
}
