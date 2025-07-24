import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { CellContext } from "@tanstack/react-table";

export function LeadNameCell({ row }: CellContext<LeadTypeGlobal, unknown>) {
	const address = row.original.properties?.[0].address?.street;

	return (
		<div>
			<strong>
				{row.original.firstName} {row.original.lastName}
			</strong>
			{address && (
				<div className="text-muted-foreground text-sm">{address}</div>
			)}
		</div>
	);
}
