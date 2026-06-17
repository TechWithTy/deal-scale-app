"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/_utils";
import {
	BadgeCheck,
	Flame,
	Radar,
	Target,
	TrendingUp,
	Users,
} from "lucide-react";
import type { ComponentType } from "react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import type { LeadsAnalytics } from "../types/analytics";

interface LeadsAnalyticsTabProps {
	data: LeadsAnalytics;
}

export function LeadsAnalyticsTab({ data }: LeadsAnalyticsTabProps) {
	const { segments } = data;

	const chartConfig = {
		total_leads: {
			label: "Total Leads",
			color: "hsl(var(--chart-1))",
		},
		qualified_leads: {
			label: "Qualified Leads",
			color: "hsl(var(--chart-2))",
		},
		hot_leads: {
			label: "Hot Leads",
			color: "hsl(var(--chart-3))",
		},
	};

	const chartData = segments.map((segment) => ({
		label: segment.label,
		total_leads: segment.total_leads,
		qualified_leads: segment.qualified_leads,
		hot_leads: segment.hot_leads,
	}));

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
				<div className="flex items-center gap-2 text-primary">
					<Users className="h-5 w-5" />
					<p className="font-medium">Lead segment analytics</p>
				</div>
				<p className="mt-2 max-w-3xl text-muted-foreground text-sm">
					Track off-market sellers, motivated sellers, and cash buyers with the
					metrics that matter most: volume, qualification, intent, and source
					quality.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<SummaryCard
					title="Total Leads"
					value={data.total_leads}
					description="Across the tracked lead segments"
					icon={Users}
				/>
				<SummaryCard
					title="Qualified Leads"
					value={data.qualified_leads}
					description="Leads ready for follow-up"
					icon={Target}
				/>
				<SummaryCard
					title="Hot Leads"
					value={data.hot_leads}
					description="Highest priority opportunities"
					icon={Flame}
				/>
				<SummaryCard
					title="Avg. Intent Score"
					value={data.average_intent_score}
					description="Weighted across all segments"
					icon={Radar}
				/>
			</div>

			<div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
				<Card>
					<CardHeader>
						<CardTitle>Lead Mix by Segment</CardTitle>
						<CardDescription>
							Compare lead volume and quality across the core buyer and seller
							segments.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer
							config={chartConfig}
							className="aspect-auto h-[320px] w-full"
						>
							<BarChart data={chartData} width={500} height={320}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									angle={-18}
									textAnchor="end"
									style={{ fontSize: "12px" }}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									style={{ fontSize: "12px" }}
								/>
								<Tooltip content={<ChartTooltipContent />} />
								<Bar
									dataKey="total_leads"
									fill={chartConfig.total_leads.color}
									radius={[4, 4, 0, 0]}
									name={chartConfig.total_leads.label}
								/>
								<Bar
									dataKey="qualified_leads"
									fill={chartConfig.qualified_leads.color}
									radius={[4, 4, 0, 0]}
									name={chartConfig.qualified_leads.label}
								/>
								<Bar
									dataKey="hot_leads"
									fill={chartConfig.hot_leads.color}
									radius={[4, 4, 0, 0]}
									name={chartConfig.hot_leads.label}
								/>
							</BarChart>
						</ChartContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Segment Quality</CardTitle>
						<CardDescription>
							Quick read on which segment is converting and which signals are
							strongest.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						{segments.map((segment) => (
							<div key={segment.key} className="space-y-2">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="font-medium text-sm">{segment.label}</p>
										<p className="text-muted-foreground text-xs">
											{segment.top_source}
										</p>
									</div>
									<Badge variant="outline">{segment.conversion_rate}%</Badge>
								</div>
								<Progress value={segment.conversion_rate} className="h-2" />
								<div className="flex flex-wrap gap-2">
									<Badge variant="secondary" className="gap-1.5">
										<BadgeCheck className="h-3 w-3" />
										{segment.qualified_leads} qualified
									</Badge>
									<Badge variant="secondary" className="gap-1.5">
										<Flame className="h-3 w-3" />
										{segment.hot_leads} hot
									</Badge>
									<Badge
										variant="outline"
										className={cn("border-dashed capitalize")}
									>
										{segment.primary_signal}
									</Badge>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Lead Segment Breakdown</CardTitle>
					<CardDescription>
						Operational metrics for each lead type in the pipeline.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[720px] text-sm">
							<thead>
								<tr className="border-b text-left text-muted-foreground">
									<th className="pb-3 font-medium">Lead Type</th>
									<th className="pb-3 font-medium">Total</th>
									<th className="pb-3 font-medium">Qualified</th>
									<th className="pb-3 font-medium">Hot</th>
									<th className="pb-3 font-medium">Conversion</th>
									<th className="pb-3 font-medium">Top Source</th>
									<th className="pb-3 font-medium">Primary Signal</th>
								</tr>
							</thead>
							<tbody>
								{segments.map((segment) => (
									<tr key={segment.key} className="border-b last:border-0">
										<td className="py-4">
											<div className="space-y-1">
												<p className="font-medium">{segment.label}</p>
												<p className="text-muted-foreground text-xs">
													{segment.key}
												</p>
											</div>
										</td>
										<td className="py-4 font-medium">
											{segment.total_leads.toLocaleString()}
										</td>
										<td className="py-4">
											{segment.qualified_leads.toLocaleString()}
										</td>
										<td className="py-4">
											{segment.hot_leads.toLocaleString()}
										</td>
										<td className="py-4">
											<Badge variant="outline">
												{segment.conversion_rate}%
											</Badge>
										</td>
										<td className="py-4">
											<Badge variant="secondary">{segment.top_source}</Badge>
										</td>
										<td className="py-4 text-muted-foreground">
											{segment.primary_signal}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

function SummaryCard({
	title,
	value,
	description,
	icon: Icon,
}: {
	title: string;
	value: number;
	description: string;
	icon: ComponentType<{ className?: string }>;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value.toLocaleString()}</div>
				<p className="mt-1 text-muted-foreground text-xs">{description}</p>
			</CardContent>
		</Card>
	);
}
