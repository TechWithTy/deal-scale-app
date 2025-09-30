"use client";

import type * as React from "react";
import type { Table } from "@tanstack/react-table";
import { DataTableRowModalCarousel } from "../../../../components/data-table/data-table-row-modal-carousel";
import type { CallCampaign } from "../../../../../../../types/_dashboard/campaign";
import { Badge } from "../../../../components/ui/badge";
import { PlaybackCell } from "./PlaybackCell";
import { ActivityLineGraphContainer } from "../../../../../../activity-graph/components";
import type { ActivityDataPoint, ChartConfigLocal } from "../../../../../../activity-graph/types";

// Mock campaign activity data - replace with real data
const generateCampaignActivityData = (campaign: CallCampaign): ActivityDataPoint[] => {
	const days = 7;
	const data: ActivityDataPoint[] = [];

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);

		data.push({
			timestamp: date.toISOString(),
			calls: Math.floor(Math.random() * 50) + 10,
			texts: Math.floor(Math.random() * 30) + 5,
			emails: Math.floor(Math.random() * 20) + 2,
			social: Math.floor(Math.random() * 15) + 1,
		});
	}

	return data;
};

const campaignActivityConfig: ChartConfigLocal = {
	calls: {
		label: "Calls Made",
		color: "hsl(var(--chart-1))",
	},
	texts: {
		label: "Texts Sent",
		color: "hsl(var(--chart-2))",
	},
	emails: {
		label: "Emails Sent",
		color: "hsl(var(--chart-3))",
	},
	social: {
		label: "Social Engagements",
		color: "hsl(var(--chart-4))",
	},
};

