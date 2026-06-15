import { MessageSquare } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "../../components/ui/tooltip";
import { getPrimarySocialUrl } from "./LeadCard";
import { formatLeadDossier, formatLeadDossierSummary } from "./leadDetailUtils";
import type { DemoLead, DemoRow } from "./types";
import type { LeadListFilterState } from "./utils/leadListFilters";

export type LeadPageSize = 10 | 20 | 30 | 40 | 50 | "all";

const LEAD_PAGE_SIZE_OPTIONS: LeadPageSize[] = [10, 20, 30, 40, 50, "all"];

const STATUS_FILTERS: Array<LeadListFilterState["status"]> = [
	"all",
	"New Lead",
	"Contacted",
	"Qualified",
	"Do Not Contact",
];

const VERIFICATION_FILTERS: Array<{
	value: LeadListFilterState["verification"];
	label: string;
}> = [
	{ value: "all", label: "All verification" },
	{ value: "phone", label: "Phone verified" },
	{ value: "email", label: "Email verified" },
	{ value: "address", label: "Address verified" },
	{ value: "social", label: "Social verified" },
];

function buildSingleInit(lead: DemoLead, listName?: string) {
	const name = (lead.name || "").trim().split(/\s+/);
	return {
		type: "single" as const,
		firstName: name[0] ?? "",
		lastName: name.slice(1).join(" "),
		address: lead.address,
		email: lead.email,
		phone: lead.phone,
		socialMedia: getPrimarySocialUrl(lead),
		listName,
	};
}

export function LeadContactActions({
	lead,
	row,
	onOpenSkipTrace,
}: {
	lead?: DemoLead;
	row: DemoRow;
	onOpenSkipTrace?: (options: { type: "single" }) => void;
}) {
	return (
		<div className="flex flex-wrap items-center justify-end gap-2 text-xs">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						disabled={!lead}
						onClick={async (event) => {
							event.stopPropagation();
							if (lead) {
								await navigator.clipboard.writeText(formatLeadDossier(lead));
							}
						}}
						aria-label="Copy social dossier"
					>
						<MessageSquare className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent
					side="top"
					sideOffset={8}
					className="z-[100] max-w-80 whitespace-normal break-words"
				>
					<div className="text-left text-xs leading-5">
						{lead ? formatLeadDossierSummary(lead) : "No lead data"}
					</div>
				</TooltipContent>
			</Tooltip>
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={!lead}
				onClick={() => {
					if (lead) onOpenSkipTrace?.(buildSingleInit(lead, row.list));
				}}
			>
				Skip Trace
			</Button>
		</div>
	);
}

export function LeadFilterControls({
	filters,
	activeFilterCount,
	leadPageSize,
	setLeadPageSize,
	onChange,
	onReset,
	onSkipTraceList,
}: {
	filters: LeadListFilterState;
	activeFilterCount: number;
	leadPageSize: LeadPageSize;
	setLeadPageSize: (pageSize: LeadPageSize) => void;
	onChange: (next: Partial<LeadListFilterState>) => void;
	onReset: () => void;
	onSkipTraceList?: () => void;
}) {
	return (
		<div className="rounded-md border border-primary/30 bg-background p-3 shadow-sm">
			<div className="mb-2 flex items-center justify-between gap-3">
				<label
					htmlFor="lead-list-modal-search"
					className="font-medium text-foreground text-sm"
				>
					Search leads
				</label>
				{activeFilterCount > 0 && (
					<span className="text-muted-foreground text-xs">
						{activeFilterCount} active filter
						{activeFilterCount === 1 ? "" : "s"}
					</span>
				)}
			</div>
			<input
				id="lead-list-modal-search"
				type="search"
				aria-label="Search leads in this list"
				placeholder="Search by name, address, phone, email, or social profile"
				value={filters.query}
				onChange={(event) => onChange({ query: event.target.value })}
				className="mb-3 block h-11 w-full rounded-md border-2 border-primary/60 bg-card px-3 font-medium text-foreground text-sm shadow-inner outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
			/>
			<div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3">
				<div className="min-w-0 space-y-1">
					<label
						className="block text-muted-foreground text-xs"
						htmlFor="lead-list-status-filter"
					>
						Status
					</label>
					<Select
						value={filters.status}
						onValueChange={(value) =>
							onChange({ status: value as LeadListFilterState["status"] })
						}
					>
						<SelectTrigger
							id="lead-list-status-filter"
							className="h-9 w-full min-w-0 overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{STATUS_FILTERS.map((status) => (
								<SelectItem key={status} value={status}>
									{status === "all" ? "All statuses" : status}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="min-w-0 space-y-1">
					<label
						className="block text-muted-foreground text-xs"
						htmlFor="lead-list-verification-filter"
					>
						Verification
					</label>
					<Select
						value={filters.verification}
						onValueChange={(value) =>
							onChange({
								verification: value as LeadListFilterState["verification"],
							})
						}
					>
						<SelectTrigger
							id="lead-list-verification-filter"
							className="h-9 w-full min-w-0 overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{VERIFICATION_FILTERS.map((filter) => (
								<SelectItem key={filter.value} value={filter.value}>
									{filter.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="min-w-0 space-y-1">
					<label
						htmlFor="lead-list-page-size"
						className="block text-muted-foreground text-xs"
					>
						Leads per page
					</label>
					<Select
						value={String(leadPageSize)}
						onValueChange={(value) =>
							setLeadPageSize(
								value === "all" ? "all" : (Number(value) as LeadPageSize),
							)
						}
					>
						<SelectTrigger
							id="lead-list-page-size"
							className="h-9 w-full min-w-0 overflow-hidden [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LEAD_PAGE_SIZE_OPTIONS.map((option) => (
								<SelectItem key={option} value={String(option)}>
									{option === "all" ? "All" : option}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onReset}
					disabled={activeFilterCount === 0}
					className="w-full sm:w-auto"
				>
					Reset
				</Button>
				<Button
					type="button"
					variant="default"
					size="sm"
					onClick={onSkipTraceList}
					className="w-full sm:w-auto"
				>
					Skip Trace List
				</Button>
			</div>
		</div>
	);
}
