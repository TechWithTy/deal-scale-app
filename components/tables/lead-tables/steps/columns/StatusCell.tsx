import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { CellContext } from "@tanstack/react-table";

export const statusOptions = [
	{
		value: "new",
		label: "New Lead",
		bgColor: "bg-blue-600",
		textColor: "text-white",
	},
	{
		value: "contacted",
		label: "Contacted",
		bgColor: "bg-yellow-600",
		textColor: "text-white",
	},
	{
		value: "closed",
		label: "Closed",
		bgColor: "bg-green-600",
		textColor: "text-white",
	},
	{
		value: "lost",
		label: "Lost",
		bgColor: "bg-red-600",
		textColor: "text-white",
	},
];

export function StatusCell({ row }: CellContext<LeadTypeGlobal, unknown>) {
	// todo: connect status change handler via props or context
	return (
		<select
			className="rounded px-2 py-1 text-sm"
			value={row.original.status}
			// onChange={...} // todo: implement handler
			disabled
		>
			{statusOptions.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
}
