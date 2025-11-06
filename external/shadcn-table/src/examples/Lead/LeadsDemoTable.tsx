"use client";

import * as React from "react";
import { DataTable } from "../../components/data-table/data-table";
import { DataTableToolbar } from "../../components/data-table/data-table-toolbar";
import { DataTableRowModalCarousel } from "../../components/data-table/data-table-row-modal-carousel";
import { Dialog } from "../../components/ui/dialog";
import { useRowCarousel } from "../../hooks/use-row-carousel";
import { useDataTable } from "../../hooks/use-data-table";

import type { DemoRow } from "./types";
import { leadColumns } from "./columns";
import { makeData } from "./demoData";
import { AIActionsPanel } from "./AIActionsPanel";
import { LeadRowCarouselPanel } from "./LeadRowCarouselPanel";
import { AIDropdown } from "./components/AIDropdown";
import { TopActionsBar } from "./components/TopActionsBar";
import { summarizeRows } from "./utils/leadHelpers";
import type { SkipTraceInit } from "./utils/leadHelpers";

export interface LeadsDemoTableProps {
	/** Called when user wants to add a lead */
	onOpenLeadModal?: (opts?: { initialListMode?: "select" | "create" }) => void;
	/** Called when user wants to open Skip Trace. Provide optional init payload. */
	onOpenSkipTrace?: (init?: SkipTraceInit) => void;
	/** Called to open Create List modal provided by host app */
	onOpenCreateList?: () => void;
	/** Optional area for host app to render its own modals */
	renderModals?: React.ReactNode;
}

export default function LeadsDemoTable({
	onOpenLeadModal,
	onOpenSkipTrace,
	onOpenCreateList,
	renderModals,
}: LeadsDemoTableProps) {
	const [data, setData] = React.useState<DemoRow[]>([]);
	const [query, setQuery] = React.useState("");
	const [aiOpen, setAiOpen] = React.useState(false);
	const [aiOutput, setAiOutput] = React.useState<string>("");
	const [aiRows, setAiRows] = React.useState<DemoRow[]>([]);
	const [leadIndex, setLeadIndex] = React.useState(0);
	const [showAllLeads, setShowAllLeads] = React.useState(false);

	React.useEffect(() => {
		setData(makeData(100));
	}, []);

	const filtered = React.useMemo(() => {
		if (!query.trim()) return data;
		const q = query.toLowerCase();
		return data.filter((r) =>
			[r.list, r.records, r.phone, r.emails, r.socials]
				.map((v) => String(v).toLowerCase())
				.some((s) => s.includes(q)),
		);
	}, [data, query]);

	const pageSize = 8;
	const { table } = useDataTable<DemoRow>({
		data: filtered,
		columns: leadColumns,
		pageCount: Math.max(1, Math.ceil(filtered.length / pageSize)),
		initialState: {
			pagination: { pageIndex: 0, pageSize },
			columnPinning: { left: ["select"], right: ["actions"] },
			columnOrder: [
				"select",
				"list",
				"uploadDate",
				"records",
				"phone",
				"emails",
				"socials",
				"actions",
			],
		},
		enableColumnPinning: true,
		// Do not inject global per-lead columns at all for this list view
		disableGlobalColumns: {
			dnc: true,
			dncSource: true,
			script: true,
			agent: true,
			goal: true,
			timing: true,
		},
	});

	const carousel = useRowCarousel(table, { loop: true });
	React.useEffect(() => {
		if (carousel.open) setLeadIndex(0);
	}, [carousel.open]);

	const getSelectedRows = (): DemoRow[] =>
		table.getFilteredSelectedRowModel().rows.map((r) => r.original as DemoRow);
	const getAllRows = (): DemoRow[] =>
		table.getFilteredRowModel().rows.map((r) => r.original as DemoRow);

	return (
		<main className="container mx-auto max-w-7xl space-y-6 p-6">
			<header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
				<div className="flex-1 space-y-2">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Lead Lists
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						Manage lead data, run A/B tests, download lists, and launch campaigns
						with advanced sorting and search.
					</p>
				</div>
				<button
					type="button"
					onClick={() => {
						if (typeof window !== "undefined") {
							window.dispatchEvent(new Event("dealScale:helpFab:show"));
						}
					}}
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					aria-label="Show help and demo"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
						<path d="M12 17h.01" />
					</svg>
				</button>
			</header>

			<DataTable<DemoRow>
				table={table}
				className="mt-2"
				onRowClick={(row) => {
					setLeadIndex(0);
					carousel.openAt(row);
				}}
			>
				<DataTableToolbar
					table={table}
					className="mb-3 md:mb-4"
					showFilters={false}
					showViewOptions={true}
					viewPosition="row1"
				>
					<input
						aria-label="Global search"
						placeholder="Search all visible fields..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="h-8 w-64 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
					/>
					<AIDropdown
						table={table}
						setAiOpen={setAiOpen}
						setAiRows={setAiRows}
						getSelectedRows={getSelectedRows}
						getAllRows={getAllRows}
					/>
					<TopActionsBar
						table={table}
						onOpenLeadModal={onOpenLeadModal}
						onOpenCreateList={onOpenCreateList}
						onOpenSkipTrace={onOpenSkipTrace}
						data={data}
						getSelectedRows={getSelectedRows}
						getAllRows={getAllRows}
					/>
				</DataTableToolbar>
			</DataTable>

			<Dialog open={aiOpen} onOpenChange={setAiOpen}>
				<AIActionsPanel
					aiRows={aiRows}
					setAiOutput={setAiOutput}
					getAllRows={getAllRows}
					summarizeRows={summarizeRows}
				/>
			</Dialog>

			{/* Row/Lead modal carousel */}
			<DataTableRowModalCarousel
				table={table}
				open={carousel.open}
				onOpenChange={carousel.setOpen}
				index={carousel.index}
				setIndex={carousel.setIndex}
				rows={carousel.rows}
				onPrev={() => {
					const current = carousel.rows[carousel.index]?.original as
						| DemoRow
						| undefined;
					const len = current?.leads.length ?? 0;
					if (!len) return;
					setLeadIndex((i) => (i - 1 + len) % len);
				}}
				onNext={() => {
					const current = carousel.rows[carousel.index]?.original as
						| DemoRow
						| undefined;
					const len = current?.leads.length ?? 0;
					if (!len) return;
					setLeadIndex((i) => (i + 1) % len);
				}}
				title={(row) => row.original.list}
				description={(row) =>
					`Uploaded: ${new Date(row.original.uploadDate).toLocaleDateString()}`
				}
				counter={(row) =>
					showAllLeads
						? `All (${row.original.leads.length})`
						: `${leadIndex + 1} / ${row.original.leads.length}`
				}
				render={(row) => (
					<LeadRowCarouselPanel
						row={row.original}
						leadIndex={leadIndex}
						setLeadIndex={setLeadIndex}
						showAllLeads={showAllLeads}
						setShowAllLeads={setShowAllLeads}
						onOpenSkipTrace={(init) => {
							// Close the carousel first to avoid overlay interaction issues
							carousel.setOpen(false);
							// Defer opening Skip Trace so the Dialog unmounts cleanly first
							setTimeout(() => {
								const allLists = Array.from(
									new Set(getAllRows().map((r) => r.list)),
								);
								const payload =
									init?.type === "single"
										? {
												...init,
												availableListNames: allLists,
												listName: row.original.list,
											}
										: init;
								onOpenSkipTrace?.(payload);
							}, 0);
						}}
						setData={setData}
					/>
				)}
			/>

			{renderModals}
		</main>
	);
}
