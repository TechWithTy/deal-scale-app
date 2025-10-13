"use client";

import * as React from "react";
import { faker } from "@faker-js/faker";
import type { Row } from "@tanstack/react-table";

import { DataTable } from "../components/data-table/data-table";
import { useDataTable } from "../hooks/use-data-table";
import { useRowCarousel } from "../hooks/use-row-carousel";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import type { CallCampaign } from "../../../../types/_dashboard/campaign";

import {
	generateCallCampaignData,
	mockCallCampaignData,
} from "../../../../constants/_faker/calls/callCampaign";
import { buildTextCampaignColumns } from "./Phone/text/utils/buildColumns";
import { TextRowCarousel } from "./Phone/text/components/TextRowCarousel";
import { SummaryCard } from "./Phone/text/components/SummaryCard";
import { AIDialog } from "./Phone/text/components/AIDialog";
import { ActionBar } from "./Phone/text/components/ActionBar";
import { TextTableToolbar } from "./Phone/text/components/TextTableToolbar";
import {
        getSelectedRowsFromTable,
        getAllRowsFromTable,
        summarizeRows,
} from "./Phone/text/utils/helpers";
import { generateSampleTextMessage } from "../../../../constants/_faker/texts/texts";
import { useCampaignRowFocus } from "@/components/campaigns/utils/useCampaignRowFocus";
type ParentTab = "calls" | "text" | "social" | "directMail";

interface TextCampaignsDemoTableProps {
        onNavigate?: (tab: ParentTab) => void;
        campaignId?: string | null;
        onCampaignSelect?: (id: string) => void;
        initialCampaigns?: CallCampaign[];
}

