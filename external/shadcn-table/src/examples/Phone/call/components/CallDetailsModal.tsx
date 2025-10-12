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
import { CampaignActivitySummary } from "../../../../components/data-table/campaign-activity-summary";
import { buildChannelActivityData } from "../../../../components/data-table/activity";

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
			const activity = buildChannelActivityData(row.original);
			if (!activity) {
				return null;
			}
			return <CampaignActivitySummary activity={activity} />;
		},
	};

	return <DataTableRowModalCarousel {...carouselProps} />;
}
