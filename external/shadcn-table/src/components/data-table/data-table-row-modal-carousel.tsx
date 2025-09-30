"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import type { Row, Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ActivityLineGraphContainer } from "../../../../activity-graph/components";
import type {
	ChartConfigLocal,
	ActivityDataPoint,
} from "../../../../activity-graph/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";

// Helper function to safely check if data is campaign data
const isCampaignData = (data: unknown): data is { calls: number; leads: number; inQueue: number } => {
	return (
		data !== null &&
		typeof data === 'object' &&
		'calls' in data &&
		'leads' in data &&
		'inQueue' in data
	);
};

// Define interface for comparison lead
interface ComparisonLead {
	id: string;
	name: string;
	contactInfo?: { firstName?: string };
}

// Generate activity data for multiple leads with different interaction types
const generateActivityDataForLeads = (
	leads: { id: string; name?: string }[],
): ActivityDataPoint[] => {
	const monthsAgoIso = (n: number): string => {
		const d = new Date();
		d.setMonth(d.getMonth() - n);
		d.setDate(1);
		d.setHours(0, 0, 0, 0);
		return d.toISOString();
	};

	// Generate base data points
	const baseData = [
		{ timestamp: monthsAgoIso(5), calls: 12, texts: 8, social: 3 },
		{ timestamp: monthsAgoIso(4), calls: 19, texts: 15, social: 5 },
		{ timestamp: monthsAgoIso(3), calls: 8, texts: 12, social: 2 },
		{ timestamp: monthsAgoIso(2), calls: 25, texts: 20, social: 7 },
		{ timestamp: monthsAgoIso(1), calls: 22, texts: 18, social: 6 },
		{ timestamp: monthsAgoIso(0), calls: 30, texts: 25, social: 9 },
	];

	// For each lead, create slightly different activity patterns
	return leads.flatMap((lead, index) => {
		const leadMultiplier = 0.5 + index * 0.3; // Different activity levels per lead
		return baseData.map((dataPoint) => ({
			...dataPoint,
			[`${lead.id}_calls`]: Math.floor(dataPoint.calls * leadMultiplier),
			[`${lead.id}_texts`]: Math.floor(dataPoint.texts * leadMultiplier),
			[`${lead.id}_social`]: Math.floor(dataPoint.social * leadMultiplier),
		}));
	});
};

const activityConfigMultiLead: ChartConfigLocal = {
	calls: { label: "Calls", color: "hsl(var(--chart-1))" },
	texts: { label: "Texts", color: "hsl(var(--chart-2))" },
	social: { label: "Social", color: "hsl(var(--chart-3))" },
};

const generateActivityData = (leadId: string): ActivityDataPoint[] => {
	const monthsAgoIso = (n: number): string => {
		const d = new Date();
		d.setMonth(d.getMonth() - n);
		d.setDate(1);
		d.setHours(0, 0, 0, 0);
		return d.toISOString();
	};

	return [
		{ timestamp: monthsAgoIso(5), calls: 12, emails: 8, meetings: 3 },
		{ timestamp: monthsAgoIso(4), calls: 19, emails: 15, meetings: 5 },
		{ timestamp: monthsAgoIso(3), calls: 8, emails: 12, meetings: 2 },
		{ timestamp: monthsAgoIso(2), calls: 25, emails: 20, meetings: 7 },
		{ timestamp: monthsAgoIso(1), calls: 22, emails: 18, meetings: 6 },
		{ timestamp: monthsAgoIso(0), calls: 30, emails: 25, meetings: 9 },
	];
};

const activityConfig: ChartConfigLocal = {
	calls: { label: "Calls", color: "hsl(var(--chart-1))" },
	emails: { label: "Emails", color: "hsl(var(--chart-2))" },
	meetings: { label: "Meetings", color: "hsl(var(--chart-3))" },
};

