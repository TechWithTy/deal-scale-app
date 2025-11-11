"use client";

import type { ReactElement } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart,
	BarChart3,
	Bot,
	ListTodo,
	Percent,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { RefreshCw } from "lucide-react";
import { KPICard } from "./components/KPICard";
import { useAnalyticsData } from "./hooks/useAnalyticsData";
import { useNetworkQuality } from "@/hooks/useNetworkQuality";

const CampaignPerformanceChart = dynamic(
	() =>
		import("./components/CampaignPerformanceChart").then((mod) => ({
			default: mod.CampaignPerformanceChart,
		})),
	{
		ssr: false,
		loading: () => <ChartSkeleton />,
	},
);

const LeadTrendsChart = dynamic(
	() =>
		import("./components/LeadTrendsChart").then((mod) => ({
			default: mod.LeadTrendsChart,
		})),
	{
		ssr: false,
		loading: () => <ChartSkeleton />,
	},
);

const SalesPipelineFunnel = dynamic(
	() =>
		import("./components/SalesPipelineFunnel").then((mod) => ({
			default: mod.SalesPipelineFunnel,
		})),
	{
		ssr: false,
		loading: () => <FullWidthSkeleton />,
	},
);

const ROICalculator = dynamic(
	() =>
		import("./components/ROICalculator").then((mod) => ({
			default: mod.ROICalculator,
		})),
	{
		ssr: false,
		loading: () => <FullWidthSkeleton />,
	},
);

const ChartsCommandPalette = dynamic(
	() =>
		import("./components/ChartsCommandPalette").then((mod) => ({
			default: mod.ChartsCommandPalette,
		})),
	{ ssr: false, loading: () => null },
);

const AIAgentsTab = dynamic(
	() =>
		import("./components/AIAgentsTab").then((mod) => ({
			default: mod.AIAgentsTab,
		})),
	{ ssr: false, loading: () => <FullWidthSkeleton /> },
);

const AdvancedAnalyticsTab = dynamic(
	() =>
		import("./components/AdvancedAnalyticsTab").then((mod) => ({
			default: mod.AdvancedAnalyticsTab,
		})),
	{ ssr: false, loading: () => <FullWidthSkeleton /> },
);

export default function ChartsPage() {
	const { data, loading, error, refetch } = useAnalyticsData();
	const { tier: networkTier } = useNetworkQuality();
	const isSlowNetwork = networkTier === "slow";

	if (error) {
		return (
			<div className="container mx-auto space-y-6 py-6">
				<div className="flex min-h-[400px] items-center justify-center">
					<div className="space-y-4 text-center">
						<p className="text-destructive">Error loading analytics data</p>
						<Button onClick={refetch} variant="outline">
							<RefreshCw className="mr-2 h-4 w-4" />
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}

	if (loading || !data) {
		return <ChartsLoadingState onRetry={refetch} />;
	}

	const {
		analytics_summary,
		campaign_performance,
		lead_trends,
		sales_pipeline,
	} = data;

	return (
		<div className="container mx-auto space-y-6 py-6">
			<ChartsCommandPalette />
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Analytics & Charts</h1>
					<p className="mt-2 text-muted-foreground">
						Visualize your data and track your performance metrics
					</p>
				</div>
				<Button onClick={refetch} variant="outline" size="sm">
					<RefreshCw className="mr-2 h-4 w-4" />
					Refresh
				</Button>
			</div>

			<Tabs defaultValue="overview" className="w-full">
				<TabsList>
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<BarChart className="h-4 w-4" />
						Overview
					</TabsTrigger>
					<TabsTrigger value="ai-agents" className="flex items-center gap-2">
						<Bot className="h-4 w-4" />
						AI Agents
					</TabsTrigger>
					<TabsTrigger value="advanced" className="flex items-center gap-2">
						<Sparkles className="h-4 w-4" />
						Advanced
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6 space-y-6">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<KPICard
							title="Total Leads"
							value={analytics_summary.total_leads}
							delta={analytics_summary.total_leads_delta}
							deltaLabel="from last month"
							icon={TrendingUp}
							format="number"
						/>
						<KPICard
							title="Campaigns"
							value={analytics_summary.active_campaigns}
							delta={analytics_summary.campaigns_delta}
							deltaLabel="from last month"
							icon={BarChart3}
							format="number"
						/>
						<KPICard
							title="Conversion Rate"
							value={analytics_summary.conversion_rate}
							delta={analytics_summary.conversion_delta}
							deltaLabel="from last month"
							icon={Percent}
							format="percentage"
						/>
						<KPICard
							title="Active Tasks"
							value={analytics_summary.active_tasks}
							delta={analytics_summary.tasks_delta}
							deltaLabel="from yesterday"
							icon={ListTodo}
							format="number"
						/>
					</div>
					{isSlowNetwork ? (
						<NetworkFallback
							icon={<BarChart className="h-4 w-4" />}
							message="Charts paused to save bandwidth"
							description="Reconnect on a faster network to view campaign performance visuals."
						/>
					) : (
						<>
							<div className="grid gap-4 md:grid-cols-2">
								<CampaignPerformanceChart data={campaign_performance} />
								<LeadTrendsChart data={lead_trends} />
							</div>
							<SalesPipelineFunnel data={sales_pipeline} />
							<ROICalculator />
						</>
					)}
				</TabsContent>

				<TabsContent value="ai-agents" className="mt-6">
					{isSlowNetwork ? (
						<NetworkFallback
							icon={<Bot className="h-4 w-4" />}
							message="AI analytics paused"
							description="We’ll load the AI dashboards once your connection improves."
						/>
					) : (
						<AIAgentsTab />
					)}
				</TabsContent>

				<TabsContent value="advanced" className="mt-6">
					{isSlowNetwork ? (
						<NetworkFallback
							icon={<Sparkles className="h-4 w-4" />}
							message="Advanced analytics inactive"
							description="Switch to a stronger connection to unlock advanced visualizations."
						/>
					) : (
						<AdvancedAnalyticsTab />
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

function NetworkFallback({
	icon,
	message,
	description,
}: {
	icon: ReactElement;
	message: string;
	description: string;
}): JSX.Element {
	return (
		<div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/40 p-8 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 text-muted-foreground">
				{icon}
			</div>
			<p className="text-base font-medium text-foreground">{message}</p>
			<p className="max-w-md text-sm text-muted-foreground">{description}</p>
		</div>
	);
}

function ChartsLoadingState({
	onRetry,
}: {
	onRetry: () => void;
}): JSX.Element {
	return (
		<div className="container mx-auto space-y-6 py-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl">Analytics & Charts</h1>
					<p className="mt-2 text-muted-foreground">
						Visualize your data and track your performance metrics
					</p>
				</div>
				<Button onClick={onRetry} variant="outline" size="sm">
					<RefreshCw className="mr-2 h-4 w-4" />
					Refresh
				</Button>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{["total-leads", "campaigns", "conversion-rate", "active-tasks"].map(
					(id) => (
						<Skeleton key={`kpi-skeleton-${id}`} className="h-[120px] w-full" />
					),
				)}
			</div>
			<div className="grid gap-4 md:grid-cols-2">
				{["campaign-performance", "lead-trends"].map((id) => (
					<Skeleton key={`chart-skeleton-${id}`} className="h-[400px] w-full" />
				))}
			</div>
		</div>
	);
}

function ChartSkeleton(): JSX.Element {
	return <Skeleton className="h-[400px] w-full" />;
}

function FullWidthSkeleton(): JSX.Element {
	return <Skeleton className="h-[360px] w-full" />;
}
