"use client";

import * as React from "react";
import { DataTable } from "../../components/data-table/data-table";
import { DataTableRowModalCarousel } from "../../components/data-table/data-table-row-modal-carousel";
import { DataTableToolbar } from "../../components/data-table/data-table-toolbar";
import { Dialog } from "../../components/ui/dialog";
import { useDataTable } from "../../hooks/use-data-table";
import { useRowCarousel } from "../../hooks/use-row-carousel";

import { AIActionsPanel } from "./AIActionsPanel";
import { LeadFilterControls, type LeadPageSize } from "./LeadPanelControls";
import { LeadRowCarouselPanel } from "./LeadRowCarouselPanel";
import { leadColumns } from "./columns";
import { AIDropdown } from "./components/AIDropdown";
import { TopActionsBar } from "./components/TopActionsBar";
import { makeData } from "./demoData";
import type { DemoRow } from "./types";
import {
	computeAvailableFields,
	getRowLeadCount,
	summarizeRows,
} from "./utils/leadHelpers";
import type { SkipTraceInit } from "./utils/leadHelpers";
import {
	type LeadListFilterState,
	filterLeadList,
} from "./utils/leadListFilters";

const DEFAULT_LEAD_LIST_PAGE_SIZE = 10;
const EMPTY_LEAD_LIST_FILTERS: LeadListFilterState = {
	query: "",
	status: "all",
	verification: "all",
};

export interface LeadsDemoTableProps {
	apiRows?: DemoRow[] | null;
	apiStatus?: React.ReactNode;
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
	apiRows,
	apiStatus,
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
	const [leadPageSize, setLeadPageSize] = React.useState<LeadPageSize>(
		DEFAULT_LEAD_LIST_PAGE_SIZE,
	);
	const [leadListFilters, setLeadListFilters] =
		React.useState<LeadListFilterState>(EMPTY_LEAD_LIST_FILTERS);

	React.useEffect(() => {
		setData(apiRows?.length ? apiRows : makeData(100));
	}, [apiRows]);

	const filtered = React.useMemo(() => {
		if (!query.trim()) return data;
		const q = query.toLowerCase();
		return data.filter((r) =>
			[r.list, r.records, r.phone, r.emails, r.socials]
				.map((v) => String(v).toLowerCase())
				.some((s) => s.includes(q)),
		);
	}, [data, query]);

