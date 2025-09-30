"use client";

import type * as React from "react";
import type { Table, Row } from "@tanstack/react-table";
import {
	DataTableRowModalCarousel,
	type DataTableRowModalCarouselProps,
} from "../../../../components/data-table/data-table-row-modal-carousel";
import type { CallCampaign } from "../../../../../../../types/_dashboard/campaign";
import { Badge } from "../../../../components/ui/badge";
import { PlaybackCell } from "./PlaybackCell";
import { ActivityLineGraphContainer } from "../../../../../../activity-graph/components";
import type {
	ActivityDataPoint,
	ChartConfigLocal,
} from "../../../../../../activity-graph/types";

// Mock campaign activity data - replace with real data
const generateCampaignActivityData = (
	campaign: CallCampaign,
): ActivityDataPoint[] => {
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
	const rows = table.getRowModel().rows;

	const carouselProps: DataTableRowModalCarouselProps<CallCampaign> = {
		table,
		open,
		onOpenChange: setOpen,
		index,
		setIndex,
		rows,
		onPrev: () => {
			const current = rows[index]?.original;
			const len = current?.callInformation.length ?? 0;
			if (len === 0) return;
			setDetailIndex((value) => (value - 1 + len) % len);
		},
		onNext: () => {
			const current = rows[index]?.original;
			const len = current?.callInformation.length ?? 0;
			if (len === 0) return;
			setDetailIndex((value) => (value + 1) % len);
		},
		title: (row: Row<CallCampaign>) => row.original.name,
		description: (row: Row<CallCampaign>) =>
			`Started: ${new Date(row.original.startDate).toLocaleDateString()}`,
		counter: (row: Row<CallCampaign>) => {
			const len = row.original.callInformation.length;
			if (len === 0) return "0 / 0";
			return `${Math.min(detailIndex + 1, len)} / ${len}`;
		},
		render: (row: Row<CallCampaign>) => {
			const info = row.original.callInformation;
			if (info.length === 0) {
				return <div className="text-muted-foreground">No calls</div>;
			}
			const safeIndex = Math.min(detailIndex, info.length - 1);
			const current = info[safeIndex];
			if (!current) {
				return <div className="text-muted-foreground">Call details unavailable</div>;
			}
			const response = current.callResponse ?? {};
			const provider = response.phoneCallProvider ?? "-";
			const transport = response.phoneCallTransport ?? "-";
			const callStatus = response.status ?? "-";
			const started = response.startedAt
				? new Date(response.startedAt.toString()).toLocaleString()
				: "-";
			const ended = response.endedAt
				? new Date(response.endedAt.toString()).toLocaleString()
				: "-";
			const cost =
				typeof response.costBreakdown?.total === "number"
					? response.costBreakdown.total
					: typeof response.cost === "number"
						? response.cost
						: undefined;
			const summary = response.analysis?.summary ?? "";
			const transfer = row.original.transfer;
			const transferBreakdown = row.original.transferBreakdown ?? {};
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
								const entries = Object.entries(transferBreakdown).filter(
									(entry): entry is [string, number] =>
										typeof entry[1] === "number" && entry[1] > 0,
								);
								const total =
									transfersCount || entries.reduce((acc, [, value]) => acc + value, 0);
								if (total === 0) {
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
		},
		activityRender: (row: Row<CallCampaign>) => {
			const campaign = row.original;

			const activityData = generateCampaignActivityData(campaign);

			const totalCalls = campaign.calls || 0;
			const totalTexts = Math.floor(totalCalls * 0.3);
			const totalEmails = Math.floor(totalCalls * 0.2);
			const totalSocial = Math.floor(totalCalls * 0.15);

			return (
				<div className="space-y-4">
					<div className="text-center">
						<h3 className="font-semibold text-lg">Campaign Activity</h3>
						<p className="text-muted-foreground text-sm">
							View real-time activity and performance metrics for "
							{campaign.name}"
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<div className="rounded-lg border bg-card p-4">
							<div className="font-bold text-2xl text-primary">
								{totalCalls}
							</div>
							<div className="text-muted-foreground text-sm">Total Calls</div>
						</div>
						<div className="rounded-lg border bg-card p-4">
							<div className="font-bold text-2xl text-primary">
								{totalTexts}
							</div>
							<div className="text-muted-foreground text-sm">Texts Sent</div>
						</div>
						<div className="rounded-lg border bg-card p-4">
							<div className="font-bold text-2xl text-primary">
								{totalEmails}
							</div>
							<div className="text-muted-foreground text-sm">Emails Sent</div>
						</div>
						<div className="rounded-lg border bg-card p-4">
							<div className="font-bold text-2xl text-primary">
								{totalSocial}
							</div>
							<div className="text-muted-foreground text-sm">
								Social Engagements
							</div>
						</div>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<h3 className="mb-4 font-semibold text-lg">Activity Trends</h3>
						<ActivityLineGraphContainer
							data={activityData}
							config={campaignActivityConfig}
							defaultLines={["calls", "texts", "emails", "social"]}
							defaultRange="7d"
							title=""
							description=""
						/>
					</div>

					<div className="rounded-lg border bg-card p-4">
						<h4 className="mb-2 font-medium">Campaign Details</h4>
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
								<span className="ml-2 font-medium">
									{campaign.inQueue || 0}
								</span>
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
		},
	};

	return <DataTableRowModalCarousel {...carouselProps} />;
}
