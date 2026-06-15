import { Button } from "../../components/ui/button";
import { LeadExpandedTabs } from "./LeadExpandedTabs";
import { LeadContactActions } from "./LeadPanelControls";
import type { DemoLead, DemoRow } from "./types";

interface LeadSearchResultsProps {
	leads: DemoLead[];
	row: DemoRow;
	rowId: string;
	expandedLeadIds: Set<string>;
	setExpandedLeadIds: (ids: Set<string>) => void;
	onOpenSkipTrace?: (options: { type: "single" }) => void;
	setData: React.Dispatch<React.SetStateAction<DemoRow[]>>;
}

function getLeadId(lead: DemoLead) {
	return String(lead.id);
}

export function LeadSearchResults({
	leads,
	row,
	rowId,
	expandedLeadIds,
	setExpandedLeadIds,
	onOpenSkipTrace,
	setData,
}: LeadSearchResultsProps) {
	const allExpanded =
		leads.length > 0 &&
		leads.every((lead) => expandedLeadIds.has(getLeadId(lead)));

	const toggleLead = (lead: DemoLead) => {
		const id = getLeadId(lead);
		if (expandedLeadIds.has(id)) {
			setExpandedLeadIds(new Set());
		} else {
			setExpandedLeadIds(new Set([id]));
		}
	};

	const setAllExpanded = (expanded: boolean) => {
		setExpandedLeadIds(
			expanded ? new Set(leads.map((lead) => getLeadId(lead))) : new Set(),
		);
	};

	if (leads.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
				No leads match the current search and filters.
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<p className="font-medium text-muted-foreground text-xs">
					{leads.length} matching lead{leads.length === 1 ? "" : "s"}
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setAllExpanded(!allExpanded)}
				>
					{allExpanded ? "Collapse all" : "Expand all"}
				</Button>
			</div>
			{leads.map((lead, index) => {
				const leadId = getLeadId(lead);
				const isExpanded = expandedLeadIds.has(leadId);

				return (
					<div key={leadId} className="rounded-lg border border-border bg-card">
						<div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="min-w-0">
								<p className="font-medium text-foreground text-sm">
									{index + 1}. {lead.name}
								</p>
								<p className="truncate text-muted-foreground text-xs">
									{lead.address}
								</p>
								<p className="truncate text-muted-foreground text-xs">
									{lead.phone} - {lead.email}
								</p>
							</div>
							<div className="flex flex-wrap items-center justify-end gap-2">
								<LeadContactActions
									lead={lead}
									row={row}
									onOpenSkipTrace={onOpenSkipTrace}
								/>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => toggleLead(lead)}
								>
									{isExpanded ? "Collapse" : "Expand"}
								</Button>
							</div>
						</div>
						{isExpanded ? (
							<div className="border-border border-t p-3">
								<LeadExpandedTabs lead={lead} rowId={rowId} setData={setData} />
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
}
