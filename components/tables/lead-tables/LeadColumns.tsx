// * Lead Table Columns Definition - Cleaned for Biome & TypeScript
import { Checkbox } from "@/components/ui/checkbox";
import type { LeadTypeGlobal } from "@/types/_dashboard/leads";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { EmailCell } from "./steps/columns/EmailCell";
import { EmailDownloadCell } from "./steps/columns/EmailDownloadCell";
import { LeadNameCell } from "./steps/columns/LeadNameCell";
import { SocialsCell } from "./steps/columns/SocialsCell";
import { StatusCell } from "./steps/columns/StatusCell";

// * Main columns for the Lead Table (React Table)
/**
 * leadListColumns is an array of ColumnDef objects, defining the structure and behavior of each column in the Lead Table.
 * Each ColumnDef object contains properties for the column's id, header, cell renderer, and other configuration options.
 */
export const leadListColumns: ColumnDef<LeadTypeGlobal>[] = [
	{
		id: "select",
		// * Select-all and row-select checkboxes for bulk actions
		/**
		 * The header property is a function that returns a JSX element to be rendered as the column header.
		 * In this case, it renders a Checkbox component that allows the user to select all rows on the current page.
		 */
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value: boolean | "indeterminate") =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label="Select all"
			/>
		),
		/**
		 * The cell property is a function that returns a JSX element to be rendered as the cell content for each row.
		 * In this case, it renders a Checkbox component that allows the user to select individual rows.
		 */
		cell: ({ row }: { row: Row<LeadTypeGlobal> }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value: boolean | "indeterminate") =>
					row.toggleSelected(!!value)
				}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: "Lead",
		/**
		 * The cell property is a function that returns a JSX element to be rendered as the cell content for each row.
		 * In this case, it renders a LeadNameCell component, which is a custom cell renderer for the "name" column.
		 */
		cell: (ctx) => <LeadNameCell {...ctx} />,
	},
	{
		accessorKey: "phone",
		header: "Phone",
		cell: ({ row }: { row: Row<LeadTypeGlobal> }) => (
			<span>{row.original.phone}</span>
		),
	},
	{
		accessorKey: "email",
		header: "Email Address",
		cell: (ctx) => <EmailCell {...ctx} />,
	},
	{
		accessorKey: "socials",
		header: "Social Media Profiles",
		cell: SocialsCell,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: StatusCell,
	},
	{
		accessorKey: "download",
		header: "Download",
		cell: EmailDownloadCell,
	},
];

// * Columns for Excel export only (must match exportLeadsTableDataToExcel signature)
export const leadExcelColumns = [
	{ header: "First Name", accessorKey: "firstName" },
	{ header: "Last Name", accessorKey: "lastName" },
	{ header: "Phone", accessorKey: "phone" },
	{ header: "Email", accessorKey: "email" },
	{ header: "Status", accessorKey: "status" },
	{ header: "Address", accessorKey: "address1" },
	// todo: Add more fields as needed for Excel export
];