export interface DataTableRowModalCarouselProps<TData> {
	table: Table<TData>; // TODO: Evaluate if this prop is actually needed
	open: boolean;
	onOpenChange: (open: boolean) => void;
	index: number;
	setIndex: (i: number) => void;
	rows: Row<TData>[];
	onPrev: () => void;
	onNext: () => void;
	title?: (row: Row<TData>, index: number) => React.ReactNode;
	description?: (row: Row<TData>, index: number) => React.ReactNode;
	render: (row: Row<TData>, index: number) => React.ReactNode;
	actions?: (row: Row<TData>, index: number) => React.ReactNode;
	counter?: (row: Row<TData>, index: number) => React.ReactNode;
	activityRender?: (row: Row<TData>, index: number) => React.ReactNode;
	comparisonLeads?: ComparisonLead[]; // Optional comparison leads for better customization
}

export function DataTableRowModalCarousel<TData>(
	props: DataTableRowModalCarouselProps<TData>,
) {
	const {
		open,
		onOpenChange,
		rows,
		index,
		onPrev,
		onNext,
		title,
		description,
		render,
		actions,
		counter,
		activityRender,
		comparisonLeads: propComparisonLeads,
	} = props;

	// Sample comparison leads (could come from API or user input)
	const sampleComparisonLeads = propComparisonLeads || [
		{ id: "comp_1", name: "Alex" },
		{ id: "comp_2", name: "Jordan" },
		{ id: "comp_3", name: "Taylor" },
	];

	const row = rows[index];
	const [comparisonLeads, setComparisonLeads] = useState<string[]>([]);

	// Combine selected leads with comparison leads for data generation
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const allLeadsForData = useMemo(() => {
		if (!row?.original) return [];
		const rowLeads = (row.original as { leads?: { id: string; name?: string; contactInfo?: { firstName?: string } }[] })?.leads;
		const safeRowLeads = Array.isArray(rowLeads) ? rowLeads : [];
		// Convert leads to the expected format for generateActivityDataForLeads
		const convertedLeads = safeRowLeads.map((lead) => ({
			id: lead.id,
			name: lead.name || lead.contactInfo?.firstName || `Lead ${lead.id}`,
		}));
		const allLeads = [...convertedLeads, ...sampleComparisonLeads] as {
			id: string;
			name?: string;
		}[];
		// Remove duplicates based on ID
		return allLeads.filter(
			(lead, index, self) => index === self.findIndex((l) => l.id === lead.id),
		);
	}, [row]);

	// Combine comparison leads for chart data
	const allChartLeads = useMemo(() => {
		return comparisonLeads;
	}, [comparisonLeads]);

	// Generate activity data for all leads in the current row
	const allActivityData = useMemo(() => {
		if (allLeadsForData.length === 0) return [];
		return generateActivityDataForLeads(allLeadsForData);
	}, [allLeadsForData]);

	// Filter activity data based on comparison leads
	const filteredActivityData = useMemo(() => {
		if (allChartLeads.length === 0) return [];

		return allActivityData.map((dataPoint) => {
			const filtered: ActivityDataPoint = { timestamp: dataPoint.timestamp };

			// Include only data for comparison leads
			for (const leadId of allChartLeads) {
				filtered[`${leadId}_calls`] = dataPoint[`${leadId}_calls`] || 0;
				filtered[`${leadId}_texts`] = dataPoint[`${leadId}_texts`] || 0;
				filtered[`${leadId}_social`] = dataPoint[`${leadId}_social`] || 0;
			}

			return filtered;
		});
	}, [allActivityData, allChartLeads]);

	// Generate dynamic config based on comparison leads
	const dynamicActivityConfig = useMemo(() => {
		if (!row?.original) return {};
		const config: ChartConfigLocal = {};

		allChartLeads.forEach((leadId, index) => {
			const leads = (row.original as { leads?: { id: string; name?: string; contactInfo?: { firstName?: string } }[] })?.leads;
			const safeLeads = Array.isArray(leads) ? leads : [];
			const comparisonLead = sampleComparisonLeads.find((l) => l.id === leadId);
			const lead =
				safeLeads.find(
					(l: {
						id: string;
						contactInfo?: { firstName?: string };
						name?: string;
					}) => l.id === leadId,
				) || comparisonLead;
			const colorIndex = (index % 3) + 1; // Cycle through chart colors

			config[`${leadId}_calls`] = {
				label: `${lead?.contactInfo?.firstName || lead?.name || `Lead ${leadId}`} - Calls`,
				color: "hsl(var(--chart-1))",
			};
			config[`${leadId}_texts`] = {
				label: `${lead?.contactInfo?.firstName || lead?.name || `Lead ${leadId}`} - Texts`,
				color: "hsl(var(--chart-2))",
			};
			config[`${leadId}_social`] = {
				label: `${lead?.contactInfo?.firstName || lead?.name || `Lead ${leadId}`} - Social`,
				color: "hsl(var(--chart-3))",
			};
		});

		return config;
	}, [allChartLeads, row, sampleComparisonLeads]);

	// Get available lines for selected leads
	const availableLines = useMemo(() => {
		return allChartLeads.flatMap((leadId) => [
			`${leadId}_calls`,
			`${leadId}_texts`,
			`${leadId}_social`,
		]);
	}, [allChartLeads]);

	React.useEffect(() => {
		if (!open) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") onNext();
			if (e.key === "ArrowLeft") onPrev();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [open, onNext, onPrev]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden border border-border bg-card text-foreground shadow-xl">
				<DialogHeader className="border-border border-b pt-6 pr-6 pb-4 pl-6">
					<DialogTitle className="flex items-center gap-2 font-semibold text-xl">
						{row && title ? title(row, index) : "Lead Details"}
						{row && (
							<span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary text-xs">
								{index + 1} of {rows.length}
							</span>
						)}
					</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto px-6 py-4">
					<Tabs defaultValue="details" className="h-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="details">Lead Details</TabsTrigger>
							<TabsTrigger value="activity">Activity</TabsTrigger>
						</TabsList>

						<TabsContent value="details" className="mt-4 space-y-4">
							{row ? (
								render(row, index)
							) : (
								<div className="flex h-32 items-center justify-center">
									<div className="text-center text-muted-foreground">
										<div className="mb-2 text-4xl">📋</div>
										<p>No lead data available</p>
									</div>
								</div>
							)}
						</TabsContent>

					<TabsContent value="activity" className="mt-4">
						<div className="space-y-4">
							{activityRender && row
								? activityRender(row, index)
								: (() => {
									// Check if this is campaign data
									const isCampaign = isCampaignData(row?.original);

									if (isCampaign) {
										// Campaign-specific activity content
										const campaign = row.original as {
											calls?: number;
											leads?: number;
											inQueue?: number;
											dnc?: number;
											status?: string;
											startDate?: string;
											name?: string;
											callerNumber?: string;
											textStats?: {
												sent?: number;
												delivered?: number;
												failed?: number;
											};
											platform?: string;
										};

										return (
											<>
												<div className="text-center">
													<h3 className="font-semibold text-lg">
														Campaign Activity
													</h3>
													<p className="text-muted-foreground text-sm">
														View{" "}
														{campaign.callerNumber
															? "call"
															: campaign.textStats
																? "text"
																: campaign.platform
																	? "social"
																	: "email"}{" "}
														campaign metrics for "{campaign.name || "Campaign"}"
													</p>
												</div>

												<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
													<div className="rounded-lg border bg-card p-4">
														<div className="font-bold text-2xl text-primary">
															{campaign.calls || 0}
														</div>
														<div className="text-muted-foreground text-sm">
															Total Calls
														</div>
													</div>
													<div className="rounded-lg border bg-card p-4">
														<div className="font-bold text-2xl text-primary">
															{campaign.leads || 0}
														</div>
														<div className="text-muted-foreground text-sm">
															Leads Generated
														</div>
													</div>
													<div className="rounded-lg border bg-card p-4">
														<div className="font-bold text-2xl text-primary">
															{campaign.inQueue || 0}
														</div>
														<div className="text-muted-foreground text-sm">
															In Queue
														</div>
													</div>
													<div className="rounded-lg border bg-card p-4">
														<div className="font-bold text-2xl text-primary">
															{campaign.dnc || 0}
														</div>
														<div className="text-muted-foreground text-sm">
															DNC Count
														</div>
													</div>
												</div>

												<div className="rounded-lg border bg-card p-4">
													<h4 className="mb-2 font-medium">Campaign Status</h4>
													<div className="flex flex-wrap gap-2">
														<span className="rounded-full bg-primary/10 px-2 py-1 text-primary text-xs">
															{campaign.status || "Unknown Status"}
														</span>
														<span className="rounded-full bg-muted px-2 py-1 text-muted-foreground text-xs">
															Started:{" "}
															{campaign.startDate
																? new Date(
																		campaign.startDate,
																	).toLocaleDateString()
																: "Unknown Date"}
														</span>
													</div>
												</div>
											</>
										);
									}

									// Default lead activity content (existing logic)
									return (
										<>
											<div className="text-center">
												<h3 className="font-semibold text-lg">
													Activity Overview
												</h3>
												<p className="text-muted-foreground text-sm">
													Select leads to view their activity timeline
												</p>
											</div>

											{/* Comparison Leads Selection */}
											<div className="space-y-3">
												<h4 className="font-medium text-muted-foreground text-sm">
													Compare With
												</h4>
												<div className="flex flex-wrap gap-2">
													{sampleComparisonLeads.map((lead) => (
														<button
															key={lead.id}
															type="button"
															onClick={() => {
																if (comparisonLeads.includes(lead.id)) {
																	setComparisonLeads((prev) =>
																		prev.filter((id) => id !== lead.id),
																	);
																} else {
																	setComparisonLeads((prev) => [
																		...prev,
																		lead.id,
																	]);
																}
															}}
															className={`inline-flex items-center rounded-full border px-3 py-1 font-medium text-xs transition-colors ${
																comparisonLeads.includes(lead.id)
																	? "border-secondary bg-secondary text-secondary-foreground"
																	: "border-border bg-muted/50 text-muted-foreground hover:bg-muted/80"
															}`}
														>
															{lead.name}
														</button>
													))}
												</div>
											</div>

											{/* Activity Chart */}
											{allChartLeads.length > 0 && (
												<ActivityLineGraphContainer
													data={filteredActivityData}
													config={dynamicActivityConfig}
													defaultLines={availableLines.slice(0, 12)} // Show up to 12 lines max
													defaultRange="30d"
													title="Lead Activity Trends"
													description={`Showing activity for ${allChartLeads.length} lead${allChartLeads.length > 1 ? "s" : ""} (${comparisonLeads.length} comparison)`}
												/>
											)}

											{allChartLeads.length === 0 && (
												<div className="py-8 text-center text-muted-foreground">
													<div className="mb-2 text-4xl">📊</div>
													<p>
														Select one or more leads to view their activity
														timeline
													</p>
												</div>
											)}
										</>
									);
								})()}
						</div>
					</TabsContent>
					</Tabs>
				</div>
				<div className="border-border border-t bg-muted/30 px-6 py-4">
					<div className="flex items-center justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="gap-2"
						>
							✕ Close
						</Button>
						<div className="flex items-center gap-2">
							{actions && row && actions(row, index)}
							<div className="flex gap-1">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={onPrev}
									disabled={index === 0}
									aria-label="Previous"
									className="gap-1.5"
								>
									← Prev
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={onNext}
									disabled={index === rows.length - 1}
									aria-label="Next"
									className="gap-1.5"
								>
									Next →
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