	const { table } = useDataTable<DemoRow>({
		data: filtered,
		columns: leadColumns,
		pageCount: Math.max(
			1,
			Math.ceil(filtered.length / DEFAULT_LEAD_LIST_PAGE_SIZE),
		),
		initialState: {
			pagination: { pageIndex: 0, pageSize: DEFAULT_LEAD_LIST_PAGE_SIZE },
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
		manualPagination: false,
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
		if (carousel.open) {
			setLeadIndex(0);
			setLeadListFilters(EMPTY_LEAD_LIST_FILTERS);
		}
	}, [carousel.open]);

	const getSelectedRows = (): DemoRow[] =>
		table.getFilteredSelectedRowModel().rows.map((r) => r.original as DemoRow);
	const getAllRows = (): DemoRow[] =>
		table.getFilteredRowModel().rows.map((r) => r.original as DemoRow);
	const getActiveFilterCount = (filters: LeadListFilterState) =>
		(filters.query.trim() ? 1 : 0) +
		(filters.status !== "all" ? 1 : 0) +
		(filters.verification !== "all" ? 1 : 0);
	const activeLeadListFilterCount = getActiveFilterCount(leadListFilters);
	const updateLeadListFilters = (next: Partial<LeadListFilterState>) => {
		setLeadListFilters((current) => ({ ...current, ...next }));
	};
	const resetLeadListFilters = () => {
		setLeadListFilters(EMPTY_LEAD_LIST_FILTERS);
	};
	const getVisibleLeadCount = (row: DemoRow) => {
		const filteredLeads = filterLeadList(row.leads, leadListFilters);
		return leadPageSize === "all"
			? filteredLeads.length
			: Math.min(Number(leadPageSize), filteredLeads.length);
	};
	const openSkipTraceFromModal = (row: DemoRow, init?: SkipTraceInit) => {
		setLeadPageSize(DEFAULT_LEAD_LIST_PAGE_SIZE);
		setLeadListFilters(EMPTY_LEAD_LIST_FILTERS);
		setLeadIndex(0);
		carousel.setOpen(false);
		setTimeout(() => {
			const payload =
				init?.type === "single"
					? {
							...init,
							availableLeadCount: 1,
							availableLists: [{ name: row.list, count: 1 }],
							listName: row.list,
						}
					: init;
			onOpenSkipTrace?.(payload);
		}, 0);
	};

	return (
		<main className="container mx-auto max-w-7xl space-y-6 p-6">
			<header
				className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left"
				data-tour="lead-list-workspace-header"
			>
				<div className="flex-1 space-y-2">
					<h1 className="font-bold text-3xl text-foreground tracking-tight">
						Lead Lists
					</h1>
					<p className="text-muted-foreground text-sm leading-relaxed">
						Manage lead data, run A/B tests, download lists, and launch
						campaigns with advanced sorting and search.
					</p>
					{apiStatus ? (
						<div className="text-muted-foreground text-xs">{apiStatus}</div>
					) : null}
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
						aria-hidden="true"
						focusable="false"
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

			<div data-tour="lead-list-data-table">
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
							data-tour="lead-list-search"
						/>
						<div data-tour="lead-list-ai-actions">
							<AIDropdown
								table={table}
								setAiOpen={setAiOpen}
								setAiRows={setAiRows}
								getSelectedRows={getSelectedRows}
								getAllRows={getAllRows}
							/>
						</div>
						<div data-tour="lead-list-actions">
							<TopActionsBar
								table={table}
								onOpenLeadModal={onOpenLeadModal}
								onOpenCreateList={onOpenCreateList}
								onOpenSkipTrace={onOpenSkipTrace}
								data={data}
								getSelectedRows={getSelectedRows}
								getAllRows={getAllRows}
							/>
						</div>
					</DataTableToolbar>
				</DataTable>
			</div>

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
				showContentTabs={false}
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
					leadPageSize === "all"
						? `All (${row.original.leads.length})`
						: `${Math.min(Number(leadPageSize), row.original.leads.length)} / ${row.original.leads.length}`
				}
				headerContent={(row) => {
					const filteredLeads = filterLeadList(
						row.original.leads,
						leadListFilters,
					);
					const visibleLeadCount = getVisibleLeadCount(row.original);
					const hasActiveFilters = activeLeadListFilterCount > 0;
					const availableLeadCount = getRowLeadCount(row.original);

					return (
						<div className="space-y-3">
							<p className="text-muted-foreground text-xs">
								Showing {visibleLeadCount} of {filteredLeads.length} matching
								leads ({row.original.leads.length} total)
								{hasActiveFilters
									? ` (${activeLeadListFilterCount} active)`
									: ""}
							</p>
							<LeadFilterControls
								filters={leadListFilters}
								activeFilterCount={activeLeadListFilterCount}
								leadPageSize={leadPageSize}
								setLeadPageSize={setLeadPageSize}
								onChange={updateLeadListFilters}
								onReset={resetLeadListFilters}
								onSkipTraceList={() =>
									openSkipTraceFromModal(row.original, {
										type: "list",
										availableListNames: [row.original.list],
										availableFields: computeAvailableFields([row.original]),
										availableLeadCount,
										listCounts: {
											[row.original.list]: availableLeadCount,
										},
										availableLists: [
											{
												name: row.original.list,
												count: availableLeadCount,
											},
										],
									})
								}
							/>
						</div>
					);
				}}
				render={(row) => (
					<LeadRowCarouselPanel
						row={row.original}
						leadPageSize={leadPageSize}
						filters={leadListFilters}
						onOpenSkipTrace={(init) =>
							openSkipTraceFromModal(row.original, init)
						}
						setData={setData}
					/>
				)}
			/>

			{renderModals}
		</main>
	);
}
