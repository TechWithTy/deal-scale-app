"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "../components/data-table/data-table";
import { DataTableToolbar } from "../components/data-table/data-table-toolbar";
import { DataTableExportButton } from "../components/data-table/data-table-export-button";
import { Input } from "../components/ui/input";
import { useDataTable } from "../hooks/use-data-table";
import { useRowCarousel } from "../hooks/use-row-carousel";
import { SummaryCard, type DateChip } from "./Social/components/SummaryCard";
import { Button } from "../components/ui/button";
import { ActionBar } from "./Social/components/ActionBar";
import { AIDialog } from "./Social/components/AIDialog";
import { summarizeRows } from "./Social/utils/summarize";
import { SocialRowCarousel } from "./Social/components/SocialRowCarousel";
import { buildSocialColumns } from "./Social/utils/buildColumns-refactored";
import { FeatureGuard } from "../../../../components/access/FeatureGuard";
import { CallCampaign } from "../../../../types/_dashboard/campaign";
import CampaignModalMain from "./campaigns/modal/CampaignModalMain";
import { generateSocialCampaignData } from "./Social/utils/mock";

type ParentTab = "calls" | "text" | "social" | "directMail";

export default function SocialCampaignsDemoTable({
	onNavigate,
}: {
	onNavigate?: (tab: ParentTab) => void;
}) {
	const [data, setData] = React.useState<CallCampaign[]>([]);
	const [query, setQuery] = React.useState("");
	const [aiOpen, setAiOpen] = React.useState(false);
	const [aiRows, setAiRows] = React.useState<CallCampaign[]>([]);
	const [createOpen, setCreateOpen] = React.useState(false);
	const campaignType = "Social" as const;
	const [dateChip, setDateChip] = React.useState<"today" | "7d" | "30d">(
		"today",
	);
	// Filter state variables removed - now handled globally
	// Per-row feedback (by id or name)
	const [feedback, setFeedback] = React.useState<
		Record<string, { sentiment: "up" | "down" | null; note: string }>
	>({});
	const getKey = React.useCallback((r: CallCampaign) => r.id ?? r.name, []);

	React.useEffect(() => {
		setData(generateSocialCampaignData());
	}, []);

	const columns = React.useMemo<ColumnDef<CallCampaign>[]>(
		() => buildSocialColumns(),
		[],
	);

	// Filter logic removed - now handled globally
	const filtered = data; // Use all data since filtering is handled globally

	const pageSize = 10;
	const { table } = useDataTable<CallCampaign>({
		data: filtered,
		columns,
		pageCount: Math.max(1, Math.ceil(filtered.length / pageSize)),
		initialState: {
			pagination: { pageIndex: 0, pageSize },
			// Important: "select" must always be the first column (pinned). "feedback" should come immediately after but NOT be pinned/sticky.
			columnPinning: { left: ["select"], right: [] },
			columnOrder: [
				"select",
				"feedback",
				"controls",
				"platform",
				"name",
				"flowTemplate",
				"audience",
				"liSummary",
				"subscribers",
				"growthTools",
				"workflows",
				"progress",
				"calls",
				"inQueue",
				"leads",
				"status",
				"transfer",
				"transfers",
				"canSend",
				"lastSentAt",
				"startDate",
			],
			columnVisibility: {
				canSend: false,
			},
		},
		enableColumnPinning: true,
		// Controls + Feedback used by Social columns
		meta: {
			onPause: (row: CallCampaign) => {
				const key = getKey(row);
				setData((prev) =>
					prev.map((r) => (getKey(r) === key ? { ...r, status: "paused" } : r)),
				);
			},
			onResume: (row: CallCampaign) => {
				const key = getKey(row);
				setData((prev) =>
					prev.map((r) => (getKey(r) === key ? { ...r, status: "queued" } : r)),
				);
			},
			onStop: (row: CallCampaign) => {
				const key = getKey(row);
				setData((prev) =>
					prev.map((r) =>
						getKey(r) === key ? { ...r, status: "completed" } : r,
					),
				);
			},
			getFeedback: (row: CallCampaign) => feedback[getKey(row)],
			onToggleFeedback: (row: CallCampaign, s: "up" | "down") => {
				const key = getKey(row);
				setFeedback((prev) => {
					const cur = prev[key] ?? { sentiment: null, note: "" };
					const nextSentiment = cur.sentiment === s ? null : s;
					return { ...prev, [key]: { ...cur, sentiment: nextSentiment } };
				});
			},
			onFeedbackNoteChange: (row: CallCampaign, note: string) => {
				const key = getKey(row);
				setFeedback((prev) => {
					const cur = prev[key] ?? { sentiment: null, note: "" };
					return { ...prev, [key]: { ...cur, note } };
				});
			},
		},
	});

	const carousel = useRowCarousel(table, { loop: true });

	function getSelectedRows(): CallCampaign[] {
		return table
			.getFilteredSelectedRowModel()
			.rows.map((r) => r.original as CallCampaign);
	}

	function getAllRows(): CallCampaign[] {
		return table
			.getFilteredRowModel()
			.rows.map((r) => r.original as CallCampaign);
	}

	return (
		<main className="container mx-auto max-w-7xl space-y-6 p-6">
			<header className="space-y-1">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Social Campaigns
						</h1>
						<p className="text-muted-foreground text-sm">
							Search, selection, filtering, and details.
						</p>
					</div>
			
				</div>
			</header>
			<SummaryCard
				filtered={filtered}
				campaignType={campaignType}
				dateChip={dateChip}
				setDateChip={setDateChip}
			/>

			<DataTable<CallCampaign>
				table={table}
				className="mt-2"
				onRowClick={(row) => {
					carousel.openAt(row);
				}}
				actionBar={
					<ActionBar
						table={table}
						getSelectedRows={getSelectedRows}
						getAllRows={getAllRows}
						setAiRows={setAiRows}
						setAiOpen={setAiOpen}
					/>
				}
			>
				<DataTableToolbar table={table} className="mb-3 md:mb-4">
					<Input
						aria-label="Global search"
						placeholder="Search campaigns..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="h-8 w-64"
					/>
					{/* Status chips */}
		
					<ActionBar
						table={table}
						getSelectedRows={getSelectedRows}
						getAllRows={getAllRows}
						setAiRows={setAiRows}
						setAiOpen={setAiOpen}
					/>
				</DataTableToolbar>
				<div className="-mt-3 mb-3 md:mb-4">
					<DataTableExportButton
						table={table}
						filename="social-campaigns"
						excludeColumns={["select"]}
					/>
				</div>
			</DataTable>

			<AIDialog
				open={aiOpen}
				onOpenChange={setAiOpen}
				rows={aiRows}
				summarize={summarizeRows}
			/>

			<SocialRowCarousel
				table={table}
				open={carousel.open}
				setOpen={carousel.setOpen}
				index={carousel.index}
				setIndex={carousel.setIndex}
				rows={carousel.rows}
			/>
		</main>
	);
}
