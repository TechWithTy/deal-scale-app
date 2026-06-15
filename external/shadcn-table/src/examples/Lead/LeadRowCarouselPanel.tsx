"use client";

import * as React from "react";
import type { LeadPageSize } from "./LeadPanelControls";
import { LeadSearchResults } from "./LeadSearchResults";
import type { DemoRow } from "./types";
import {
	type LeadListFilterState,
	filterLeadList,
} from "./utils/leadListFilters";

interface LeadRowCarouselPanelProps {
	row: DemoRow;
	leadPageSize: LeadPageSize;
	filters: LeadListFilterState;
	onOpenSkipTrace?: (options: { type: "single" }) => void;
	setData: React.Dispatch<React.SetStateAction<DemoRow[]>>;
}

export function LeadRowCarouselPanel({
	row,
	leadPageSize,
	filters,
	onOpenSkipTrace,
	setData,
}: LeadRowCarouselPanelProps) {
	const [expandedLeadIds, setExpandedLeadIds] = React.useState<Set<string>>(
		new Set(),
	);
	const filteredLeads = React.useMemo(
		() => filterLeadList(row.leads, filters),
		[row.leads, filters],
	);
	const visibleLeads = React.useMemo(() => {
		if (leadPageSize === "all") return filteredLeads;
		return filteredLeads.slice(0, leadPageSize);
	}, [filteredLeads, leadPageSize]);

	return (
		<div className="max-h-[70vh] overflow-y-auto pr-1">
			<div className="space-y-4">
				<LeadSearchResults
					leads={visibleLeads}
					row={row}
					rowId={row.id}
					expandedLeadIds={expandedLeadIds}
					setExpandedLeadIds={setExpandedLeadIds}
					onOpenSkipTrace={onOpenSkipTrace}
					setData={setData}
				/>
			</div>
		</div>
	);
}
