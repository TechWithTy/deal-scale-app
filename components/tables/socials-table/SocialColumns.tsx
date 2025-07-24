import { Checkbox } from "@/components/ui/checkbox";
import type {
	SocialAction,
	SocialMediaCampaign,
} from "@/types/_dashboard/campaign";
import type { ColumnDef } from "@tanstack/react-table";
import DownloadCell from "./steps/columns/DownloadCell";
import PlatformCell from "./steps/columns/PlatformCell";
import StatusCell from "./steps/columns/StatusCell";

// Main social columns definition using subcomponents
export const socialColumns: ColumnDef<SocialMediaCampaign>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label="Select all"
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: "name",
		header: "Campaign Name",
		cell: ({ row }) => <span className="text-left">{row.original.name}</span>,
	},
	{
		accessorKey: "platform",
		header: "Platform",
		cell: ({ row }) => (
			<PlatformCell actions={row.original.actions as SocialAction[]} />
		),
	},
	{
		accessorKey: "senderHandle",
		header: "Sender Handle",
		cell: ({ row }) => <span>{row.original.senderHandle}</span>,
	},
	{
		accessorKey: "startDate",
		header: "Start Date",
		cell: ({ row }) => (
			<span>{new Date(row.original.startDate).toLocaleDateString()}</span>
		),
	},
	{
		accessorKey: "endDate",
		header: "End Date",
		cell: ({ row }) => (
			<span>{new Date(row.original.endDate).toLocaleDateString()}</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => <StatusCell status={row.original.status} />,
	},
	{
		accessorKey: "download",
		header: "Download",
		cell: ({ row }) => <DownloadCell row={row} />,
	},
];

export default socialColumns;