export default function TextCampaignsDemoTable({
        onNavigate,
        campaignId = null,
        onCampaignSelect,
        initialCampaigns,
}: TextCampaignsDemoTableProps) {
        const [data, setData] = React.useState<CallCampaign[]>(() => initialCampaigns ?? []);
	const [query, setQuery] = React.useState("");
	const [aiOpen, setAiOpen] = React.useState(false);
	const [aiOutput, setAiOutput] = React.useState<string>("");
	const [aiRows, setAiRows] = React.useState<CallCampaign[]>([]);
	const [detailIndex, setDetailIndex] = React.useState(0);
	const campaignType = "Text" as const;
	const [dateChip, setDateChip] = React.useState<"today" | "7d" | "30d">(
		"today",
	);
	// Filter state variables removed - now handled globally
	// Per-row feedback for completed campaigns
	const [feedback, setFeedback] = React.useState<
		Record<string, { sentiment: "up" | "down" | null; note: string }>
	>({});

        React.useEffect(() => {
                if (initialCampaigns && initialCampaigns.length > 0) {
                        setData(initialCampaigns);
                        return;
                }
                const d =
                        (mockCallCampaignData as CallCampaign[] | false) ||
                        generateCallCampaignData();
                const withMessages = d.map((row) => {
                        const count = faker.number.int({ min: 1, max: 5 });
                        const msgs = Array.from({ length: count }, () =>
                                generateSampleTextMessage(),
                        );
                        if (msgs.length === 0) msgs.push(generateSampleTextMessage());
                        const biasApple = faker.number.int({ min: 1, max: 100 }) <= 60;
                        if (biasApple) {
                                msgs[0].service = "iMessage";
                                msgs[0].appleDevice = true;
                                msgs[0].provider = msgs[0].provider ?? "sendblue";
                        }
                        return { ...row, messages: msgs };
                });
                setData(withMessages as unknown as CallCampaign[]);
        }, [initialCampaigns]);

	const columns = React.useMemo(() => buildTextCampaignColumns(), []);

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
				"name",
				"device",
				"status",
				"transfer",
				"transfers",
				"startDate",
				"sent",
				"delivered",
				"failed",
				"totalMessages",
				"lastMessageAt",
				"download",
			],
		},
		enableColumnPinning: true,
		meta: {
			onPause: (row: CallCampaign) => {
				setData((prev) =>
					prev.map((r) =>
						r.name === row.name ? { ...r, status: "paused" } : r,
					),
				);
			},
			onResume: (row: CallCampaign) => {
				setData((prev) =>
					prev.map((r) =>
						r.name === row.name ? { ...r, status: "queued" } : r,
					),
				);
			},
			onStop: (row: CallCampaign) => {
				setData((prev) =>
					prev.map((r) =>
						r.name === row.name ? { ...r, status: "completed" } : r,
					),
				);
			},
			getFeedback: (row: CallCampaign) => feedback[row.name],
			onToggleFeedback: (row: CallCampaign, s: "up" | "down") => {
				const key = row.name;
				setFeedback((prev) => {
					const cur = prev[key] ?? { sentiment: null, note: "" };
					const nextSentiment = cur.sentiment === s ? null : s;
					return { ...prev, [key]: { ...cur, sentiment: nextSentiment } };
				});
			},
			onFeedbackNoteChange: (row: CallCampaign, note: string) => {
				const key = row.name;
				setFeedback((prev) => {
					const cur = prev[key] ?? { sentiment: null, note: "" };
					return { ...prev, [key]: { ...cur, note } };
				});
			},
		},
	});

        const carousel = useRowCarousel(table, { loop: true });

        // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
        React.useEffect(() => {
                if (carousel.open) setDetailIndex(0);
        }, [carousel.open, carousel.index]);

        const rowIdResolver = React.useCallback(
                (row: Row<CallCampaign>) => (row.original as CallCampaign).id,
                [],
        );

        const handleRowFocused = React.useCallback(
                (row: Row<CallCampaign>) => {
                        setDetailIndex(0);
                        carousel.openAt(row);
                        const targetId = rowIdResolver(row);
                        if (!targetId) return;
                        requestAnimationFrame(() => {
                                const element = document.querySelector<HTMLTableRowElement>(
                                        `[data-row-id="${targetId}"]`,
                                );
                                element?.scrollIntoView({ behavior: "smooth", block: "center" });
                        });
                },
                [carousel, rowIdResolver],
        );

        const { focusedRowId, status } = useCampaignRowFocus<CallCampaign>({
                campaignId,
                table,
                resolveRowId: rowIdResolver,
                onRowFocused: handleRowFocused,
        });

        // helpers moved to ./Phone/text/utils/helpers

        return (
		<main className="container mx-auto max-w-7xl space-y-6 p-6">
			<header className="space-y-1">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">
							Text Campaigns
						</h1>
						<p className="text-muted-foreground text-sm">
							Search, selection, filtering, and details.
						</p>
					</div>
					{/* Navigation and Create Campaign buttons removed - now handled globally */}
				</div>
			</header>

			<SummaryCard
				table={table}
				campaignType={campaignType}
				dateChip={dateChip}
				setDateChip={setDateChip}
			/>

                        {status === "not-found" && campaignId ? (
                                <Alert variant="destructive">
                                        <AlertTitle>Campaign not found</AlertTitle>
                                        <AlertDescription>
                                                We couldn&apos;t locate a campaign with ID {campaignId} in the
                                                Text table.
                                        </AlertDescription>
                                </Alert>
                        ) : null}

                        <DataTable<CallCampaign>
                                table={table}
                                className="mt-2"
                                focusedRowId={focusedRowId ?? undefined}
                                getRowId={rowIdResolver}
                                onRowClick={(row) => {
                                        const id = rowIdResolver(row);
                                        if (id) onCampaignSelect?.(id);
                                        setDetailIndex(0);
                                        carousel.openAt(row);
                                }}
				actionBar={
					<ActionBar
						table={table}
						onRunSelected={() => {
							const rows = getSelectedRowsFromTable(table);
							if (rows.length === 0) return;
							setAiRows(rows);
							setAiOpen(true);
						}}
						onRunAll={() => {
							const rows = getAllRowsFromTable(table);
							setAiRows(rows);
							setAiOpen(true);
						}}
						onClearSelection={() => table.resetRowSelection()}
						filename="text-campaigns"
					/>
				}
			>
				<TextTableToolbar
					table={table}
					query={query}
					setQuery={setQuery}
					onRunSelected={() => {
						const rows = getSelectedRowsFromTable(table);
						if (rows.length === 0) return;
						setAiRows(rows);
						setAiOpen(true);
					}}
					onRunAll={() => {
						const rows = getAllRowsFromTable(table);
						setAiRows(rows);
						setAiOpen(true);
					}}
					filename="text-campaigns"
				/>
			</DataTable>

			<AIDialog
				open={aiOpen}
				onOpenChange={setAiOpen}
				aiRows={aiRows}
				aiOutput={aiOutput}
				setAiOutput={setAiOutput}
				summarizeRows={summarizeRows}
			/>

			<TextRowCarousel
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
