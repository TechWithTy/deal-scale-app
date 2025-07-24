import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { CellContext } from "@tanstack/react-table";

export function EmailCell({ row }: CellContext<LeadTypeGlobal, unknown>) {
	const email = row.original.email;
	return email ? (
		<a href={`mailto:${email}`} className="text-blue-500 hover:underline">
			{email}
		</a>
	) : (
		<span className="text-gray-500">No Email</span>
	);
}