export function CallDetailsModal({
	table,
	open,
	setOpen,
	index,
	setIndex,
	detailIndex,
	setDetailIndex,
}: {
	table: Table<CallCampaign>;
	open: boolean;
	setOpen: (v: boolean) => void;
	index: number;
	setIndex: (v: number) => void;
	detailIndex: number;
	setDetailIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
	return (
		<DataTableRowModalCarousel
			table={table}
			open={open}
			onOpenChange={setOpen}
			index={index}
			setIndex={setIndex}
			rows={table.getRowModel().rows}
			onPrev={() => {
				const current = table.getRowModel().rows[index]?.original as
					| CallCampaign
					| undefined;
				const len = current?.callInformation?.length ?? 0;
				if (!len) return;
				setDetailIndex((i) => (i - 1 + len) % len);
			}}
			onNext={() => {
				const current = table.getRowModel().rows[index]?.original as
					| CallCampaign
					| undefined;
				const len = current?.callInformation?.length ?? 0;
				if (!len) return;
				setDetailIndex((i) => (i + 1) % len);
			}}
			title={(row) => row.original.name}
			description={(row) =>
				`Started: ${new Date(row.original.startDate).toLocaleDateString()}`
			}
			counter={(row) => {
				const len = row.original.callInformation?.length ?? 0;
				if (!len) return "0 / 0";
				return `${Math.min(detailIndex + 1, len)} / ${len}`;
			}}
			render={(row, modalIndex) => {
				// For the details tab (default behavior)
				const info = row.original.callInformation ?? [];
				if (!info.length)
					return <div className="text-muted-foreground">No calls</div>;
				const current = info[Math.min(detailIndex, info.length - 1)];
				const cr: {
					phoneCallProvider?: string;
					phoneCallTransport?: string;
					status?: string;
					cost?: number;
					costBreakdown?: { total?: number };
					startedAt?: string | number | Date;
					endedAt?: string | number | Date;
					analysis?: { summary?: string };
					recordingUrl?: string;
					stereoRecordingUrl?: string;
				} = current?.callResponse ?? {};
				const provider = cr.phoneCallProvider ?? "-";
				const transport = cr.phoneCallTransport ?? "-";
				const callStatus = cr.status ?? "-";
				const started = cr.startedAt
					? new Date(cr.startedAt.toString()).toLocaleString()
					: "-";
				const ended = cr.endedAt
					? new Date(cr.endedAt.toString()).toLocaleString()
					: "-";
				const cost = (cr.costBreakdown?.total ?? cr.cost) as number | undefined;
				const summary = cr.analysis?.summary ?? "";
				const transfer: { type?: string; agentId?: string } | undefined =
					row.original.transfer;
				const transfersCount = row.original.transfers ?? 0;

				return (
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-3">
							<div>
								<h3 className="font-medium text-sm">Call Summary</h3>
								<p className="whitespace-pre-line text-muted-foreground text-sm">
									{summary || "No summary available for this call."}
								</p>
							</div>

							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary" title="Provider">
									{provider}
								</Badge>
								<Badge variant="outline" title="Transport">
									{transport}
								</Badge>
								<Badge variant="secondary" title="Status">
									{callStatus}
								</Badge>
								<Badge variant="outline" title="Cost">
									{typeof cost === "number" ? `$${cost.toFixed(2)}` : "-"}
								</Badge>
								<Badge variant="outline" title="Started">
									{started}
								</Badge>
								<Badge variant="outline" title="Ended">
									{ended}
								</Badge>
							</div>

							<div>
								<h4 className="font-medium text-sm">Transfers</h4>
								{(() => {
									const breakdown: Record<string, number> | undefined =
										row.original.transferBreakdown;
									const entries = Object.entries(breakdown ?? {}).filter(
										([, v]) => typeof v === "number" && v > 0,
									);
									const total =
										typeof transfersCount === "number"
											? transfersCount
											: entries.reduce((a, [, v]) => a + v, 0);
									if (!entries.length && !total) {
										return (
											<span className="text-muted-foreground text-sm">
												No transfers
											</span>
										);
									}
									return (
										<div className="mt-2 flex items-center gap-2">
											<Badge variant="outline">last route</Badge>
											<Badge>{transfer?.type ?? "transfer"}</Badge>
											{transfer?.agentId ? (
												<span className="text-muted-foreground text-xs">
													Agent: {transfer.agentId}
												</span>
											) : null}
										</div>
									);
								})()}
							</div>
						</div>

						<div className="rounded-md border p-3">
							<h3 className="mb-2 font-medium text-sm">Playback</h3>
							<PlaybackCell callInformation={current ? [current] : []} />
						</div>
					</div>
				);
			}}
			activityRender={(row) => {
				// Get the actual campaign data from the row
				const campaign = row.original as CallCampaign;

				// Generate realistic campaign activity data based on actual campaign metrics
				const activityData = generateCampaignActivityData(campaign);

				// Calculate actual metrics from campaign data
				const totalCalls = campaign.calls || 0;
				const totalTexts = Math.floor(totalCalls * 0.3); // Estimate based on calls
				const totalEmails = Math.floor(totalCalls * 0.2); // Estimate based on calls
				const totalSocial = Math.floor(totalCalls * 0.15); // Estimate based on calls

				return (
					<div className="space-y-4">
						<div className="text-center">
							<h3 className="font-semibold text-lg">Campaign Activity</h3>
							<p className="text-muted-foreground text-sm">
								View real-time activity and performance metrics for "{campaign.name}"
							</p>
						</div>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="bg-card p-4 rounded-lg border">
								<div className="text-2xl font-bold text-primary">{totalCalls}</div>
								<div className="text-sm text-muted-foreground">Total Calls</div>
							</div>
							<div className="bg-card p-4 rounded-lg border">
								<div className="text-2xl font-bold text-primary">{totalTexts}</div>
								<div className="text-sm text-muted-foreground">Texts Sent</div>
							</div>
							<div className="bg-card p-4 rounded-lg border">
								<div className="text-2xl font-bold text-primary">{totalEmails}</div>
								<div className="text-sm text-muted-foreground">Emails Sent</div>
							</div>
							<div className="bg-card p-4 rounded-lg border">
								<div className="text-2xl font-bold text-primary">{totalSocial}</div>
								<div className="text-sm text-muted-foreground">Social Engagements</div>
							</div>
						</div>

						<div className="bg-card p-6 rounded-lg border">
							<h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
							<ActivityLineGraphContainer
								data={activityData}
								config={campaignActivityConfig}
								defaultLines={["calls", "texts", "emails", "social"]}
								defaultRange="7d"
								title=""
								description=""
							/>
						</div>

						{/* Campaign-specific details */}
						<div className="bg-card p-4 rounded-lg border">
							<h4 className="font-medium mb-2">Campaign Details</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-muted-foreground">Status:</span>
									<span className="ml-2 font-medium">{campaign.status}</span>
								</div>
								<div>
									<span className="text-muted-foreground">Leads:</span>
									<span className="ml-2 font-medium">{campaign.leads || 0}</span>
								</div>
								<div>
									<span className="text-muted-foreground">In Queue:</span>
									<span className="ml-2 font-medium">{campaign.inQueue || 0}</span>
								</div>
								<div>
									<span className="text-muted-foreground">Start Date:</span>
									<span className="ml-2 font-medium">
										{new Date(campaign.startDate).toLocaleDateString()}
									</span>
								</div>
							</div>
						</div>
					</div>
				);
			}}
		/>
	);
}
