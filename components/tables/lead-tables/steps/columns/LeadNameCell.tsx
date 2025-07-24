import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { CellContext } from "@tanstack/react-table";

export function LeadNameCell({ row }: CellContext<LeadTypeGlobal, unknown>) {
	return (
		<div>
			<strong>
				{row.original.firstName} {row.original.lastName}
			</strong>
			<div className="text-muted-foreground text-sm">
				{row.original.address1}
			</div>
		</div>
	);
}
