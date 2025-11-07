"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart,
	BarChart3,
	Bot,
	LineChart,
	ListTodo,
	Percent,
	Sparkles,
	TrendingUp,
} from "lucide-react";
import { RefreshCw } from "lucide-react";
import { AIAgentsTab } from "./components/AIAgentsTab";
import { AdvancedAnalyticsTab } from "./components/AdvancedAnalyticsTab";
import { CampaignPerformanceChart } from "./components/CampaignPerformanceChart";
import { ChartsCommandPalette } from "./components/ChartsCommandPalette";
import { KPICard } from "./components/KPICard";
import { LeadTrendsChart } from "./components/LeadTrendsChart";
import { ROICalculator } from "./components/ROICalculator";
import { SalesPipelineFunnel } from "./components/SalesPipelineFunnel";
import { useAnalyticsData } from "./hooks/useAnalyticsData";

export default function ChartsPage() {
	const { data, loading, error, refetch } = useAnalyticsData();

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
		return (
			<div className="container mx-auto space-y-6 py-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-3xl">Analytics & Charts</h1>
						<p className="mt-2 text-muted-foreground">
							Visualize your data and track your performance metrics
						</p>
					</div>
				</div>

				{/* Loading State */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{["total-leads", "campaigns", "conversion-rate", "active-tasks"].map(
						(id) => (
							<Skeleton
								key={`kpi-skeleton-${id}`}
								className="h-[120px] w-full"
							/>
						),
					)}
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					{["campaign-performance", "lead-trends"].map((id) => (
						<Skeleton
							key={`chart-skeleton-${id}`}
							className="h-[400px] w-full"
						/>
					))}
				</div>
			</div>
		);
	}

	const {
		analytics_summary,
		campaign_performance,
		lead_trends,
		sales_pipeline,
	} = data;

	return (
		<div className="container mx-auto space-y-6 py-6">
			{/* Command Palette Integration */}
			<ChartsCommandPalette />

			{/* Header */}
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

			{/* Main Tabs */}
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

				{/* Overview Tab */}
				<TabsContent value="overview" className="mt-6 space-y-6">
					{/* KPI Summary Cards */}
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

					{/* Main Chart Sections */}
					<div className="grid gap-4 md:grid-cols-2">
						<CampaignPerformanceChart data={campaign_performance} />
						<LeadTrendsChart data={lead_trends} />
					</div>

					{/* Sales Pipeline */}
					<SalesPipelineFunnel data={sales_pipeline} />

					{/* ROI Calculator */}
					<ROICalculator />
				</TabsContent>

				{/* AI Agents Tab - Starter Tier */}
				<TabsContent value="ai-agents" className="mt-6">
					<AIAgentsTab />
				</TabsContent>

				{/* Advanced Tab - Enterprise Tier */}
				<TabsContent value="advanced" className="mt-6">
					<AdvancedAnalyticsTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
